import { getBlockNumber } from '@snapshot-labs/snapshot.js/src/utils/web3';
import { getScores } from '@snapshot-labs/snapshot.js/src/utils';
import { formatProposals, switchStrategiesAt } from '@/helpers/utils';
import { getProfiles } from '@/helpers/profile';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import client from '@/helpers/client';
import { apolloClient } from '@/apollo';
import { VOTES_QUERY, PROPOSAL_QUERY } from '@/helpers/queries';
import { cloneDeep } from 'lodash';

export async function getProposal(space, id) {
  try {
    console.time('getProposal.data');
    const provider = getProvider(space.network);
    const response = await Promise.all([
      apolloClient.query({
        query: PROPOSAL_QUERY,
        variables: {
          id
        }
      }),
      apolloClient.query({
        query: VOTES_QUERY,
        variables: {
          id
        },
        fetchPolicy: 'no-cache'
      }),

      getBlockNumber(provider)
    ]);
    console.timeEnd('getProposal.data');
    const [proposal, votes, blockNumber] = cloneDeep(response);
    return {
      proposal: proposal.data.proposal,
      votes: votes.data.votes,
      blockNumber
    };
  } catch (e) {
    console.log(e);
    return e;
  }
}

export async function getResults(space, proposal, votes, blockNumber) {
  try {
    const provider = getProvider(space.network);
    const voters = votes.map(vote => vote.voter);
    const blockTag =
      proposal.snapshot > blockNumber ? 'latest' : parseInt(proposal.snapshot);
    const strategies = switchStrategiesAt(space.strategies, proposal);
    /* Get scores */
    console.time('getProposal.scores');
    const [scores, profiles]: any = await Promise.all([
      getScores(
        space.key,
        strategies,
        space.network,
        provider,
        voters,
        // @ts-ignore
        blockTag
      ),
      getProfiles([proposal.author, ...voters])
    ]);
    console.timeEnd('getProposal.scores');
    console.log('Scores', scores);

    proposal.profile = profiles[proposal.author];
    votes.map(vote => (vote.profile = profiles[vote.voter]));

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

    /* Get results */
    const results = {
      totalVotes: proposal.choices.map(
        (choice, i) => votes.filter((vote: any) => vote.choice === i + 1).length
      ),
      totalBalances: proposal.choices.map((choice, i) =>
        votes
          .filter((vote: any) => vote.choice === i + 1)
          .reduce((a, b: any) => a + b.balance, 0)
      ),
      totalScores: proposal.choices.map((choice, i) =>
        strategies.map((strategy, sI) =>
          votes
            .filter((vote: any) => vote.choice === i + 1)
            .reduce((a, b: any) => a + b.scores[sI], 0)
        )
      ),
      totalVotesBalances: votes.reduce((a, b: any) => a + b.balance, 0)
    };

    return { votes, results };
  } catch (e) {
    console.log(e);
    return e;
  }
}

export async function getPower(space, address, proposal) {
  try {
    const blockNumber = await getBlockNumber(getProvider(space.network));
    const blockTag =
      proposal.snapshot > blockNumber ? 'latest' : parseInt(proposal.snapshot);
    const strategies = switchStrategiesAt(space.strategies, proposal);
    let scores: any = await getScores(
      space.key,
      strategies,
      space.network,
      getProvider(space.network),
      [address],
      // @ts-ignore
      blockTag
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

export async function getProposals(space) {
  try {
    const proposals: any = await client.getProposals(space.key);
    return formatProposals(proposals);
  } catch (e) {
    console.log(e);
    return e;
  }
}
