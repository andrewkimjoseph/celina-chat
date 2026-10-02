import type {} from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { handleChat } from "@/server/api";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => handleChat(request),
    },
  },
});
