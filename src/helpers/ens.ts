import {
  ApolloClient,
  createHttpLink,
  InMemoryCache
} from '@apollo/client/core';

const httpLink = createHttpLink({
  uri: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens'
});

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
