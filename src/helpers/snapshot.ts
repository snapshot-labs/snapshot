import { getBlockNumber } from '@snapshot-labs/snapshot.js/src/utils/web3';
import { ipfsGet, getScores } from '@snapshot-labs/snapshot.js/src/utils';
import { formatProposal, formatProposals } from '@/helpers/utils';
import { getProfiles } from '@/helpers/profile';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import gateways from '@snapshot-labs/snapshot.js/src/gateways.json';
import client from '@/helpers/client';

const gateway = process.env.VUE_APP_IPFS_GATEWAY || gateways[0];

export async function getProposal(space, id) {
  try {
    console.time('getProposal.data');
    const provider = getProvider(space.network);
    const response = await Promise.all([
      ipfsGet(gateway, id),
      client.request(`${space.key}/proposal/${id}`),
      getBlockNumber(provider)
    ]);
    console.timeEnd('getProposal.data');
    const [, votes, blockNumber] = response;
    let [proposal]: any = response;
    proposal = formatProposal(proposal);
    proposal.ipfsHash = id;
    return { proposal, votes, blockNumber };
  } catch (e) {
    console.log(e);
    return e;
  }
}

export async function getResults(space, proposal, votes, blockNumber) {
  try {
    const provider = getProvider(space.network);
    const voters = Object.keys(votes);
    const { snapshot } = proposal.msg.payload;
    const blockTag = snapshot > blockNumber ? 'latest' : parseInt(snapshot);

    /* Get scores */
    console.time('getProposal.scores');
    const [scores, profiles]: any = await Promise.all([
      getScores(
        space.key,
        space.strategies,
        space.network,
        provider,
        voters,
        // @ts-ignore
        blockTag
      ),
      getProfiles([proposal.address, ...voters])
    ]);
    console.timeEnd('getProposal.scores');
    console.log('Scores', scores);

    const authorProfile = profiles[proposal.address];
    voters.forEach(address => {
      votes[address].profile = profiles[address];
    });
    proposal.profile = authorProfile;

    votes = Object.fromEntries(
      Object.entries(votes)
        .map((vote: any) => {
          vote[1].scores = space.strategies.map(
            (strategy, i) => scores[i][vote[1].address] || 0
          );
          vote[1].balance = vote[1].scores.reduce((a, b: any) => a + b, 0);
          return vote;
        })
        .sort((a, b) => b[1].balance - a[1].balance)
        .filter(vote => vote[1].balance > 0)
    );

    /* Get results */
    const results = {
      totalVotes: proposal.msg.payload.choices.map(
        (choice, i) =>
          Object.values(votes).filter(
            (vote: any) => vote.msg.payload.choice === i + 1
          ).length
      ),
      totalBalances: proposal.msg.payload.choices.map((choice, i) =>
        Object.values(votes)
          .filter((vote: any) => vote.msg.payload.choice === i + 1)
          .reduce((a, b: any) => a + b.balance, 0)
      ),
      totalScores: proposal.msg.payload.choices.map((choice, i) =>
        space.strategies.map((strategy, sI) =>
          Object.values(votes)
            .filter((vote: any) => vote.msg.payload.choice === i + 1)
            .reduce((a, b: any) => a + b.scores[sI], 0)
        )
      ),
      totalVotesBalances: Object.values(votes).reduce(
        (a, b: any) => a + b.balance,
        0
      )
    };
    return { votes, results };
  } catch (e) {
    console.log(e);
    return e;
  }
}

export async function getPower(space, address, snapshot) {
  try {
    const blockNumber = await getBlockNumber(getProvider(space.network));
    const blockTag = snapshot > blockNumber ? 'latest' : parseInt(snapshot);
    let scores: any = await getScores(
      space.key,
      space.strategies,
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
    let proposals: any = await client.request(`${space.key}/proposals`);
    if (proposals && !space.filters?.onlyMembers) {
      const scores: any = await getScores(
        space.key,
        space.strategies,
        space.network,
        getProvider(space.network),
        Object.values(proposals).map((proposal: any) => proposal.address)
      );
      console.log('Scores', scores);
      proposals = Object.fromEntries(
        Object.entries(proposals).map((proposal: any) => {
          proposal[1].score = scores.reduce(
            (a, b) => a + (b[proposal[1].address] || 0),
            0
          );
          return [proposal[0], proposal[1]];
        })
      );
    }
    return formatProposals(proposals);
  } catch (e) {
    console.log(e);
    return e;
  }
}
