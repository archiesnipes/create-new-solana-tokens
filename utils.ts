import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
} from '@solana/web3.js';
import fs from 'fs';
import dotenv from 'dotenv';
import {
  SPL_ACCOUNT_LAYOUT,
  TOKEN_PROGRAM_ID,
  TokenAccount,
} from '@raydium-io/raydium-sdk';
dotenv.config();

export async function checkSolBalance(connection: Connection, wallet: Keypair) {
  const walletBalance = await connection.getBalance(wallet.publicKey);
  const solBalance = walletBalance / LAMPORTS_PER_SOL;
  console.log(`Wallet Balance: ${solBalance}`);
  return solBalance;
}

export async function initializeKeypair(
  connection: Connection
): Promise<Keypair> {
  let keypair: Keypair;

  if (!process.env.WALLET_SECRET_KEY) {
    console.log('creating new keypair wallet... ');
    keypair = Keypair.generate();
    fs.writeFileSync(
      'keypair.json',
      JSON.stringify({ WALLET_SECRET_KEY: Array.from(keypair.secretKey) })
    );
    console.log(`keypair stored in keypair.json`);
  } else {
    const secret = JSON.parse(process.env.WALLET_SECRET_KEY ?? '');
    const secretKey = Uint8Array.from(secret);
    keypair = Keypair.fromSecretKey(secretKey);
  }

  console.log('PublicKey:', keypair.publicKey.toString());
  return keypair;
}

export async function airdropSolIfNeeded(
  signer: Keypair,
  connection: Connection
) {
  const balance = await connection.getBalance(signer.publicKey);
  console.log('Current balance is', balance / LAMPORTS_PER_SOL);

  if (balance < LAMPORTS_PER_SOL) {
    console.log('Airdropping 1 SOL...');
    const airdropSignature = await connection.requestAirdrop(
      signer.publicKey,
      LAMPORTS_PER_SOL
    );

    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction(
      {
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airdropSignature,
      },
      'finalized'
    );

    const newBalance = await connection.getBalance(signer.publicKey);
    console.log('New balance is', newBalance / LAMPORTS_PER_SOL);
  }
}

export function storeData(dataPath: string, newData: any) {
  fs.readFile(dataPath, (err, fileData) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      return;
    }
    let json;
    try {
      json = JSON.parse(fileData.toString());
    } catch (parseError) {
      console.error(`Error parsing JSON from file: ${parseError}`);
      return;
    }
    json.push(newData);

    fs.writeFile(dataPath, JSON.stringify(json, null, 2), (writeErr) => {
      if (writeErr) {
        console.error(`Error writing file: ${writeErr}`);
      } else {
        console.log(`New token data stored successfully.`);
      }
    });
  });
}
