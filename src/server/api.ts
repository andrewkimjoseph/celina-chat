import { convertToModelMessages, smoothStream, stepCountIs, streamText } from "ai";
import { formatUnits, isAddress } from "viem";
import { runWithAnalyticsWallet } from "@andrewkimjoseph/celina-sdk";
import { assertChatApiKeyConfigured, getChatModel } from "@/lib/chat/chat-model";
import { buildSystemPrompt, createChatTools } from "@/lib/chat-tools";
import type { CelesteUIMessage } from "@/lib/chat/chat-message-metadata";
import { getCelinaClient } from "@/lib/wallet/celina";
import {
  buildWalletBalancesResponse,
  goodDollarBalanceRow,
} from "@/lib/wallet/balances";
import {
  checkSendPreflight,
  parseSendRecipient,
  parseSendSummary,
} from "@/lib/tx/send-preflight";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleChat(request: Request): Promise<Response> {
  const body = (await request.json()) as {
    messages: CelesteUIMessage[];
    address?: string;
    clientContext?: string;
    balanceSnapshot?: string;
  };

  const { messages, address, clientContext, balanceSnapshot } = body;

  if (!address || !isAddress(address)) {
    return json({ error: "Connect your wallet before chatting." }, 400);
  }

  const apiKeyError = assertChatApiKeyConfigured();
  if (apiKeyError) {
    return json({ error: apiKeyError }, 500);
  }

  const celina = getCelinaClient();
  const walletAddress = address as `0x${string}`;
  const system = buildSystemPrompt({
    address: walletAddress,
    balanceSnapshot,
    clientContext,
  });
  const modelMessages = await convertToModelMessages(messages);

  return runWithAnalyticsWallet(walletAddress, () => {
    const result = streamText({
      model: getChatModel(),
      system,
      messages: modelMessages,
      tools: createChatTools(celina, walletAddress),
      stopWhen: stepCountIs(8),
      experimental_transform: smoothStream({
        delayInMs: 52,
        chunking: "word",
      }),
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      messageMetadata: ({ part }) => {
        if (part.type === "finish") {
          return { createdAt: Date.now() };
        }
      },
    });
  });
}

export async function handlePreflight(request: Request): Promise<Response> {
  const body = (await request.json()) as {
    address?: string;
    summary?: string;
    token?: string;
    amount?: string;
  };

  const { address, summary, token, amount } = body;

  if (!address || !isAddress(address)) {
    return json({ error: "Invalid wallet address." }, 400);
  }

  const parsed =
    token && amount
      ? { token, amount }
      : summary
        ? parseSendSummary(summary)
        : null;

  if (!parsed) {
    return json({ error: "Could not parse transaction for balance check." }, 400);
  }

  const celina = getCelinaClient();
  const wallet = address as `0x${string}`;

  return runWithAnalyticsWallet(wallet, async () => {
    const recipient = summary ? parseSendRecipient(summary) : undefined;
    const result = await checkSendPreflight(
      celina,
      wallet,
      parsed.token,
      parsed.amount,
      recipient ? { to: recipient } : undefined,
    );
    return json(result);
  });
}

export async function handleBalances(url: URL): Promise<Response> {
  const addressParam = url.searchParams.get("address");
  const includeZero = url.searchParams.get("includeZero") === "true";

  if (!addressParam || !isAddress(addressParam)) {
    return json({ error: "Invalid wallet address." }, 400);
  }

  const address = addressParam as `0x${string}`;
  const celina = getCelinaClient();

  return runWithAnalyticsWallet(address, async () => {
    const [account, stablecoinResult, goodDollarBalance] = await Promise.all([
      celina.account.getAccount(address),
      celina.token.getStablecoinBalances(address, { includeZero }),
      celina.token.getTokenBalance("GoodDollar", address),
    ]);

    const celoFormatted = formatUnits(BigInt(account.balanceWei), 18);
    const goodDollarRow = goodDollarBalanceRow({
      tokenAddress: goodDollarBalance.tokenAddress as `0x${string}`,
      raw: goodDollarBalance.raw,
      formatted: goodDollarBalance.formatted,
    });
    const extraTokens =
      includeZero || goodDollarRow.raw !== "0" ? [goodDollarRow] : [];

    return json(
      buildWalletBalancesResponse(
        address,
        account.balanceWei,
        celoFormatted,
        stablecoinResult.stablecoins,
        stablecoinResult.totalChecked,
        extraTokens,
      ),
    );
  });
}
