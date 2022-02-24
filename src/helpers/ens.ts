import {
  ApolloClient,
  createHttpLink,
  InMemoryCache
} from '@apollo/client/core';

const uri =
  import.meta.env.VITE_DEFAULT_NETWORK === '4'
    ? 'https://api.thegraph.com/subgraphs/name/ensdomains/ensrinkeby'
    : 'https://api.thegraph.com/subgraphs/name/ensdomains/ens';

const httpLink = createHttpLink({ uri });

export const ensApolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache({
    addTypename: false
  }),
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache'
    }
  }
});
