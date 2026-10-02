import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import { AppProviders } from "../components/app-providers";
import { ChatHistoryDrawer } from "../components/chat/chat-history-drawer";
import { Providers } from "../components/providers";
import { SiteHeader } from "../components/site-header";
import { TransactionDrawer } from "../components/transactions/transaction-drawer";
import appCss from "../styles.css?url";

const themeScript = `(function(){try{var s=localStorage.getItem('celina-theme');var d=s==='dark';var c=document.documentElement.classList;if(d)c.add('dark');else c.remove('dark');}catch(e){document.documentElement.classList.remove('dark');}})();`;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: "Celina Chat" },
      {
        name: "description",
        content:
          "Wallet chat for the full Celina SDK on Celo — reads, quotes, and unsigned prepare flows you sign in your wallet.",
      },
      { property: "og:title", content: "Celina Chat" },
      {
        property: "og:description",
        content:
          "Wallet chat for the full Celina SDK on Celo — reads, quotes, and unsigned prepare flows you sign in your wallet.",
      },
      { property: "og:image", content: "https://usecelina.xyz/celina-logo-black.png" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:image", content: "https://usecelina.xyz/celina-logo-black.png" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/celina-logo-black.png" },
      { rel: "apple-touch-icon", href: "/celina-logo-black.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body>
        <Providers>
          <AppProviders>
            <div className="app-frame flex min-h-0 flex-col overflow-hidden">
              <SiteHeader />
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
            </div>
            <TransactionDrawer />
            <ChatHistoryDrawer />
          </AppProviders>
        </Providers>
        {import.meta.env.DEV ? (
          <TanStackDevtools
            config={{ position: "bottom-right" }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        ) : null}
        <Scripts />
      </body>
    </html>
  );
}
