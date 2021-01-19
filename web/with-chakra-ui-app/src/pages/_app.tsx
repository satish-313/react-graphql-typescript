import { ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
import { cacheExchange, QueryInput, Cache } from "@urql/exchange-graphcache";
import { Provider, createClient, fetchExchange, dedupExchange } from "urql";

import theme from "../theme";

console.log("cleint")
const client = createClient({
  url: "http://localhost:4500/graphql",
  fetchOptions: {
    credentials: "include"
  },
  exchanges: [dedupExchange, cacheExchange({
    updates: {
      Mutation: {
        LOGIN_MUTATION: (result, args, cache, info) => {
          cache.updateQuery({query: meQuery}, data => {
            console.log(result)
            console.log(data)
            return data
          })
        }
      }
    }
  }), fetchExchange],
})

function MyApp({ Component, pageProps }) {
  return (
    <Provider value={client}>
      <ChakraProvider resetCSS theme={theme}>
        <ColorModeProvider
          options={{
            useSystemColorMode: true,
          }}
        >
          <Component {...pageProps} />
        </ColorModeProvider>
      </ChakraProvider>
    </Provider>
  );
}

export default MyApp;
