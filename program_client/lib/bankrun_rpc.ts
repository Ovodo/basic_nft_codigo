import { BanksClient } from "solana-bankrun";
import * as pda from "./pda";
import * as T from "./types";
import { deserialize, serialize } from "borsh";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  BurnArgs,
  MintArgs,
  TransferArgs,
  ValidateBasicNftInstruction,
} from "./rpc";

let _programId: PublicKey;

// ____________________________________________________-INITIALIZE PROGRAM_ID-______________________________________________

export const initializeProgram = (programId: PublicKey) => {
  _programId = programId;
};

// ____________________________________________________-TOKEN METHODS-______________________________________________

// ------------------------------------------MINT

/**
 * ### Returns a {@link TransactionInstruction}
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} Auto-generated, default fee payer
 * 1. `[writable, signer]` mint: {@link Mint}
 * 2. `[writable]` gem: {@link Gem}
 * 3. `[]` system_program: {@link PublicKey} Auto-generated, for account initialization
 * 4. `[writable, signer]` funding: {@link PublicKey} Funding account (must be a system account)
 * 5. `[writable]` assoc_token_account: {@link PublicKey} Associated token account address to be created
 * 6. `[]` wallet: {@link PublicKey} Wallet address for the new associated token account
 * 7. `[]` token_program: {@link PublicKey} SPL Token program
 * 8. `[signer]` owner: {@link PublicKey} The mint's minting authority.
 * 9. `[]` csl_spl_token_v0_0_0: {@link PublicKey} Auto-generated, CslSplTokenProgram v0.0.0
 * 10. `[]` csl_spl_assoc_token_v0_0_0: {@link PublicKey} Auto-generated, CslSplAssocTokenProgram v0.0.0
 *
 * Data:
 * - color: {@link string}
 * - rarity: {@link string}
 * - short_description: {@link string}
 */

export const mintNFT = (
  args: MintArgs,
  remainingAccounts: Array<PublicKey> = []
): TransactionInstruction => {
  const data = serialize(
    {
      struct: {
        id: "u8",
        color: "string",
        rarity: "string",
        short_description: "string",
      },
    },
    {
      id: ValidateBasicNftInstruction.Mint,
      color: args.color,
      rarity: args.rarity,
      short_description: args.shortDescription,
    }
  );

  const [gemPubkey] = pda.deriveMetadataPDA(
    {
      mint: args.mint,
    },
    _programId
  );
  const [assocTokenAccountPubkey] = pda.CslSplTokenPDAs.deriveAccountPDA(
    {
      wallet: args.wallet,
      tokenProgram: new PublicKey(
        "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
      ),
      mint: args.mint,
    },
    new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
  );

  return new TransactionInstruction({
    data: Buffer.from(data),
    keys: [
      { pubkey: args.feePayer, isSigner: true, isWritable: true },
      { pubkey: args.mint, isSigner: true, isWritable: true },
      { pubkey: gemPubkey, isSigner: false, isWritable: true },
      {
        pubkey: new PublicKey("11111111111111111111111111111111"),
        isSigner: false,
        isWritable: false,
      },
      { pubkey: args.funding, isSigner: true, isWritable: true },
      { pubkey: assocTokenAccountPubkey, isSigner: false, isWritable: true },
      { pubkey: args.wallet, isSigner: false, isWritable: false },
      {
        pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        isSigner: false,
        isWritable: false,
      },
      { pubkey: args.owner, isSigner: true, isWritable: false },
      {
        pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
        isSigner: false,
        isWritable: false,
      },
      ...remainingAccounts.map((e) => ({
        pubkey: e,
        isSigner: false,
        isWritable: false,
      })),
    ],
    programId: _programId,
  });
};

// ------------------------------------------TRANSFER
/**
 * ### Returns a {@link TransactionInstruction}
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} Auto-generated, default fee payer
 * 1. `[]` mint: {@link Mint}
 * 2. `[writable]` gem: {@link Gem}
 * 3. `[writable, signer]` funding: {@link PublicKey} Funding account (must be a system account)
 * 4. `[writable]` assoc_token_account: {@link PublicKey} Associated token account address to be created
 * 5. `[]` wallet: {@link PublicKey} Wallet address for the new associated token account
 * 6. `[]` system_program: {@link PublicKey} System program
 * 7. `[]` token_program: {@link PublicKey} SPL Token program
 * 8. `[writable]` source: {@link PublicKey} The source account.
 * 9. `[writable]` destination: {@link PublicKey} The destination account.
 * 10. `[signer]` authority: {@link PublicKey} The source account's owner/delegate.
 * 11. `[]` csl_spl_assoc_token_v0_0_0: {@link PublicKey} Auto-generated, CslSplAssocTokenProgram v0.0.0
 * 12. `[]` csl_spl_token_v0_0_0: {@link PublicKey} Auto-generated, CslSplTokenProgram v0.0.0
 */

