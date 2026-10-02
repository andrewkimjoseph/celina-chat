import { simulatePreparedStepWithRetry } from "@andrewkimjoseph/celina-sdk/simulation";
import type { PublicClient } from "viem";
import type { PreparedTx } from "@/lib/tx/prepared-flow";

export type PreparedStepSimulationFailure = {
  ok: false;
  rawMessage: string;
};

export type PreparedStepSimulationSuccess = {
  ok: true;
};

const SPEND_STEP_PATTERN = /^(?:Supply|Swap|Send|Transfer)\s+([\d,]+\.?\d*)\s+(\S+)/i;

/** Parse the spend-side `{amount, token}` from a prepared step description. */
export function parseSpendStepDescription(
  description: string,
): { amount: string; token: string } | null {
  const match = description.match(SPEND_STEP_PATTERN);
  if (!match) {
    return null;
  }

  return { amount: match[1]!.replace(/,/g, ""), token: match[2]! };
}

/** Simulate one prepared step immediately before wallet broadcast. */
export async function simulatePreparedStepBeforeSend(
  publicClient: PublicClient,
  from: `0x${string}`,
  step: PreparedTx,
): Promise<PreparedStepSimulationSuccess | PreparedStepSimulationFailure> {
  try {
    await simulatePreparedStepWithRetry(publicClient as never, {
      account: from,
      step,
    });
  } catch (error) {
    return {
      ok: false,
      rawMessage: error instanceof Error ? error.message : String(error),
    };
  }

  return { ok: true };
}
