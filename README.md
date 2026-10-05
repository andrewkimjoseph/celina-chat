<p align="center">
  <img src="https://raw.githubusercontent.com/andrewkimjoseph/celina/main/assets/celina-banner.svg" alt="Celina — Give your LLM a wallet on Celo">
</p>

# Celina Chat

Wallet chat for the full Celina SDK on Celo mainnet. Every browser-surface tool is available — sends, swaps, Aave, GoodDollar, governance, staking, NFT reads, and raw contract calls. The assistant prepares unsigned steps; you sign them in your wallet.

**Live:** [chat.usecelina.xyz](https://chat.usecelina.xyz)

Deployed as a **Cloudflare Worker** (TanStack Start). It is not an npm package. It depends on an exact `@andrewkimjoseph/celina-sdk` version.

`execute_*` tools, AgentKarma, and Self Agent ID lifecycle (registration, proof refresh, session polling, request signing, and authenticated fetches) stay MCP-only. Those need a server-held key or an in-memory session. Self verification reads (`verify_self_agent`, `get_self_identity`, `lookup_self_agent`, `verify_self_request`) are available in chat.

## Local dev

```bash
npm install
cp .env.example .env.local
# set OPENROUTER_API_KEY and RPC URLs
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
| `VITE_WALLETCONNECT_PROJECT_ID` | Client. RainbowKit / WalletConnect. Public. Inlined at build from `wrangler.jsonc`. |

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

`OPENAI_MODEL` and `OPENROUTER_APP_NAME` are public Worker vars in `wrangler.jsonc`. `VITE_WALLETCONNECT_PROJECT_ID` is listed there too, and Vite inlines it into the client bundle at build time. The Worker runtime binding does not configure the browser by itself. An already-set `VITE_WALLETCONNECT_PROJECT_ID` in the build environment overrides the `wrangler.jsonc` value.

## License

MIT
