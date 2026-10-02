import type {} from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { handleBalances } from "@/server/api";

export const Route = createFileRoute("/api/balances")({
  server: {
    handlers: {
      GET: async ({ request }) => handleBalances(new URL(request.url)),
    },
  },
});
