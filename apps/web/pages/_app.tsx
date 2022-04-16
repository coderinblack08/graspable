import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { SWRConfig } from "swr";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig value={{ provider: () => new Map() }}>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </SWRConfig>
  );
}
