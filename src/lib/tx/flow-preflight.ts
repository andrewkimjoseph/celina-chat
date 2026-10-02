export type FlowPreflightResult = {
  ok: boolean;
  token?: string;
  amount?: string;
  message?: string;
};

/** Parse summaries like "Supply 981.83 USDT to Aave V3 on Celo". */
export function parseSupplySummary(summary: string): {
  amount: string;
  token: string;
} | null {
  const match = summary.match(/^Supply\s+([\d.]+)\s+(\S+)\s+to\s+Aave/i);
  if (!match) {
    return null;
  }

  return { amount: match[1], token: match[2] };
}

/** Supply balance checks that depended on MiniPay fee abstraction are not used here. */
export function checkFlowPreflight(summary: string): FlowPreflightResult {
  const parsed = parseSupplySummary(summary);
  if (!parsed) {
    return { ok: true };
  }
  return { ok: true, token: parsed.token, amount: parsed.amount };
}
