import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
      <AppShell />
    </main>
  );
}
