"use client";

import { HeaderConnectButton } from "@/components/header-connect-button";
import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/theme-toggle";
import { useChats } from "@/hooks/use-chats";
import { useTransactions } from "@/hooks/use-transactions";
import { useLayoutEffect, useRef } from "react";
import { useAccount } from "wagmi";

const headerChipClassName =
  "flex h-9 items-center justify-center rounded-[2px] border-2 border-[var(--ink)] bg-[var(--surface)] text-[var(--ink)] font-semibold shadow-[var(--shadow-brutal-sm)] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";

function HistoryButton() {
  const { openHistory } = useChats();

  return (
    <button
      type="button"
      onClick={openHistory}
      aria-label="View chat history"
      className={`${headerChipClassName} w-9 sm:w-auto sm:px-3 lg:hidden`}
    >
      <svg
        className="size-4 sm:mr-1.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
        />
      </svg>
      <span className="hidden text-xs sm:inline">History</span>
    </button>
  );
}

function TransactionsButton() {
  const { openDrawer } = useTransactions();

  return (
    <button
      type="button"
      onClick={openDrawer}
      aria-label="View transactions"
      className={`${headerChipClassName} w-9 sm:w-auto sm:px-3`}
    >
      <svg
        className="size-4 sm:mr-1.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
      <span className="hidden text-xs sm:inline">Transactions</span>
    </button>
  );
}

function NewChatButton() {
  const { createChat } = useChats();

  return (
    <button
      type="button"
      onClick={() => void createChat()}
      aria-label="New chat"
      className={`${headerChipClassName} w-9 sm:w-auto sm:px-3`}
    >
      <svg
        className="size-4 sm:mr-1.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
      <span className="hidden text-xs sm:inline">New chat</span>
    </button>
  );
}

export function SiteHeader() {
  const { isConnected } = useAccount();
  const headerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) {
      return;
    }

    const apply = () => {
      document.documentElement.style.setProperty(
        "--app-header-height",
        `${header.getBoundingClientRect().height}px`,
      );
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      ref={headerRef}
      className="z-50 w-full shrink-0 border-b-2 border-[var(--ink)] bg-[var(--surface)]"
    >
      <div className="relative flex w-full items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <img
            src="/celina-logo-black.png"
            alt="Celina"
            width={36}
            height={36}
            className="h-9 w-9 dark:hidden"
          />
          <img
            src="/celina-logo-yellow.png"
            alt=""
            width={36}
            height={36}
            className="hidden h-9 w-9 dark:block"
            aria-hidden
          />
          <span className="font-display text-lg font-semibold tracking-tight">
            Celina
          </span>
        </Link>
        <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-mono text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Chat
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {isConnected ? (
            <>
              <HistoryButton />
              <TransactionsButton />
              <NewChatButton />
            </>
          ) : null}
          <ThemeToggle />
          <HeaderConnectButton />
        </div>
      </div>
    </header>
  );
}
