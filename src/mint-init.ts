import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { createMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import dotenv from "dotenv";
import bs58 from "bs58";

dotenv.config();
    export const COMMITMENT = 'confirmed';
    export const ENDPOINT = 'https://api.devnet.solana.com';


    export function getMintAuthority(): Keypair {
      const secret = process.env.MINT_AUTHORITY_SECRET;

      if (secret && secret.trim() !== "") {
        try {
          const secretKey = bs58.decode(secret.trim());
          const keypair = Keypair.fromSecretKey(secretKey);
          console.log("Loaded mint authority from .env");
          return keypair;
        } catch (err) {
          console.error("Invalid secret in .env — creating new keypair");
        }
      }

      const newKeypair = Keypair.generate();
      console.log("No secret found. Generated new mint authority keypair.");
      return newKeypair;
    }

    const connection: Connection = new Connection(ENDPOINT, COMMITMENT);

    async function createTokenMint(mintAuthority: Keypair): Promise<PublicKey> {
    try {
        // await requestAirdrop(connection, mintAuthority);
        let mintPubkey = await createMint(
        connection,
        mintAuthority, // signer
        mintAuthority.publicKey, // account adr that controls minting 
        mintAuthority.publicKey, // account that can freeze token accounts
        6,  // decimal for token
        Keypair.generate(), // keypair  
        {
            commitment: COMMITMENT,
        },
        TOKEN_PROGRAM_ID
        );

       console.log("Token mint created Successfullyy:", mintPubkey.toBase58());
    return mintPubkey;
  } catch (e) {
    console.error("Errror creating token mint:", e);
    throw e;
  }
    }
(async () => {
  const mintAuthority = getMintAuthority();
  console.log("Mint authority:", mintAuthority.publicKey.toBase58());
  await createTokenMint(mintAuthority);
})();
    // https://solana-labs.github.io/solana-program-library/token/js/functions/createMint.html

// MINT_ADDRESS = AYcQZZoTx9rPMNeRDJwhUF7aK7ZMCRhpbZoLcjW4bTtH