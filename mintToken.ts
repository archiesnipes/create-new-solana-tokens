import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { base58 } from '@metaplex-foundation/umi/serializers';
import {
  mplTokenMetadata,
  TokenStandard,
  CreateV1InstructionAccounts,
  createAndMint,
  CreateV1InstructionDataArgs,
  MintV1InstructionDataArgs,
} from '@metaplex-foundation/mpl-token-metadata';
import fs from 'fs';
import {
  createGenericFile,
  createSignerFromKeypair,
  generateSigner,
  percentAmount,
  signerIdentity,
} from '@metaplex-foundation/umi';
import dotenv from 'dotenv';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  clusterApiUrl,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { tokenInfo } from './types';
import {
  RPC_ENDPOINT,
  creatorWallet,
  solanaConnection,
  token_info,
} from './constants';
import chalk from 'chalk';
import {
  AuthorityType,
  createSetAuthorityInstruction,
  getMint,
} from '@solana/spl-token';
dotenv.config();

async function mintTokentoOwner(
  rpcEndpoint: string,
  token_info: tokenInfo,
  wallet: Keypair
) {
  try {
    const { uri, token_supply, token_symbol, token_decimals, token_name } =
      token_info;

    if (!token_supply || !token_symbol || !token_decimals || !token_name) {
      throw new Error(
        'Token supply, symbol, decimals, or name must not be empty. Please update token_info in constants.ts'
      );
    }
    const umi = createUmi(rpcEndpoint, 'confirmed').use(mplTokenMetadata());

    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(wallet));

    umi.use(signerIdentity(signer, true));

    const mint = generateSigner(umi);

    console.log(chalk.blue(`mint address, ${mint.publicKey}`));

    const accounts: CreateV1InstructionAccounts = {
      mint: mint,
    };

    const onChainData: CreateV1InstructionDataArgs & MintV1InstructionDataArgs =
      {
        isMutable: true,
        collectionDetails: null,
        name: token_name,
        symbol: token_symbol,
        amount: token_supply * Math.pow(10, token_decimals),
        uri: uri ?? '', //offchain data
        sellerFeeBasisPoints: percentAmount(0),
        creators: null,
        decimals: token_decimals,
        printSupply: null,
      };

    const creation = await createAndMint(umi, {
      tokenStandard: TokenStandard.Fungible,
      ...accounts,
      ...onChainData,
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(creation.signature)[0];

    console.log(
      chalk.green(
        `token ${token_name} created successfully...
    address: ${mint.publicKey}
    signature: ${signature}
    supply: ${token_supply}
    `
      )
    );

    console.log(`||----revoking mint authority -----||`);

    const connection = new Connection(rpcEndpoint, {
      commitment: 'confirmed',
    });

    await revokeMintAuthority(mint.publicKey.toString(), connection, wallet);
  } catch (error) {
    console.log(chalk.red(`error minting token: ${error}`));
  }
}

async function revokeMintAuthority(
  tokenAddress: string,
  connection: Connection,
  wallet: Keypair
) {
  try {
    if (!wallet) {
      throw new Error('Owner wallet keypair not found');
    }

    console.log(`mint address to revoke: ${tokenAddress}`);

    const mintInfo = await getMint(connection, new PublicKey(tokenAddress));
    console.log(mintInfo);
    if (mintInfo.mintAuthority !== null) {
      console.log(`disabling mint and freeze authority...`);

      let tx = new Transaction();

      tx.add(
        createSetAuthorityInstruction(
          new PublicKey(tokenAddress), // mint acocunt || token account
          wallet.publicKey, // current auth
          AuthorityType.MintTokens, // authority type
          null // new auth (you can pass `null` to close it)
        )
      );

      tx.add(
        createSetAuthorityInstruction(
          new PublicKey(tokenAddress), // mint acocunt || token account
          wallet.publicKey, // current auth
          AuthorityType.FreezeAccount, // authority type
          null // new auth (you can pass `null` to close it)
        )
      );

      const signature = await sendAndConfirmTransaction(
        connection,
        tx,
        [wallet],
        {
          skipPreflight: true,
        }
      );

      console.log(`mint and freeze successfully disabled: ${signature}`);
    } else {
      console.log(`mint and freeze authority already disabled`);
    }
  } catch (error) {
    throw new Error(`error in revoke mint authority, ${error}`);
  }
}

mintTokentoOwner(RPC_ENDPOINT, token_info, creatorWallet);
