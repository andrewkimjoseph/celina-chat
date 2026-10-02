import { useConnectModal } from "@rainbow-me/rainbowkit";
import { CelesteGlobeMark } from "@/components/celeste-logo";
import { ConnectWalletButton } from "@/components/connect-wallet-button";

const CAPABILITIES = [
  {
    label: "Send & swap",
    description: "Tokens, Mento, reserve, and Uniswap",
  },
  {
    label: "Earn",
    description: "Aave V3 and GoodDollar UBI",
  },
  {
    label: "Govern",
    description: "Lock, vote, upvote, and delegate",
  },
  {
    label: "Stake",
    description: "Validator groups and eligibility",
  },
] as const;

export function PreConnectLanding() {
  const { openConnectModal } = useConnectModal();

  return (
    <div className="relative mx-auto w-full text-center">
      <CelesteGlobeMark className="mb-4 sm:mb-5" />
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        <span className="box-decoration-clone bg-[var(--accent)] px-1.5 text-[var(--accent-foreground)]">
          The Celina SDK, in chat
        </span>
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
        Connect a wallet, ask in plain language, and Celina prepares the steps.
        You review and sign every transaction.
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-2 text-left sm:gap-3">
        {CAPABILITIES.map((capability) => (
          <li key={capability.label} className="card-brutal relative px-3 py-2.5">
            <p className="text-xs font-semibold text-[var(--ink)]">{capability.label}</p>
            <p className="mt-0.5 text-[11px] leading-4 text-[var(--text-muted)]">
              {capability.description}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col items-center gap-3">
        <ConnectWalletButton
          className="w-full max-w-sm"
          onClick={() => openConnectModal?.()}
          disabled={!openConnectModal}
        />
        <p className="text-[11px] leading-4 text-[var(--text-muted)]">
          Describe the action · Celina prepares the steps · You review and sign
        </p>
      </div>

      <p className="mt-4 text-[11px] leading-4 text-[var(--text-muted)]">
        Celina Chat never auto-sends — you sign every transaction in your wallet.
      </p>
    </div>
  );
}