export const transfer = (
  args: TransferArgs,
  remainingAccounts: Array<PublicKey> = []
): TransactionInstruction => {
  const data = serialize(
    {
      struct: {
        id: "u8",
      },
    },
    {
      id: ValidateBasicNftInstruction.Transfer,
    }
  );

  const [gemPubkey] = pda.deriveMetadataPDA(
    {
      mint: args.mint,
    },
    _programId
  );
  const [assocTokenAccountPubkey] = pda.CslSplTokenPDAs.deriveAccountPDA(
    {
      wallet: args.wallet,
      tokenProgram: new PublicKey(
        "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
      ),
      mint: args.mint,
    },
    new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
  );

  return new TransactionInstruction({
    data: Buffer.from(data),
    keys: [
      { pubkey: args.feePayer, isSigner: true, isWritable: true },
      { pubkey: args.mint, isSigner: false, isWritable: false },
      { pubkey: gemPubkey, isSigner: false, isWritable: true },
      { pubkey: args.funding, isSigner: true, isWritable: true },
      { pubkey: assocTokenAccountPubkey, isSigner: false, isWritable: true },
      { pubkey: args.wallet, isSigner: false, isWritable: false },
      {
        pubkey: new PublicKey("11111111111111111111111111111111"),
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        isSigner: false,
        isWritable: false,
      },
      { pubkey: args.source, isSigner: false, isWritable: true },
      { pubkey: args.destination, isSigner: false, isWritable: true },
      { pubkey: args.authority, isSigner: true, isWritable: false },
      {
        pubkey: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        isSigner: false,
        isWritable: false,
      },
      ...remainingAccounts.map((e) => ({
        pubkey: e,
        isSigner: false,
        isWritable: false,
      })),
    ],
    programId: _programId,
  });
};

/**
 * ### Returns a {@link TransactionInstruction}
 * Accounts:
 * 0. `[writable, signer]` fee_payer: {@link PublicKey} Auto-generated, default fee payer
 * 1. `[writable]` mint: {@link Mint}
 * 2. `[writable]` gem: {@link Gem}
 * 3. `[writable]` account: {@link Account} The account to burn from.
 * 4. `[signer]` owner: {@link PublicKey} The account's owner/delegate.
 * 5. `[]` wallet: {@link PublicKey} Wallet address for the new associated token account
 * 6. `[]` token_program: {@link PublicKey} SPL Token program
 * 7. `[]` csl_spl_token_v0_0_0: {@link PublicKey} Auto-generated, CslSplTokenProgram v0.0.0
 */
export const burn = (
  args: BurnArgs,
  remainingAccounts: Array<PublicKey> = []
): TransactionInstruction => {
  const data = serialize(
    {
      struct: {
        id: "u8",
      },
    },
    {
      id: ValidateBasicNftInstruction.Burn,
    }
  );

  const [gemPubkey] = pda.deriveMetadataPDA(
    {
      mint: args.mint,
    },
    _programId
  );
  const [accountPubkey] = pda.CslSplTokenPDAs.deriveAccountPDA(
    {
      wallet: args.wallet,
      tokenProgram: new PublicKey(
        "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
      ),
      mint: args.mint,
    },
    new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
  );

  return new TransactionInstruction({
    data: Buffer.from(data),
    keys: [
      { pubkey: args.feePayer, isSigner: true, isWritable: true },
      { pubkey: args.mint, isSigner: false, isWritable: true },
      { pubkey: gemPubkey, isSigner: false, isWritable: true },
      { pubkey: accountPubkey, isSigner: false, isWritable: true },
      { pubkey: args.owner, isSigner: true, isWritable: false },
      { pubkey: args.wallet, isSigner: false, isWritable: false },
      {
        pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        isSigner: false,
        isWritable: false,
      },
      ...remainingAccounts.map((e) => ({
        pubkey: e,
        isSigner: false,
        isWritable: false,
      })),
    ],
    programId: _programId,
  });
};

// ____________________________________________________-GETTER FUNCTIONS-______________________________________________

export const getGemData = async (
  publicKey: PublicKey,
  bankrun_client: BanksClient
): Promise<T.Gem | undefined> => {
  const buffer = await bankrun_client.getAccount(publicKey);

  if (!buffer) {
    return undefined;
  }

  if (buffer.data.length <= 0) {
    return undefined;
  }

  return T.decodeGem(
    deserialize(T.GemSchema, buffer.data) as Record<string, unknown>
  );
};
