import {
  createV1,
  updateV1,
  fetchMetadataFromSeeds,
  findMetadataPda,
  mplTokenMetadata,
  TokenStandard,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  keypairIdentity,
  percentAmount,
  publicKey,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import promptSync from "prompt-sync";
import { ENDPOINT, getMintAuthority } from "./mint-init";

async function createOrUpdateMetadata() {
  const prompt = promptSync();

  const mintAddress: string = prompt("Enter mint address: ");
  const mint = publicKey(mintAddress);

  const umi = createUmi(ENDPOINT).use(mplTokenMetadata()).use(mplToolbox());
  const walletKeypair = getMintAuthority();
  const wallet = umi.eddsa.createKeypairFromSecretKey(
    new Uint8Array(walletKeypair.secretKey)
  );
  umi.use(keypairIdentity(wallet));

  const metadataPda = findMetadataPda(umi, { mint });

  console.log("Metadata PDA:", metadataPda[0].toString());

  const metadataData = {
    name: "Nova",
    symbol: "NVA",
    uri: "https://red-rainy-koi-23.mypinata.cloud/ipfs/bafkreiat3atebtv7budwci77eul3hjjikptqxrh7z3tzqjzllrfhdiyvai",
    sellerFeeBasisPoints: 500,
    tokenStandard: TokenStandard.Fungible,
  };

  try {
    const existing = await fetchMetadataFromSeeds(umi, { mint });
    if (existing) {
      console.log("Metadata exists — updating...");

      const updateTx = await updateV1(umi, {
        mint,
        authority: umi.identity,
        payer: umi.identity,
        data: {
          creators: existing.creators,
          ...metadataData
        },
      }).sendAndConfirm(umi);

      console.log(
        "Metadata updated! Tx:",
        base58.deserialize(updateTx.signature)[0]
      );
      return;
    }
  } catch (err: any) {
    if (err.message?.includes("acc does not exist")) {
      console.log("metadata not  found — creating...");
    } else {
      console.error("metadata err:", err);
    }
  }

  // try {
  //   const createTx = await createV1(umi, {
  //   mint,
  //   authority: umi.identity,
  //   payer: umi.identity,
  //   updateAuthority: umi.identity,
  //   metadata: metadataPda,
  //   name: metadataData.name,
  //   symbol: metadataData.symbol,
  //   uri: metadataData.uri,
  //   sellerFeeBasisPoints: percentAmount(0),
  //   tokenStandard: TokenStandard.Fungible,
  //   }).sendAndConfirm(umi);

  //   console.log(
  //     "Metadata created! Tx:",
  //     base58.deserialize(createTx.signature)[0]
  //   );
  // } catch (err) {
  //   console.error("Error creating metadata:", err);
  // }
}

createOrUpdateMetadata();
