import {
  ApolloClient,
  createHttpLink,
  gql,
  InMemoryCache
} from '@apollo/client/core';

const uri =
  'https://api.studio.thegraph.com/proxy/48277/nft-subgraph-goerli/v0.0.2';

const httpLink = createHttpLink({ uri });

export const client = new ApolloClient({
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

export async function getSpaceCollection(spaceId: string) {
  const {
    data: { spaceCollections }
  }: { data: { spaceCollections: any[] } } = await client.query({
    query: gql`
      query SpaceCollections($spaceId: String) {
        spaceCollections(where: { spaceId: $spaceId }) {
          id
          maxSupply
          mintPrice
          proposerFee
          spaceTreasury
          enabled
        }
      }
    `,
    variables: {
      spaceId
    }
  });

  return spaceCollections[0];
}

export async function getCollection(proposalId: bigint) {
  const {
    data: { proposals }
  }: { data: { proposals: any[] } } = await client.query({
    query: gql`
      query proposals($proposalId: BigInt) {
        proposals(where: { proposalId: $proposalId }) {
          id
          spaceCollection {
            id
            spaceId
          }
          mints {
            id
          }
        }
      }
    `,
    variables: {
      proposalId: proposalId.toString()
    }
  });

  return proposals[0];
}
