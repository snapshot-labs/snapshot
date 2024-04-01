import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache
} from '@apollo/client/core';

const env = import.meta.env.VITE_DEFAULT_NETWORK;
const uri = networks[env].ensSubgraph;

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
