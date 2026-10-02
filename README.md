<p align="center">
  <img src="https://raw.githubusercontent.com/andrewkimjoseph/celina/main/assets/celina-banner.svg" alt="Celina — Give your LLM a wallet on Celo">
</p>

# Celina Chat

Wallet chat for the full Celina SDK on Celo mainnet. Every browser-surface tool is available — sends, swaps, Aave, GoodDollar, governance, staking, NFT reads, and raw contract calls. The assistant prepares unsigned steps; you sign them in your wallet.

**Live:** [chat.usecelina.xyz](https://chat.usecelina.xyz)

Deployed as a **Cloudflare Worker** (TanStack Start). It is not an npm package. It depends on an exact `@andrewkimjoseph/celina-sdk` version.

`execute_*` tools, Self Agent ID, and AgentKarma stay MCP-only. Those need a server-held key and are not exposed here.

## Local dev

```bash
npm install
cp .env.example .env.local
# set OPENROUTER_API_KEY, RPC URLs, and VITE_WALLETCONNECT_PROJECT_ID
npm run dev
```

Requires Node.js ≥ 20. Vite serves the app on port 3000.

| Variable | Where it is used |
| --- | --- |
| `OPENROUTER_API_KEY` | Server. Chat model via OpenRouter. |
| `OPENAI_MODEL` | Server. Defaults to `openai/gpt-4o-mini`. |
| `OPENROUTER_APP_NAME` | Server. Defaults to `Celina Chat`. |
| `CELO_RPC_URL_MAINNET` | Server. SDK reads and transaction simulation. |
| `ETH_RPC_URL_MAINNET` | Server. ENS resolution. |
| `VITE_WALLETCONNECT_PROJECT_ID` | Client. RainbowKit / WalletConnect. Public. |

## Deploy

Production host: `https://chat.usecelina.xyz` (custom domain in `wrangler.jsonc`).

```bash
npm run build
npx wrangler deploy
```

Set secrets on the Worker (same values as `.env.local`):

```bash
npx wrangler secret put OPENROUTER_API_KEY
npx wrangler secret put CELO_RPC_URL_MAINNET
npx wrangler secret put ETH_RPC_URL_MAINNET
```

`VITE_WALLETCONNECT_PROJECT_ID`, `OPENAI_MODEL`, and `OPENROUTER_APP_NAME` are public and live in `wrangler.jsonc` `vars`.

## License

MIT
