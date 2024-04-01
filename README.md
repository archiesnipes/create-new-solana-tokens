# How to create and launch solana meme coin token

This codebase provides pre-built scripts to help you:

- Create token metadata including information about the token name, token symbol, social urls and description.
- Mint tokens to your wallet address
- Revoke mint and freeze authority

The original memecoin creation youtube video tutorial is [here](https://youtu.be/hRz9Gyf9Ukg)

**disclaimer**: Use this code at your own risk as it is here for educational purposes, there is no guarantee of profit! DO NOT use the default solana RPC in production, instead use an RPC provider to ensure reliability, speed and effectiveness of the bot.

A good recommendation is helius labs. You can sign up for free here [helius rpc](https://www.helius.dev/) and use the referal code `3wISAeRX8K` to get 5,000,000 free credits on the paid plan. 1 rpc call is 1 credit.

Once you've signed up, add the `RPC_ENDPOINT` to a `.env` file as per the format in the `.env.example` file.

Prelude:

- Install dependencies: `npm install`
- Copy the `.env.example` file into a new `.env` file.
- create wallet keypair or use existing one. Put secret key as the value of `WALLET_SECRET_KEY` in `.env` file
- As per disclaimer above, replace default rpc endpoints with a rpc provider endpoints.
- To upload token metadata off-chain you can use NFT Storage free here [nft_storage](https://nft.storage/). Once you sign up go to the `api keys` tab and generate a new api key. Then store the api key in `NFT_STORAGE_API_KEY` in your `.env` file.
- Make sure to change network in `constants.ts` as required. It is `devnet`by default, if you want to create a real live token change to `mainnet-beta`.
- in `constants.ts` change the information about your token in the `token_info` variable.
- in the image folder add your token logo as jpeg or png. In `constants.ts` you can change the `imageFile` path and `imageFileName` name.

All scripts are in the package.json.

## Mint token and upload metadata

Run the scripts in your terminal:

- `npm run upload-metadata` to upload metadata information from your `token_info` to the create a off-chain uri.
- Add the `uri` string to your `token_info` variable.
- `npm run mint` to mint tokens to your wallet and upload metadata on-chain. This script will also revoke mint and freeze authority.

Check your wallet to make sure the new tokens have been added.

You need your token address for the next step.

## Create market id and new liquidity pool

The scripts to create market id, create new lp, and burn token are only available to premium users. If you'd like access to these scripts and the full in-depth workshop tutorial, check out the preview video and access link [here](https://www.youtube.com/watch?v=f1hqFeCw2ro)

## Troubleshooting

- airdrop internal error: retry the script with a rpc provider connection instead of default solana connection. If that doesn't work, use a faucet here: [airdrop resources](https://solana.com/developers/guides/getstarted/solana-token-airdrop-and-faucets)

## Contact

For community discussions on sniper bots and creating new tokens:
[![](https://img.shields.io/discord/1201826085655023616?color=5865F2&logo=Discord&style=flat-square)](https://discord.gg/yNS6JpTv)

For any business inquiries, reach out at:

- Telegram: `archiekomik`
