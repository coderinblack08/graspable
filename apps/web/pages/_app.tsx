import { InputStylesParams, MantineProvider } from "@mantine/core";
import type { AppProps } from "next/app";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { FirebaseAppProvider } from "reactfire";
import { FirebaseComponents } from "../components/FirebaseComponents";
import { app, firebaseConfig } from "../lib/firebase-client";
import { fetcher } from "../lib/rq-fetcher";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        return fetcher(`${queryKey[0]}`);
      },
    },
  },
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <FirebaseAppProvider firebaseApp={app}>
        <FirebaseComponents>
          <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{ colorScheme: "light" }}
            styles={{
              Text: { root: { fontSize: 14 } },
              Input: (theme, params: InputStylesParams) => ({
                input: {
                  borderRadius: theme.radius.sm,
                  borderColor: theme.colors.gray[3],
                },
              }),
            }}
          >
            <Hydrate state={pageProps.dehydratedState}>
              <Component {...pageProps} />
            </Hydrate>
          </MantineProvider>
        </FirebaseComponents>
      </FirebaseAppProvider>
    </QueryClientProvider>
  );
}
