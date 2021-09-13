import { getScores } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { apolloClient } from '@/helpers/apollo';
import { PROPOSAL_VOTES_QUERY } from '@/helpers/queries';
import cloneDeep from 'lodash/cloneDeep';
import voting from '@/helpers/voting';

export async function getProposal(id) {
  try {
    console.time('getProposal.data');
    const response = await apolloClient.query({
      query: PROPOSAL_VOTES_QUERY,
      variables: {
        id
      }
    });
    console.timeEnd('getProposal.data');

    const proposalResClone = cloneDeep(response);
    const proposal = proposalResClone.data.proposal;
    const votes = proposalResClone.data.votes;

    if (proposal?.plugins?.daoModule) {
      // The Dao Module has been renamed to SafeSnap
      // Previous proposals have to be renamed
      proposal.plugins.safeSnap = proposal.plugins.daoModule;
      delete proposal.plugins.daoModule;
    }

    return {
      proposal,
      votes
    };
  } catch (e) {
    console.log(e);
    return e;
  }
}

export async function getResults(space, proposal, votes) {
  try {
    const voters = votes.map(vote => vote.voter);
    const provider = getProvider(space.network);
    const strategies = proposal.strategies ?? space.strategies;
    /* Get scores */
    if (proposal.state !== 'pending') {
      console.time('getProposal.scores');
      const scores = await getScores(
        space.id,
        strategies,
        space.network,
        provider,
        voters,
        parseInt(proposal.snapshot)
      );
      console.timeEnd('getProposal.scores');
      console.log('Scores', scores);

      votes = votes
        .map((vote: any) => {
          vote.scores = strategies.map(
            (strategy, i) => scores[i][vote.voter] || 0
          );
          vote.balance = vote.scores.reduce((a, b: any) => a + b, 0);
          return vote;
        })
        .sort((a, b) => b.balance - a.balance)
        .filter(vote => vote.balance > 0);
    }

    /* Get results */
    const votingClass = new voting[proposal.type](proposal, votes, strategies);
    const results = {
      resultsByVoteBalance: votingClass.resultsByVoteBalance(),
      resultsByStrategyScore: votingClass.resultsByStrategyScore(),
      sumOfResultsBalance: votingClass.sumOfResultsBalance()
    };

    return { votes, results };
  } catch (e) {
    console.log(e);
    return e;
  }
}

export async function getPower(space, address, proposal) {
  try {
    const strategies = proposal.strategies ?? space.strategies;
    let scores: any = await getScores(
      space.id,
      strategies,
      space.network,
      getProvider(space.network),
      [address],
      parseInt(proposal.snapshot)
    );
    scores = scores.map((score: any) =>
      Object.values(score).reduce((a, b: any) => a + b, 0)
    );
    return {
      scores,
      totalScore: scores.reduce((a, b: any) => a + b, 0)
    };
  } catch (e) {
    console.log(e);
    return e;
  }
}
