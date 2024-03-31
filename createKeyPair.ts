import { Cluster, Connection, clusterApiUrl } from '@solana/web3.js';
import { initializeKeypair, airdropSolIfNeeded } from './utils';
import chalk from 'chalk';

/**
 * use airdropsolifneeded if you're testing on devnet.
 *
 * Make sure to change connection network to 'devnet'
 */

const network: Cluster = 'devnet';

const connection = new Connection(clusterApiUrl(network));

async function createKeyPair(connection: Connection) {
  try {
    const keypair = await initializeKeypair(connection);

    console.log(chalk.yellow(`retrieved keypair: ${keypair}`));

    if (network == 'devnet') {
      await airdropSolIfNeeded(keypair, connection);
    }
  } catch (error) {
    console.log(`error occured: ${error}`);
  }
}

createKeyPair(connection);
