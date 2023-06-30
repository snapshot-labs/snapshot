import {
  ApolloClient,
  createHttpLink,
  gql,
  InMemoryCache
} from '@apollo/client/core';
import { BigNumber } from '@ethersproject/bignumber';
import { randomBytes } from '@ethersproject/random';
import { shorten } from './utils';
import { apolloClient } from './apollo';

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
            txHash
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
        mints(
          first: 100
          where: { minterAddress: $minterAddress }
          orderBy: "timestamp"
          orderDirection: desc
        ) {
          id
          timestamp
          proposal {
            id
            spaceCollection {
              id
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

export function generateSalt() {
  return BigNumber.from(randomBytes(32)).toString();
}

export function mintTxLinkTag(hash: string) {
  return `<a
            href="https://goerli.etherscan.io/tx/${hash}"
            target="_blank"
          >Tx: ${shorten(hash)}</a>`;
}

export function nftLinkTag(contract: string, id: string) {
  return `<a
            href="https://goerli.etherscan.io/token/${contract}/${id}"
            target="_blank"
            title="View transaction"
          >Token [${shorten(id)}]</a>`;
}

const PROPOSALS_QUERY = gql`
  query Proposals($id_in: [String]) {
    proposals(where: { id_in: $id_in }) {
      id
      title
      space {
        id
        name
        avatar
      }
    }
  }
`;

export async function getProposals(ids: string[]) {
  try {
    console.time('getProposals');
    const response = await apolloClient.query({
      query: PROPOSALS_QUERY,
      variables: {
        id_in: ids
      }
    });
    console.timeEnd('getProposals');

    return response.data.proposals;
  } catch (e) {
    console.log(e);
    return e;
  }
}

export async function getSnapshotFee() {
  try {
    const res = await fetch(
      `${import.meta.env.VITE_SIDEKICK_URL}/api/nft-claimer/`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    return (await res.json()).snapshotFee;
  } catch (e) {
    console.error('Unable to retrieve snapshotFee, default to fallback value');
    return 5;
  }
}

export function openseaLink(
  _mintNetwork: string,
  address: string,
  tokenId?: string
) {
  return `https://testnets.opensea.io/assets/goerli/${address}${
    tokenId ? `/${tokenId}` : ''
  }`;
}
