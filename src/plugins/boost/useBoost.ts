import gql from 'graphql-tag';
import { BigNumberish } from '@ethersproject/bignumber';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { useTxStatus } from '@/composables/useTxStatus';
import { useApolloQuery } from '@/composables/useApolloQuery';
import ABI from './abi.json';
import { ref } from 'vue';

const CONTRACT_ADDRESS = '0xebdb154759f9d6d02a1930dd0a240aa66ddb962a';
const BOOSTS_QUERY = gql`
  query Boosts($ref: String!) {
    boosts(ref: $ref) {
      id
      ref
      strategyURI
      token
      start
      end
    }
  }
`;

export function useBoost() {
  const { apolloQuery } = useApolloQuery();
  const { pendingCount } = useTxStatus();

  const boosts = ref([]);
  const loadingBoosts = ref(true);

  async function loadBoosts(proposalId: string) {
    loadingBoosts.value = true;
    boosts.value = await apolloQuery(
      {
        query: BOOSTS_QUERY,
        variables: { ref: proposalId }
      },
      'boosts'
    );
    loadingBoosts.value = false;
  }

  async function depositTokens(boostId: BigNumberish, amount: BigNumberish) {
    const tx = await sendTransaction(
      getInstance().web3,
      CONTRACT_ADDRESS,
      ABI,
      'depositTokens',
      [boostId, amount]
    );
    pendingCount.value++;
    await tx.wait();
    pendingCount.value--;
  }

  async function claimTokens(
    boostId: BigNumberish,
    recipient: string,
    amount: BigNumberish,
    signature: string
  ) {
    const tx = await sendTransaction(
      getInstance().web3,
      CONTRACT_ADDRESS,
      ABI,
      'claimTokens',
      [{ boostId, recipient, amount }, signature]
    );
    pendingCount.value++;
    await tx.wait();
    pendingCount.value--;
  }

  return {
    loadBoosts,
    boosts,
    depositTokens,
    claimTokens
  };
}
