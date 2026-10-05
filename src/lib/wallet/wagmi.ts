"use client";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  valoraWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { celo } from "viem/chains";
import { http } from "wagmi";

export const wagmiConfig = getDefaultConfig({
  appName: "Celina Chat",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [celo],
  transports: {
    [celo.id]: http(
      import.meta.env.VITE_CELO_RPC_URL ?? "https://forno.celo.org",
    ),
  },
  wallets: [
    {
      groupName: "Recommended",
      wallets: [injectedWallet, metaMaskWallet, valoraWallet, walletConnectWallet],
    },
  ],
  ssr: true,
});
