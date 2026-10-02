import type {} from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { handlePreflight } from "@/server/api";

export const Route = createFileRoute("/api/preflight")({
  server: {
    handlers: {
      POST: async ({ request }) => handlePreflight(request),
    },
  },
});
