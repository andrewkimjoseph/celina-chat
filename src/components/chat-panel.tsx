"use client";

/**
 * Chat shell: wallet address transport, streaming chat, and tx confirmation card.
 */
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState, useEffect, useRef } from "react";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatMessageList } from "@/components/chat/chat-message-list";
import { formatChatError } from "@/components/chat/chat-utils";
import { useChats } from "@/hooks/use-chats";
import type { PromptGroup } from "@/lib/chat/landing-prompts";
import {
  buildPreparedFlowClientContext,
  getActivePreparedFlowWithMeta,
  isPreparedFlowSigned,
} from "@/lib/tx/prepared-flow";
import { formatFlowSummary } from "@/lib/tx/wallet-error";
import { useQueryClient } from "@tanstack/react-query";
import { useMounted } from "@/hooks/use-mounted";
import { useTransactions } from "@/hooks/use-transactions";
import {
  invalidateWalletBalances,
  useWalletBalances,
} from "@/hooks/use-wallet-balances";
import { formatWalletBalanceSnapshot } from "@/lib/chat-tools/system-prompt";
import {
  type CelesteUIMessage,
  createMessageMetadata,
  messageMetadataSchema,
} from "@/lib/chat/chat-message-metadata";

interface ChatPanelProps {
  address?: `0x${string}`;
  isConnected?: boolean;
  mounted?: boolean;
  onLandingStateChange?: (isLanding: boolean) => void;
}

