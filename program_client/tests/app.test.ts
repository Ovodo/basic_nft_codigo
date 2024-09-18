import { start } from "solana-bankrun";
import { PublicKey, Transaction, Keypair } from "@solana/web3.js";
import { burnSendAndConfirm, CslSplTokenPDAs, deriveMetadataPDA } from "..";
import {
  initializeProgram,
  getGemData,
  transfer,
  mintNFT,
  burn,
} from "../lib/bankrun_rpc";
import { it, expect, describe } from "vitest";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

describe("Testing process.rs module", async () => {
  // Initialize the client and Program

  const programId = PublicKey.unique();
  const context = await start([{ name: "validate_basic_nft", programId }], []);
  initializeProgram(programId);
  const client = context.banksClient;
  const feePayer = context.payer;
  const blockhash = context.lastBlockhash;

  // Setup: Create wallets for John and Jane Doe

  const johnDoeWallet = Keypair.generate();
  const janeDoeWallet = Keypair.generate();
  const mint = Keypair.generate();

  // Derive PDAs for both wallets and for gemMetadata

  const [johnDoeATA] = CslSplTokenPDAs.deriveAccountPDA(
    {
      wallet: johnDoeWallet.publicKey,
      mint: mint.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
  );

  const [janeDoeATA] = CslSplTokenPDAs.deriveAccountPDA(
    {
      wallet: janeDoeWallet.publicKey,
      mint: mint.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
  );

  const [gemPub] = deriveMetadataPDA({ mint: mint.publicKey }, programId);

  // Start testing several Edge Cases

  it("should mint an NFT successfully", async () => {
    const transaction = new Transaction().add(
      mintNFT({
        wallet: johnDoeWallet.publicKey,
        color: "Purple",
        rarity: "Rare",
        shortDescription: "Only from the lost temple event",
        feePayer: feePayer.publicKey,
        funding: feePayer.publicKey,
        mint: mint.publicKey,
        owner: johnDoeWallet.publicKey,
      })
    );

    transaction.recentBlockhash = blockhash;
    transaction.sign(feePayer, mint, johnDoeWallet);
    try {
      await client.processTransaction(transaction);
    } catch (error) {
      console.error("Minting Transaction Failed:", error);
      throw error;
    }

    const gem = await getGemData(gemPub, client);
    expect(gem?.assocAccount?.toBase58()).toBe(johnDoeATA.toBase58());
  });

  it(" should Fail to mint an NFT with a duplicate mint key", async () => {
    const duplicateMintTransaction = new Transaction().add(
      mintNFT({
        wallet: johnDoeWallet.publicKey,
        color: "Purple",
        rarity: "Rare",
        shortDescription: "Duplicate mint test",
        feePayer: feePayer.publicKey,
        funding: feePayer.publicKey,
        mint: mint.publicKey, // Using the same mint key
        owner: johnDoeWallet.publicKey,
      })
    );

    duplicateMintTransaction.recentBlockhash = blockhash;
    duplicateMintTransaction.sign(feePayer, mint, johnDoeWallet);

    await expect(
      client.processTransaction(duplicateMintTransaction)
    ).rejects.toThrow();
  });

  it("should transfer an NFT successfully", async () => {
    const transaction = new Transaction().add(
      transfer({
        wallet: janeDoeWallet.publicKey,
        mint: mint.publicKey,
        source: johnDoeATA,
        destination: janeDoeATA,
        feePayer: feePayer.publicKey,
        funding: feePayer.publicKey,
        authority: johnDoeWallet.publicKey,
      })
    );

    transaction.recentBlockhash = blockhash;
    transaction.sign(feePayer, johnDoeWallet);
    try {
      await client.processTransaction(transaction);
    } catch (error) {
      console.error("Transfer Transaction Failed:", error);
      throw error;
    }

    const gem = await getGemData(gemPub, client);
    expect(gem?.assocAccount?.toBase58()).toBe(janeDoeATA.toBase58());
  });

  it("should Fail to transfer to an account no associated with the mint", async () => {
    const uninitializedWallet = Keypair.generate();

    const [uninitializedATA] = CslSplTokenPDAs.deriveAccountPDA(
      {
        wallet: uninitializedWallet.publicKey,
        mint: PublicKey.unique(), // Random mint address
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
    );

    const transaction = new Transaction().add(
      transfer({
        wallet: uninitializedWallet.publicKey,
        mint: mint.publicKey,
        source: janeDoeATA,
        destination: uninitializedATA,
        feePayer: feePayer.publicKey,
        funding: feePayer.publicKey,
        authority: janeDoeWallet.publicKey,
      })
    );

    transaction.recentBlockhash = blockhash;
    transaction.sign(feePayer, janeDoeWallet);

    await expect(client.processTransaction(transaction)).rejects.toThrow();
  });

  it("should Fail to transfer an NFT without a valid signature", async () => {
    const transaction = new Transaction().add(
      transfer({
        wallet: janeDoeWallet.publicKey,
        mint: mint.publicKey,
        source: johnDoeATA,
        destination: janeDoeATA,
        feePayer: feePayer.publicKey,
        funding: feePayer.publicKey,
        authority: johnDoeWallet.publicKey,
      })
    );

    transaction.recentBlockhash = blockhash;
    // Deliberately not signing with johnDoeWallet
    transaction.sign(feePayer);

    await expect(client.processTransaction(transaction)).rejects.toThrow();
  });

  it("should fail to burn an NFT with an unauthorized wallet", async () => {
    const unauthorizedTransaction = new Transaction().add(
      burn({
        feePayer: feePayer.publicKey,
        mint: mint.publicKey,
        owner: janeDoeWallet.publicKey, // Trying to burn Jane's NFT
        wallet: johnDoeWallet.publicKey, // Unauthorized user
      })
    );

    unauthorizedTransaction.recentBlockhash = blockhash;
    unauthorizedTransaction.sign(feePayer);

    await expect(
      client.processTransaction(unauthorizedTransaction)
    ).rejects.toThrow("Signature verification failed");
  });
  it("should burns an NFT successfully", async () => {
    const trans = new Transaction().add(
      burn({
        feePayer: feePayer.publicKey,
        mint: mint.publicKey,
        owner: janeDoeWallet.publicKey,
        wallet: janeDoeWallet.publicKey,
      })
    );

    trans.recentBlockhash = blockhash;
    trans.sign(feePayer, janeDoeWallet);
    try {
      await client.processTransaction(trans);
    } catch (error) {
      console.error("Burn Transaction Failed:", error);
      throw error;
    }

    // Check if the NFT has been burned
    const gem = await getGemData(gemPub, client);
    expect(gem?.assocAccount).toBeUndefined();
  });

  it("should fail to transfer burnt nft", async () => {
    // Attempt to transfer without sufficient balance
    const lowBalanceTransaction = new Transaction().add(
      transfer({
        wallet: janeDoeWallet.publicKey,
        mint: mint.publicKey,
        source: johnDoeATA,
        destination: janeDoeATA,
        feePayer: feePayer.publicKey,
        funding: feePayer.publicKey,
        authority: johnDoeWallet.publicKey,
      })
    );
    lowBalanceTransaction.recentBlockhash = blockhash;
    lowBalanceTransaction.sign(feePayer, johnDoeWallet);

    await expect(
      client.processTransaction(lowBalanceTransaction)
    ).rejects.toThrow("transport transaction error");

    // Edge case: Invalid mint key
    const invalidMintTransaction = new Transaction().add(
      transfer({
        wallet: janeDoeWallet.publicKey,
        mint: new PublicKey(PublicKey.unique()),
        source: johnDoeATA,
        destination: janeDoeATA,
        feePayer: feePayer.publicKey,
        funding: feePayer.publicKey,
        authority: johnDoeWallet.publicKey,
      })
    );

    await expect(
      client.processTransaction(invalidMintTransaction)
    ).rejects.toThrow();
  });
});
