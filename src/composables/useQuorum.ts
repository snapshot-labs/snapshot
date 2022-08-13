import { computed, onMounted, ref } from 'vue';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { ExtendedSpace, Proposal, Vote, Results } from '@/helpers/interfaces';
import { BigNumber } from '@ethersproject/bignumber';
import { call } from '@snapshot-labs/snapshot.js/src/utils';
import { getSnapshots } from '@snapshot-labs/snapshot.js/src/utils/blockfinder';

interface QuorumProps {
  space: ExtendedSpace;
  proposal: Proposal;
  votes: Vote[];
  results: Results;
}

export function useQuorum(props: QuorumProps) {
  const loading = ref(false);
  const totalVotingPower = ref(0);

  const totalScore = computed(() => {
    const basicCount = props.space.plugins?.quorum?.basicCount;
    if (basicCount && props.proposal.type === 'basic')
      return props.votes
        .filter(vote => basicCount.includes((vote.choice as number) - 1))
        .reduce((a, b) => a + b.balance, 0);
    return quorumScore({
      proposal: props.proposal,
      results: props.results,
      votes: props.votes
    });
  });

  const quorum = computed(() => {
    return totalVotingPower.value === 0
      ? 0
      : totalScore.value / totalVotingPower.value;
  });

  function quorumScore(payload) {
    let scores = 0;
    if (
      payload.proposal.privacy === 'shutter' &&
      payload.proposal.scores_state !== 'final'
    )
      scores = payload.votes.reduce((a, b) => a + b.balance, 0);
    else if (payload.results) scores = payload.results.scoresTotal;
    return scores;
  }

  async function getTotalVotingPower(
    web3: any,
    quorumOptions: any,
    snapshot: string
  ) {
    const { strategy } = quorumOptions;

    switch (strategy) {
      case 'static': {
        return quorumOptions.total;
      }

      case 'balance': {
        const { address, methodABI, decimals } = quorumOptions;

        const blockTag = snapshot === 'latest' ? snapshot : parseInt(snapshot);

        const votingPower = await call(
          web3,
          [methodABI],
          [address, methodABI.name],
          { blockTag }
        );

        return BigNumber.from(votingPower)
          .div(BigNumber.from(10).pow(decimals))
          .toNumber();
      }

      case 'multichainBalance': {
        const { network, strategies, quorumModifier } = quorumOptions;
        const blocks = await getSnapshots(
          network,
          parseInt(snapshot),
          web3,
          strategies.map(s => s.network || network)
        );
        const requests: Promise<any>[] = strategies.map(s =>
          call(
            getProvider(s.network),
            [s.methodABI],
            [s.address, s.methodABI.name],
            { blockTag: blocks[s.network] }
          )
        );
        const results = await Promise.all(requests);
        const totalBalance = results.reduce((total, ele, index) => {
          const eleDecimals = strategies[index].decimals;
          if (index === 1) {
            const eleDecimals = strategies[0].decimals;
            total = total.div(BigNumber.from(10).pow(eleDecimals));
          }
          return total.add(ele.div(BigNumber.from(10).pow(eleDecimals)));
        });
        const modifier = quorumModifier ? quorumModifier : 1;
        return totalBalance.toNumber() * modifier;
      }

      default:
        throw new Error(`Unsupported quorum strategy: ${strategy}`);
    }
  }

  onMounted(async () => {
    loading.value = true;
    totalVotingPower.value = await getTotalVotingPower(
      getProvider(props.space.network),
      props.space.plugins.quorum,
      props.proposal.snapshot
    );
    loading.value = false;
  });

  return { quorumScore, quorum, totalScore, totalVotingPower };
}
