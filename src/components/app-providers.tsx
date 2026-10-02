"use client";

import { ChatProvider } from "@/components/chat/chat-context";
import { TransactionProvider } from "@/components/transactions/transaction-context";
import type { ReactNode } from "react";
import { useAccount } from "wagmi";

export function AppProviders({ children }: { children: ReactNode }) {
  const { address } = useAccount();

  return (
    <TransactionProvider address={address}>
      <ChatProvider address={address} key={address ?? "disconnected"}>
        {children}
      </ChatProvider>
    </TransactionProvider>
  );
}
