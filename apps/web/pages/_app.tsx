import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { SWRConfig } from "swr";
import { theme } from "../lib/chakra-theme";
import { fetcher } from "../lib/swr-fetcher";

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
    <SWRConfig value={{ provider: () => new Map(), fetcher }}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <ChakraProvider theme={theme}>
            <Component {...pageProps} />
          </ChakraProvider>
        </Hydrate>
      </QueryClientProvider>
    </SWRConfig>
  );
}
