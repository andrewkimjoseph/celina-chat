"use client";

import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatPanel } from "@/components/chat-panel";
import { WalletBalancePanel } from "@/components/wallet-balance-panel";
import { useChats } from "@/hooks/use-chats";
import { useMounted } from "@/hooks/use-mounted";
import { useAccount } from "wagmi";
import { useCallback, useState } from "react";

function AppShellContent() {
  const mounted = useMounted();
  const { address, isConnected } = useAccount();
  const { activeChatId } = useChats();
  const [isLanding, setIsLanding] = useState(false);

  const handleLandingStateChange = useCallback((landing: boolean) => {
    setIsLanding(landing);
  }, []);

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col bg-[var(--canvas)]">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <ChatSidebar
          address={address}
          isConnected={isConnected}
          mounted={mounted}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <WalletBalancePanel
            address={address}
            isConnected={isConnected}
            mounted={mounted}
            variant="mobile-collapsible"
            hiddenOnLanding={isLanding}
          />
          <ChatPanel
            key={activeChatId ?? "loading"}
            address={address}
            isConnected={isConnected}
            mounted={mounted}
            onLandingStateChange={handleLandingStateChange}
          />
        </div>
      </div>
    </div>
  );
}

export function AppShell() {
  return <AppShellContent />;
}
