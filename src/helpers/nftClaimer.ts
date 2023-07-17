import {
  ApolloClient,
  createHttpLink,
  gql,
  InMemoryCache
} from '@apollo/client/core';
import { BigNumber } from '@ethersproject/bignumber';
import { randomBytes } from '@ethersproject/random';
import { shorten } from './utils';
import { apolloClient as snapshotApolloClient } from './apollo';
import { getJSON } from '@snapshot-labs/snapshot.js/src/utils';

export const MINT_NETWORK = '5';
export const MINT_CURRENCY = 'WETH';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_NFT_CLAIMER_GRAPH_URL
});

export const subgraphApolloClient = new ApolloClient({
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

type Mintable = {
  maxSupply: number;
  mintPrice: number;
  proposerFee: number;
  mintCount: number;
};

type Contract = {
  id: string;
  spaceId: string;
  spaceTreasury?: string;
  enabled?: boolean;
} & Mintable;

type Collection = {
  id: number;
  hexId: string;
  mints?: Mint[];
  spaceCollection?: Contract;
} & Mintable;

export type Mint = {
  id: string;
  minterAddress: string;
  timestamp: number;
  txHash: string;
  proposal?: Collection;
};

export async function getContract(spaceId: string) {
  const {
    data: { spaceCollections }
  }: { data: { spaceCollections: Contract[] } } =
    await subgraphApolloClient.query({
      query: gql`
        query SpaceCollections($spaceId: String) {
          spaceCollections(where: { spaceId: $spaceId }) {
            id
            spaceId
            maxSupply
            mintPrice
            proposerFee
            spaceTreasury
            enabled
            mintCount
          }
        }
      `,
      variables: {
        spaceId
      }
    });

  return spaceCollections[0];
}

export async function getCollection(proposalIntId: bigint) {
  const {
    data: { proposals }
  }: { data: { proposals: Collection[] } } = await subgraphApolloClient.query({
    query: gql`
      query proposals($proposalId: BigInt) {
        proposals(where: { proposalId: $proposalId }) {
          id
          mintCount
          maxSupply
          mintPrice
          proposerFee
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
      proposalId: proposalIntId.toString()
    }
  });

  return proposals[0];
}

export async function getUserNfts(minterAddress: string) {
  const {
    data: { mints }
  }: { data: { mints: Mint[] } } = await subgraphApolloClient.query({
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
          minterAddress
          txHash
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

  mints.forEach(mint => {
    if (mint.proposal) {
      mint.proposal.hexId = BigNumber.from(mint.proposal?.id).toHexString();
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

export async function getProposals(ids: string[]) {
  try {
    const {
      data: { proposals }
    }: { data: { proposals: Collection[] } } = await snapshotApolloClient.query(
      {
        query: gql`
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
        `,
        variables: {
          id_in: ids
        }
      }
    );

    return proposals;
  } catch (e) {
    console.log(e);
    return [];
  }
}

export async function getSnapshotFee() {
  try {
    const url = `${import.meta.env.VITE_SIDEKICK_URL}/api/nft-claimer/`;
    return parseInt((await getJSON(url)).snapshotFee);
  } catch (e) {
    console.error('Unable to retrieve snapshotFee, default to fallback value');
    return 5;
  }
}

export async function getEthPrice() {
  try {
    const url =
      'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=usd';
    return parseFloat((await getJSON(url)).USD);
  } catch (e) {
    return 0;
  }
}
