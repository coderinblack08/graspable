import superjson from "superjson";
import { InputStylesParams, MantineProvider } from "@mantine/core";
import { withTRPC } from "@trpc/next";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { FirebaseAppProvider } from "reactfire";
import { FirebaseComponents } from "../components/FirebaseComponents";
import { app } from "../lib/firebase-client";
import { AppRouter } from "../server/routers";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <FirebaseAppProvider firebaseApp={app}>
        <FirebaseComponents>
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
        </FirebaseComponents>
      </FirebaseAppProvider>
    </SessionProvider>
  );
}

export default withTRPC<AppRouter>({
  config({ ctx }) {
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
  ssr: true,
})(MyApp);
