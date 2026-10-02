import {
  deriveChatLastActivityAt,
  deriveChatTitle,
  MAX_CHATS_PER_WALLET,
  type ChatUiState,
  type StoredChat,
} from "@/lib/chat/chats";
import { celinaChatDb } from "@/lib/tx/transaction-db";
import type { CelesteUIMessage } from "@/lib/chat/chat-message-metadata";

function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

export async function listChats(address: string): Promise<StoredChat[]> {
  const rows = await celinaChatDb.chats
    .where("address")
    .equals(normalizeAddress(address))
    .toArray();

  return rows.sort(
    (a, b) =>
      deriveChatLastActivityAt(b.messages, b.updatedAt) -
      deriveChatLastActivityAt(a.messages, a.updatedAt),
  );
}

export async function getChat(id: string): Promise<StoredChat | undefined> {
  return celinaChatDb.chats.get(id);
}

export type FxIntensity = "low" | "medium" | "high";

export interface FxPreference {
  enabled: boolean;
  intensity: FxIntensity;
}

export async function getFxPreferenceByAddress(
  address: string,
): Promise<FxPreference> {
  const record = await celinaChatDb.preferences.get(normalizeAddress(address));
  const intensity: FxIntensity =
    record?.fxIntensity === "low" || record?.fxIntensity === "high"
      ? record.fxIntensity
      : "low";
  return {
    enabled: record?.fxEnabled ?? true,
    intensity,
  };
}

export async function upsertFxPreference(
  address: string,
  preference: FxPreference,
): Promise<void> {
  const normalized = normalizeAddress(address);
  const existing = await celinaChatDb.preferences.get(normalized);
  await celinaChatDb.preferences.put({
    ...existing,
    address: normalized,
    fxEnabled: preference.enabled,
    fxIntensity: preference.intensity,
    updatedAt: Date.now(),
  });
}

async function trimChatsForAddress(address: string): Promise<void> {
  const normalized = normalizeAddress(address);
  const rows = await celinaChatDb.chats
    .where("address")
    .equals(normalized)
    .toArray();

  const sorted = rows.sort(
    (a, b) =>
      deriveChatLastActivityAt(b.messages, b.updatedAt) -
      deriveChatLastActivityAt(a.messages, a.updatedAt),
  );

  if (sorted.length <= MAX_CHATS_PER_WALLET) {
    return;
  }

  const overflow = sorted.slice(MAX_CHATS_PER_WALLET);
  await celinaChatDb.chats.bulkDelete(overflow.map((row) => row.id));
}

export async function deleteChat(id: string): Promise<void> {
  await celinaChatDb.chats.delete(id);
}

export async function upsertChat(input: {
  id: string;
  address: string;
  messages: CelesteUIMessage[];
  uiState: ChatUiState;
  createdAt?: number;
}): Promise<StoredChat | null> {
  if (input.messages.length === 0) {
    await deleteChat(input.id);
    return null;
  }

  const normalizedAddress = normalizeAddress(input.address);
  const now = Date.now();
  const existing = await celinaChatDb.chats.get(input.id);

  const record: StoredChat = {
    id: input.id,
    address: normalizedAddress,
    title: deriveChatTitle(input.messages),
    messages: input.messages,
    dismissedFlowKey: input.uiState.dismissedFlowKey,
    txCardBlockedUntilUserMessage: input.uiState.txCardBlockedUntilUserMessage,
    confirmedFlowHashes: input.uiState.confirmedFlowHashes,
    confirmedFlowTimestamps: input.uiState.confirmedFlowTimestamps,
    createdAt: existing?.createdAt ?? input.createdAt ?? now,
    updatedAt: deriveChatLastActivityAt(
      input.messages,
      existing?.updatedAt ?? now,
    ),
  };

  await celinaChatDb.chats.put(record);
  await trimChatsForAddress(normalizedAddress);

  return record;
}
