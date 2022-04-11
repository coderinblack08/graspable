import { AuthProvider } from "@redwoodjs/auth";
import { createClient } from "@supabase/supabase-js";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { FatalErrorBoundary, RedwoodProvider } from "@redwoodjs/web";
import { RedwoodApolloProvider } from "@redwoodjs/web/apollo";

import FatalErrorPage from "src/pages/FatalErrorPage";
import Routes from "src/Routes";

import "./index.css";

const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const App = () => (
  <FatalErrorBoundary page={FatalErrorPage}>
    <RedwoodProvider titleTemplate="%PageTitle">
      <AuthProvider client={supabaseClient} type="supabase">
        <ColorModeScript />
        <ChakraProvider>
          <RedwoodApolloProvider>
            <Routes />
          </RedwoodApolloProvider>
        </ChakraProvider>
      </AuthProvider>
    </RedwoodProvider>
  </FatalErrorBoundary>
);

export default App;
