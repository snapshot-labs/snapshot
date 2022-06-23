import gql from 'graphql-tag';
import { pin } from '@snapshot-labs/pineapple';
import { BigNumberish } from '@ethersproject/bignumber';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { call, sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import { useTxStatus } from '@/composables/useTxStatus';
import { useApolloQuery } from '@/composables/useApolloQuery';
import ABI from './abi.json';
import { ref } from 'vue';

const GUARD_URL = 'https://boost-guard.mktcode.uber.space';
const CONTRACT_ADDRESS = '0xec5ba34cf4a473e0254f9d33ca532930755f9615';
const BOOSTS_QUERY = gql`
  query Boosts($ref: String!) {
    boosts(ref: $ref) {
      id
      balance
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

  const boosts = ref<Record<string, any>[]>([]);
  const loadingBoosts = ref(true);

  async function requestClaimReceipt(
    boostId: BigNumberish,
    recipient: string,
    amount: BigNumberish
  ) {
    const init = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'get_receipt',
        params: {
          boostId,
          recipient,
          amount
        },
        id: null
      })
    };

    const res = await fetch(GUARD_URL, init).then(res => res.json());

    if (res.result.sig) return res.result;

    return null;
  }

  async function loadClaimedStatus(boostId: BigNumberish, account: string) {
    return await call(
      getInstance().web3,
      ABI,
      [CONTRACT_ADDRESS, 'claimed', [account, boostId]],
      { blockTag: 'latest' }
    );
  }

  async function loadBoosts(proposalId: string, account: string) {
    loadingBoosts.value = true;
    boosts.value = await apolloQuery(
      {
        query: BOOSTS_QUERY,
        variables: { ref: proposalId }
      },
      'boosts'
    );

    if (account) {
      for (const boost of boosts.value) {
        boost.receipt = await requestClaimReceipt(
          boost.id,
          account,
          '1000000000000000000'
        );
        boost.claimed = await loadClaimedStatus(boost.id, account);
      }
    }

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

  async function claimTokens(boost: any) {
    const tx = await sendTransaction(
      getInstance().web3,
      CONTRACT_ADDRESS,
      ABI,
      'claimTokens',
      [boost.receipt.data.message, boost.receipt.sig]
    );
    pendingCount.value++;
    await tx.wait();
    pendingCount.value--;
  }

  async function pinStrategy(strategy: any) {
    const receipt = await pin(strategy);
    console.log(receipt);
  }

  return {
    loadBoosts,
    boosts,
    loadingBoosts,
    depositTokens,
    claimTokens,
    pinStrategy
  };
}
