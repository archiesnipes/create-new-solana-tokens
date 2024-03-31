import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { nftStorageUploader } from '@metaplex-foundation/umi-uploader-nft-storage';
import {
  createGenericFile,
  createSignerFromKeypair,
  generateSigner,
  percentAmount,
  signerIdentity,
} from '@metaplex-foundation/umi';
import fs from 'fs';
import base58 from 'bs58';
import dotenv from 'dotenv';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import { Connection, Keypair } from '@solana/web3.js';
import { tokenInfo, uriImage } from './types';
import {
  RPC_ENDPOINT,
  creatorWallet,
  solanaConnection,
  token_info,
} from './constants';
import chalk from 'chalk';
dotenv.config();

async function uploadMetaData(
  rpcEndpoint: string,
  token_info: tokenInfo,
  wallet: Keypair
) {
  try {
    console.log(chalk.blue(`uploading token info to genereate uri...`));

    const { token_symbol, description, token_name, image_info } = token_info;

    if (!token_name || !token_symbol || !description) {
      throw new Error('Token name, symbol, or description must not be empty.');
    }

    const umi = createUmi(rpcEndpoint, 'confirmed').use(mplTokenMetadata());

    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(wallet));

    umi.use(signerIdentity(signer, true));

    if (!process.env.NFT_STORAGE_API_KEY) {
      throw new Error('NFT_STORAGE_API_KEY is not defined in the .env file');
    }

    umi.use(nftStorageUploader({ token: process.env.NFT_STORAGE_API_KEY }));

    let uploadedImageUri = '';

    /**this block will only run if both the image and imagefilename are
     * provided in the token_info
     */
    if (image_info && image_info.image && image_info.imageFileName) {
      const fileBuffer = fs.readFileSync(image_info.image);
      const file = createGenericFile(fileBuffer, image_info.imageFileName, {
        contentType: 'image/jpeg',
      });

      const [imageUri] = await umi.uploader.upload([file], {
        onProgress: (percent) => {
          console.log(`${percent}% uploaded...`);
        },
      });

      console.log(chalk.underline(`image successfully uploaded...`));

      uploadedImageUri = imageUri;
    }

    const uri = await umi.uploader.uploadJson({
      name: token_name,
      symbol: token_symbol,
      description: description, //insert social media
      image: uploadedImageUri,
      /**
       * optional add an extensions object that contains social media urls
       *
       * extensions:{
       *   twitter:
       * website:
       * telegram: }
       */
      // ...
    });

    if (uri !== '') {
      console.log(
        `generated uri:${uri} 
         Save this string in the uri property in token_info`
      );
    } else {
      console.log(`failed to generete uri. Try again later...`);
    }
  } catch (error) {
    console.log(`error occured whilst generating uri, ${error}`);
  }
}

uploadMetaData(RPC_ENDPOINT, token_info, creatorWallet);
