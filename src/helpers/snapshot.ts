import { getScores, getVp } from '@snapshot-labs/snapshot.js/src/utils';
import voting from '@snapshot-labs/snapshot.js/src/voting';
import { apolloClient } from '@/helpers/apollo';
import { PROPOSAL_QUERY, VOTES_QUERY } from '@/helpers/queries';
import cloneDeep from 'lodash/cloneDeep';

export async function getProposalVotes(
  proposalId: string,
  { first, voter, skip }: any = { first: 30000, voter: '', skip: 0 }
) {
  try {
    console.time('getProposalVotes');
    const response = await apolloClient.query({
      query: VOTES_QUERY,
      variables: {
        id: proposalId,
        orderBy: 'vp',
        orderDirection: 'desc',
        first,
        voter,
        skip
      }
    });
    console.timeEnd('getProposalVotes');
    const votesResClone = cloneDeep(response);
    return votesResClone.data.votes;
  } catch (e) {
    console.log(e);
    return e;
  }
}

export async function getProposal(id) {
  try {
    console.time('getProposal');
    const response = await apolloClient.query({
      query: PROPOSAL_QUERY,
      variables: {
        id
      }
    });
    console.timeEnd('getProposal');

    const proposalResClone = cloneDeep(response);
    const proposal = proposalResClone.data.proposal;

    if (proposal?.plugins?.daoModule) {
      // The Dao Module has been renamed to SafeSnap
      // Previous proposals have to be renamed
      proposal.plugins.safeSnap = proposal.plugins.daoModule;
      delete proposal.plugins.daoModule;
    }

    return proposal;
  } catch (e) {
    console.log(e);
    return e;
  }
}

export async function getResults(space, proposal, votes) {
  console.log('[score] getResults');
  const voters = votes.map(vote => vote.voter);
  const strategies = proposal.strategies ?? space.strategies;
  /* Get scores */
  if (proposal.state !== 'pending') {
    console.time('getProposal.scores');
    const scores = await getScores(
      space.id,
      strategies,
      proposal.network,
      voters,
      parseInt(proposal.snapshot),
      import.meta.env.VITE_SCORES_URL + '/api/scores'
    );
    console.timeEnd('getProposal.scores');
    console.log('Got scores');

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
    scores: votingClass.getScores(),
    scoresByStrategy: votingClass.getScoresByStrategy(),
    scoresTotal: votingClass.getScoresTotal()
  };

  return { votes, results };
}

export async function getPower(space, address, proposal) {
  console.log('[score] getPower');
  const options: any = {};
  if (import.meta.env.VITE_SCORES_URL)
    options.url = import.meta.env.VITE_SCORES_URL;
  return await getVp(
    address,
    proposal.network,
    proposal.strategies,
    parseInt(proposal.snapshot),
    space.id,
    proposal.delegation === 1,
    options
  );
}
