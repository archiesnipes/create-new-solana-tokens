import { PublicKey } from '@solana/web3.js';
import BN from 'bn.js';

export interface tokenInfo {
  token_name: string;
  token_symbol: string;
  description: string;
  image_info?: uriImage;
  uri?: string;
  token_supply: number;
  token_decimals: number;
  init_sol_amount: number;
}

export interface uriImage {
  image?: string;
  imageFileName?: string;
}
