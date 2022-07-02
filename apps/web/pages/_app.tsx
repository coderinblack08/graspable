import { NotificationsProvider } from "@mantine/notifications";
import { Global, MantineProvider } from "@mantine/core";
import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { loggerLink } from "@trpc/client/links/loggerLink";
import { createWSClient, wsLink } from "@trpc/client/links/wsLink";
import { withTRPC } from "@trpc/next";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { ReactQueryDevtools } from "react-query/devtools";
import superjson from "superjson";
import { AppRouter } from "../server/routers/_app";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      {process.env.NODE_ENV !== "production" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{ colorScheme: "dark" }}
        styles={{
          Text: { root: { fontSize: 14 } },
          // Input: (theme, _params: InputStylesParams) => ({
          //   input: {
          //     borderRadius: theme.radius.sm,
          //     borderColor: theme.colors.dark[5],
          //   },
          // }),
        }}
      >
        <Global
          styles={(theme) => ({
            "html, body": {
              // margin: 0,
              // height: "100%",
              // overflow: "hidden",
              backgroundColor: theme.colors.dark[9],
            },
          })}
        />
        <NotificationsProvider>
          <Component {...pageProps} />
        </NotificationsProvider>
      </MantineProvider>
    </SessionProvider>
  );
}

function getEndingLink() {
  if (!process.browser) {
    return httpBatchLink({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/trpc`,
    });
  }
  const client = createWSClient({
    url: process.env.NEXT_PUBLIC_WS_URL!,
  });
  return wsLink<AppRouter>({
    client,
  });
}

export default withTRPC<AppRouter>({
  config() {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = process.env.NEXT_PUBLIC_APP_URL
      ? `https://${process.env.NEXT_PUBLIC_APP_URL}/api/trpc`
      : "http://localhost:3000/api/trpc";

    return {
      url,
      links: [
        // adds pretty logs to your console in development and logs errors in production
        loggerLink({
          enabled: (opts) =>
            (process.env.NODE_ENV === "development" && process.browser) ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        getEndingLink(),
      ],
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      queryClientConfig: {
        defaultOptions: {
          queries: { refetchOnWindowFocus: false },
          mutations: {
            retry: false,
          },
        },
      },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);
