import type { createCelinaClient } from "@andrewkimjoseph/celina-sdk";
import { createChatToolsFromSdk } from "@/lib/chat-tools/sdk-adapter";

export {
  buildSystemPrompt,
  formatWalletBalanceSnapshot,
  SYSTEM_PROMPT,
  type SystemPromptOptions,
} from "@/lib/chat-tools/system-prompt";

type CelinaClient = ReturnType<typeof createCelinaClient>;

/** Vercel AI SDK tools for `/api/chat` — every browser-surface SDK tool. */
export function createChatTools(
  celina: CelinaClient,
  connectedAddress: `0x${string}`,
) {
  return createChatToolsFromSdk(celina, connectedAddress);
}
