import { InputStylesParams, MantineProvider } from "@mantine/core";
import { AuthChangeEvent, createClient, Session } from "@supabase/supabase-js";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-supabase";
import { FirebaseAppProvider } from "reactfire";
import { FirebaseComponents } from "../components/FirebaseComponents";
import { app } from "../lib/firebase-client";
import { fetcher } from "../lib/rq-fetcher";

const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_ANON_KEY!
);

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
  useEffect(() => {
    const { data: authListener } = client.auth.onAuthStateChange(
      (event, session) => {
        handleAuthChange(event, session);
      }
    );
    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  async function handleAuthChange(
    event: AuthChangeEvent,
    session: Session | null
  ) {
    await fetch("/api/auth", {
      method: "POST",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "same-origin",
      body: JSON.stringify({ event, session }),
    });
  }

  return (
    <Provider value={client}>
      <QueryClientProvider client={queryClient}>
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
              <Hydrate state={pageProps.dehydratedState}>
                <Component {...pageProps} />
              </Hydrate>
            </MantineProvider>
          </FirebaseComponents>
        </FirebaseAppProvider>
      </QueryClientProvider>
    </Provider>
  );
}
