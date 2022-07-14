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
import { ModalsProvider } from "@mantine/modals";
import { OperationResponse } from "@trpc/client";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      {/* {process.env.NODE_ENV !== "production" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )} */}
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
        <ModalsProvider>
          <Global
            styles={(theme) => ({
              "html, body": {
                // margin: 0,
                // height: "100%",
                // overflow: "hidden",
                backgroundColor: theme.colors.dark[9],
              },
              ".ProseMirror": {
                padding: `0px ${theme.spacing.sm}px !important`,
                minHeight: 120,
                "> * + *": {
                  marginTop: "0.75em",
                },
                "p.is-editor-empty:first-child::before": {
                  color: theme.colors.dark[3],
                  content: "attr(data-placeholder)",
                  float: "left",
                  height: 0,
                  pointerEvents: "none",
                },
                "&:focus": {
                  outline: "none",
                },
                h1: {
                  fontSize: "1.25rem",
                },
                h2: {
                  fontSize: "1.15rem",
                },
                h3: {
                  fontSize: "1rem",
                },
                "h1, h2, h3, h4,  h5, h6 ": {
                  lineHeight: "1.1",
                  fontWeight: "700",
                },
                "ul, ol": {
                  padding: "0 1.2rem",
                },
                code: {
                  bg: "rgba(#616161, 0.1)",
                  color: "#616161",
                },
                pre: {
                  fontFamily:
                    "JetBrainsMono, 'Courier New', Courier, monospace",
                  background: theme.colors.dark[7],
                  color: "white",
                  padding: "0.75rem 1rem",
                  rounded: "lg",
                  whiteSpace: "pre-wrap",
                  code: {
                    color: "inherit",
                    p: 0,
                    background: "none",
                    fontSize: "0.8rem",
                  },

                  ".hljs-comment, .hljs-quote": {
                    color: "#616161",
                  },

                  ".hljs-variable, .hljs-template-variable,  .hljs-attribute, .hljs-tag, .hljs-name, .hljs-regexp, .hljs-link, .hljs-name, .hljs-selector-id, .hljs-selector-class":
                    {
                      color: "#F98181",
                    },

                  ".hljs-number,  .hljs-meta, .hljs-built_in, .hljs-builtin-name, .hljs-literal,  .hljs-type, .hljs-params":
                    {
                      color: "#FBBC88",
                    },

                  ".hljs-string, .hljs-symbol, .hljs-bullet": {
                    color: "#B9F18D",
                  },

                  ".hljs-title, .hljs-section": {
                    color: "#FAF594",
                  },

                  ".hljs-keyword, .hljs-selector-tag": {
                    color: "#70CFF8",
                  },

                  ".hljs-emphasis": {
                    fontStyle: "italic",
                  },

                  ".hljs-strong": {
                    fontWeight: 700,
                  },
                },
                blockquote: {
                  pl: 4,
                  borderLeft: "2px solid",
                  borderColor: theme.colors.dark[5],
                },
                img: {
                  maxW: "full",
                  h: "auto",
                },
                mark: {
                  bg: "#FAF594",
                },
                hr: {
                  border: "none",
                  borderTop: "2px solid",
                  borderColor: theme.colors.dark[6],
                  margin: "2rem 0",
                },
              }, // .ProseMirror
            })}
          />
          <NotificationsProvider>
            <Component {...pageProps} />
          </NotificationsProvider>
        </ModalsProvider>
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
        loggerLink({
          enabled: (opts) => {
            return (
              (process.env.NODE_ENV === "development" &&
                process.browser &&
                opts.direction === "down" &&
                (opts as any).type !== "subscription") ||
              (opts.direction === "down" && opts.result instanceof Error)
            );
          },
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
