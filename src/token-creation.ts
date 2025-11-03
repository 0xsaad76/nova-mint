import { Connection, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";

import promptSync from "prompt-sync";
import { COMMITMENT, ENDPOINT, getMintAuthority } from "../src/mint-init";

const connection: Connection = new Connection(ENDPOINT, COMMITMENT);

(async function mintTokens() {
  try {
    const mintAmount = 100_000_000_000;
    const prompt = promptSync();

    const mintAuthority = getMintAuthority();

    const mintAddress: string = prompt("Enter your mint address: ");
    const mintPubkey = new PublicKey(mintAddress);

    const walletAddress: string = prompt("Enter wallet(mint owner) address: ");
    const walletPubkey = new PublicKey(walletAddress);

    const aTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection, 
      mintAuthority,
      mintPubkey, 
      walletPubkey
    );

    const txn = await mintTo(
      connection,
      mintAuthority,
      mintPubkey,
      aTokenAccount.address,
      mintAuthority.publicKey,
      mintAmount
    );

    console.log(`🪙 minted ${mintAmount} tokens to ${aTokenAccount.address}`);
    console.log("📜 Txn Signature:", txn);
  } catch (e) {
    console.log("Error minting tokens to token account:", e);
    throw e;
  }
})();
