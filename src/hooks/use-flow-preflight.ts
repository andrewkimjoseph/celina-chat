type FlowPreflightState = { status: "idle" };

/** Supply preflight was MiniPay-specific. Celina Chat relies on step simulation instead. */
export function useFlowPreflight(
  address: string | undefined,
  summary: string,
): FlowPreflightState {
  void address;
  void summary;
  return { status: "idle" };
}
