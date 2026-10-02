import type { createCelinaClient } from "@andrewkimjoseph/celina-sdk";
import { parseUnits } from "viem";
import { normalizeRegistryTokenInput } from "@/lib/wallet/registry-token";
import { checkBlockedSendRecipient } from "@/lib/tx/blocked-send-recipients";

export {
  checkBlockedSendRecipient,
  findBlockedSendRecipient,
  parseSendRecipient,
} from "@/lib/tx/blocked-send-recipients";

type CelinaClient = ReturnType<typeof createCelinaClient>;

/** Minimum native CELO reserved for gas (approximate). */
const MIN_CELO_FOR_GAS = parseUnits("0.01", 18);

export type SendPreflightResult = {
  ok: boolean;
  token: string;
  amount: string;
  tokenBalance: string;
  celoBalance: string;
  blockedRecipient?: boolean;
  message?: string;
};

/** Parse summaries like "Send 1 USDT to 0x…". */
export function parseSendSummary(summary: string): {
  amount: string;
  token: string;
  to?: `0x${string}`;
} | null {
  const match = summary.match(/^Send\s+([\d.]+)\s+(\S+)\s+to\s+(0x[a-fA-F0-9]{40})/i);
  if (!match) {
    return null;
  }

  return {
    amount: match[1],
    token: match[2],
    to: match[3] as `0x${string}`,
  };
}

export async function checkSendPreflight(
  celina: CelinaClient,
  address: `0x${string}`,
  token: string,
  amount: string,
  options?: { to?: `0x${string}` | string },
): Promise<SendPreflightResult> {
  const resolved = celina.token.resolveToken(normalizeRegistryTokenInput(token));

  if (options?.to) {
    const blocked = checkBlockedSendRecipient(options.to);
    if (!blocked.ok) {
      return {
        ok: false,
        token: resolved.symbol,
        amount,
        tokenBalance: "0",
        celoBalance: "0",
        blockedRecipient: true,
        message: blocked.message,
      };
    }
  }

  const { balances } = await celina.token.getBalances(address, [
    resolved.symbol,
    "CELO",
  ]);

  const tokenEntry = balances.find((b) => b.token === resolved.symbol);
  const celoEntry = balances.find((b) => b.token === "CELO");

  const tokenBalance = tokenEntry?.formatted ?? "0";
  const celoBalance = celoEntry?.formatted ?? "0";
  const tokenRaw = BigInt(tokenEntry?.raw ?? "0");
  const celoRaw = BigInt(celoEntry?.raw ?? "0");

  let amountWei: bigint;
  try {
    amountWei = parseUnits(amount, resolved.decimals);
  } catch {
    return {
      ok: false,
      token: resolved.symbol,
      amount,
      tokenBalance,
      celoBalance,
      message: `Invalid amount "${amount}".`,
    };
  }

  if (resolved.address === "native") {
    const totalNeeded = amountWei + MIN_CELO_FOR_GAS;
    if (tokenRaw < totalNeeded) {
      return {
        ok: false,
        token: resolved.symbol,
        amount,
        tokenBalance,
        celoBalance,
        message: `Insufficient CELO. You have ${tokenBalance} CELO but need about ${amount} CELO plus gas.`,
      };
    }

    return {
      ok: true,
      token: resolved.symbol,
      amount,
      tokenBalance,
      celoBalance,
    };
  }

  if (tokenRaw < amountWei) {
    return {
      ok: false,
      token: resolved.symbol,
      amount,
      tokenBalance,
      celoBalance,
      message: `Insufficient ${resolved.symbol}. You have ${tokenBalance} but tried to send ${amount}.`,
    };
  }

  if (celoRaw < MIN_CELO_FOR_GAS) {
    return {
      ok: false,
      token: resolved.symbol,
      amount,
      tokenBalance,
      celoBalance,
      message: `Low CELO for gas. You have ${celoBalance} CELO; keep some CELO to pay network fees.`,
    };
  }

  return {
    ok: true,
    token: resolved.symbol,
    amount,
    tokenBalance,
    celoBalance,
  };
}
