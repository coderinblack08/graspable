import superjson from "superjson";
import { InputStylesParams, MantineProvider } from "@mantine/core";
import { withTRPC } from "@trpc/next";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { AppRouter } from "../server/routers/_app";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{ colorScheme: "light" }}
        styles={{
          Text: { root: { fontSize: 14 } },
          Input: (theme, _params: InputStylesParams) => ({
            input: {
              borderRadius: theme.radius.sm,
              borderColor: theme.colors.gray[3],
            },
          }),
        }}
      >
        <Component {...pageProps} />
      </MantineProvider>
    </SessionProvider>
  );
}

export default withTRPC<AppRouter>({
  config() {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */
    const url = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/trpc`
      : "http://localhost:3000/api/trpc";

    return {
      url,
      transformer: superjson,
      /**
       * @link https://react-query.tanstack.com/reference/QueryClient
       */
      // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: false,
})(MyApp);
