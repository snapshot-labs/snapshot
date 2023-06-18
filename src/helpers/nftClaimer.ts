import {
  ApolloClient,
  createHttpLink,
  gql,
  InMemoryCache
} from '@apollo/client/core';

const uri =
  'https://api.studio.thegraph.com/proxy/48277/nft-subgraph-goerli/version/latest';

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
          mintCount
          mints {
            id
            minterAddress
            timestamp
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

export async function getUserNfts(minterAddress: string) {
  const {
    data: { mints }
  }: { data: { mints: any[] } } = await client.query({
    query: gql`
      query mints($minterAddress: String) {
        mints(first: 100, where: { minterAddress: $minterAddress }) {
          id
          proposal {
            id
            spaceCollection {
              spaceId
            }
          }
        }
      }
    `,
    variables: {
      minterAddress
    }
  });

  return mints;
}