export function ChatPanel({
  address,
  isConnected: isConnectedProp,
  mounted: mountedProp,
  onLandingStateChange,
}: ChatPanelProps = {}) {
  const mountedInternal = useMounted();
  const mounted = mountedProp ?? mountedInternal;
  const isConnected = isConnectedProp ?? false;
  const queryClient = useQueryClient();
  const { addTransaction } = useTransactions();
  const { data: walletBalances } = useWalletBalances(address);
  const {
    activeChatId,
    activeChat,
    isLoading: isChatLoading,
    saveActiveChat,
  } = useChats();
  const canChat = mounted && isConnected && Boolean(address);
  const [input, setInput] = useState("");
  const [dismissedFlowKey, setDismissedFlowKey] = useState<string | null>(null);
  /** After dismiss, hide confirm cards until the user sends a new message. */
  const [txCardBlockedUntilUserMessage, setTxCardBlockedUntilUserMessage] =
    useState(false);
  const [confirmedFlowHashes, setConfirmedFlowHashes] = useState<
    Record<string, string[]>
  >({});
  const [confirmedFlowTimestamps, setConfirmedFlowTimestamps] = useState<
    Record<string, number>
  >({});
  const hydratedChatIdRef = useRef<string | null>(null);
  const uiStateRef = useRef({
    dismissedFlowKey: null as string | null,
    txCardBlockedUntilUserMessage: false,
    confirmedFlowHashes: {} as Record<string, string[]>,
    confirmedFlowTimestamps: {} as Record<string, number>,
  });

  useEffect(() => {
    if (!activeChatId || !activeChat) {
      return;
    }

    if (hydratedChatIdRef.current === activeChatId) {
      return;
    }

    hydratedChatIdRef.current = activeChatId;
    setDismissedFlowKey(activeChat.dismissedFlowKey);
    setTxCardBlockedUntilUserMessage(activeChat.txCardBlockedUntilUserMessage);
    setConfirmedFlowHashes(activeChat.confirmedFlowHashes);
    setConfirmedFlowTimestamps(activeChat.confirmedFlowTimestamps);
    setInput("");
  }, [activeChatId, activeChat]);

  useEffect(() => {
    uiStateRef.current = {
      dismissedFlowKey,
      txCardBlockedUntilUserMessage,
      confirmedFlowHashes,
      confirmedFlowTimestamps,
    };
  }, [dismissedFlowKey, txCardBlockedUntilUserMessage, confirmedFlowHashes, confirmedFlowTimestamps]);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat<CelesteUIMessage>({
    id: activeChatId ?? undefined,
    messages: activeChat?.messages,
    messageMetadataSchema,
    transport,
    onFinish: ({ messages: finishedMessages, isError }) => {
      if (isError) {
        return;
      }

      void saveActiveChat(finishedMessages, uiStateRef.current);
    },
  });

  const pendingFlowMeta = getActivePreparedFlowWithMeta(messages);
  const flowKey = pendingFlowMeta?.flowKey ?? null;
  const pendingSigned = Boolean(
    pendingFlowMeta &&
      isPreparedFlowSigned(messages, pendingFlowMeta, confirmedFlowHashes),
  );
  const showTxCard = Boolean(
    pendingFlowMeta &&
      flowKey &&
      flowKey !== dismissedFlowKey &&
      !pendingSigned &&
      !txCardBlockedUntilUserMessage,
  );

  function clearTxCardBlock() {
    setTxCardBlockedUntilUserMessage(false);
  }

  function buildChatRequestBody() {
    const contextParts: string[] = [];
    const flowContext = buildPreparedFlowClientContext(messages);
    if (flowContext) {
      contextParts.push(flowContext);
    }
    if (showTxCard && pendingFlowMeta?.flow.summary) {
      contextParts.push(
        `Pending wallet confirm card visible: "${pendingFlowMeta.flow.summary}". User must tap Confirm below.`,
      );
    }

    const balanceSnapshot = formatWalletBalanceSnapshot(walletBalances);
    return {
      address,
      ...(balanceSnapshot ? { balanceSnapshot } : {}),
      ...(contextParts.length > 0
        ? { clientContext: contextParts.join("\n") }
        : {}),
    };
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text || !canChat || !address) {
      return;
    }

    clearTxCardBlock();
    setInput("");
    await sendMessage(
      { text, metadata: createMessageMetadata() },
      { body: buildChatRequestBody() },
    );
  }

  async function handlePromptSelect(prompt: string, promptGroup?: PromptGroup) {
    if (!canChat || !address) {
      setInput(prompt);
      return;
    }

    clearTxCardBlock();
    void promptGroup;
    await sendMessage(
      { text: prompt, metadata: createMessageMetadata() },
      { body: buildChatRequestBody() },
    );
  }

  const showLoading = status === "streaming" || status === "submitted";
  const isLandingView =
    mounted && messages.length === 0 && !showLoading && !showTxCard;
  const showEmbeddedComposer = isLandingView && canChat;

  useEffect(() => {
    onLandingStateChange?.(isLandingView);
  }, [isLandingView, onLandingStateChange]);

  if (isConnected && (isChatLoading || !activeChatId || !activeChat)) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <span
          className="inline-block size-5 animate-spin rounded-full border-2 border-[var(--ink)] border-t-[var(--accent)]"
          aria-hidden
        />
        <span className="sr-only">Loading chat</span>
      </div>
    );
  }

  const composer = (
    <ChatComposer
      input={input}
      canChat={canChat}
      status={status}
      variant={showEmbeddedComposer ? "embedded" : "bar"}
      onInputChange={setInput}
      onSubmit={handleSubmit}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <ChatMessageList
          chatId={activeChatId}
          messages={messages}
          status={status}
          mounted={mounted}
          isConnected={isConnected}
          address={address}
          walletBalances={walletBalances}
          errorMessage={error ? formatChatError(error.message) : null}
          showTxCard={showTxCard}
          confirmedFlowHashes={confirmedFlowHashes}
          confirmedFlowTimestamps={confirmedFlowTimestamps}
          pendingFlow={pendingFlowMeta?.flow}
          txCardFlowKey={flowKey}
          landingComposer={showEmbeddedComposer ? composer : undefined}
          onPromptSelect={(prompt, promptGroup) =>
            void handlePromptSelect(prompt, promptGroup)
          }
          onTxComplete={(hashes) => {
            const summary = pendingFlowMeta?.flow.summary ?? "Transaction";

            if (flowKey) {
              const confirmedAt = Date.now();
              const nextConfirmed = {
                ...uiStateRef.current.confirmedFlowHashes,
                [flowKey]: hashes,
              };
              const nextTimestamps = {
                ...uiStateRef.current.confirmedFlowTimestamps,
                [flowKey]: confirmedAt,
              };
              uiStateRef.current = {
                ...uiStateRef.current,
                confirmedFlowHashes: nextConfirmed,
                confirmedFlowTimestamps: nextTimestamps,
              };
              setConfirmedFlowHashes(nextConfirmed);
              setConfirmedFlowTimestamps(nextTimestamps);
            }

            if (address && pendingFlowMeta?.flow) {
              void addTransaction({
                address,
                hashes,
                summary: pendingFlowMeta.flow.summary,
                steps: pendingFlowMeta.flow.steps.map((step) => step.description),
                status: "confirmed",
              });
            }

            if (address) {
              void invalidateWalletBalances(queryClient, address);
            }

            const fullHashLine = hashes.join(", ");
            const requestBody = buildChatRequestBody();
            const confirmContext = [
              requestBody.clientContext,
              "The user signed the prepared wallet transaction successfully.",
              `Action: ${summary}`,
              `Full transaction hash(es): ${fullHashLine}`,
              "Do NOT call get_transaction — confirmation is already complete. Reply with a brief success acknowledgement only — no hash list, no repeating step details.",
            ]
              .filter(Boolean)
              .join("\n");

            void sendMessage(
              {
                text: "Transaction confirmed.",
                metadata: createMessageMetadata(),
              },
              {
                body: {
                  ...requestBody,
                  clientContext: confirmContext,
                },
              },
            );
          }}
          onTxReject={() => {
            if (flowKey) {
              uiStateRef.current = {
                ...uiStateRef.current,
                dismissedFlowKey: flowKey,
                txCardBlockedUntilUserMessage: true,
              };
              setDismissedFlowKey(flowKey);
            }
            setTxCardBlockedUntilUserMessage(true);

            const summary = pendingFlowMeta?.flow.summary;
            const actionLabel = summary
              ? formatFlowSummary(summary)
              : null;
            void sendMessage(
              {
                text: actionLabel
                  ? `Cancelled signing — was: ${actionLabel}`
                  : "Cancelled signing on the confirmation card.",
                metadata: createMessageMetadata(),
              },
              { body: buildChatRequestBody() },
            );
          }}
        />
        {!showEmbeddedComposer ? composer : null}
    </div>
  );
}
