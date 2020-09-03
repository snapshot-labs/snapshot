import { formatUnits } from '@ethersproject/units';
import { multicall } from '@/_snapshot/utils';
import strategies from '@/_snapshot/strategies';
import client from '@/helpers/client';
import ipfs from '@/helpers/ipfs';
import abi from '@/helpers/abi';
import rpcProvider from '@/helpers/rpc';
import { formatProposal, formatProposals } from '@/helpers/utils';
import { version } from '@/../package.json';

const mutations = {
  SEND_REQUEST() {
    console.debug('SEND_REQUEST');
  },
  SEND_SUCCESS() {
    console.debug('SEND_SUCCESS');
  },
  SEND_FAILURE(_state, payload) {
    console.debug('SEND_FAILURE', payload);
  },
  GET_PROPOSALS_REQUEST() {
    console.debug('GET_PROPOSALS_REQUEST');
  },
  GET_PROPOSALS_SUCCESS() {
    console.debug('GET_PROPOSALS_SUCCESS');
  },
  GET_PROPOSALS_FAILURE(_state, payload) {
    console.debug('GET_PROPOSALS_FAILURE', payload);
  },
  GET_PROPOSAL_REQUEST() {
    console.debug('GET_PROPOSAL_REQUEST');
  },
  GET_PROPOSAL_SUCCESS() {
    console.debug('GET_PROPOSAL_SUCCESS');
  },
  GET_PROPOSAL_FAILURE(_state, payload) {
    console.debug('GET_PROPOSAL_FAILURE', payload);
  },
  GET_VOTERS_BALANCES_REQUEST() {
    console.debug('GET_VOTERS_BALANCES_REQUEST');
  },
  GET_VOTERS_BALANCES_SUCCESS() {
    console.debug('GET_VOTERS_BALANCES_SUCCESS');
  },
  GET_VOTERS_BALANCES_FAILURE(_state, payload) {
    console.debug('GET_VOTERS_BALANCES_FAILURE', payload);
  },
  GET_POWER_REQUEST() {
    console.debug('GET_POWER_REQUEST');
  },
  GET_POWER_SUCCESS() {
    console.debug('GET_POWER_SUCCESS');
  },
  GET_POWER_FAILURE(_state, payload) {
    console.debug('GET_POWER_FAILURE', payload);
  }
};

const actions = {
  send: async ({ commit, dispatch, rootState }, { token, type, payload }) => {
    commit('SEND_REQUEST');
    try {
      const msg: any = {
        address: rootState.web3.account,
        msg: JSON.stringify({
          version,
          timestamp: (Date.now() / 1e3).toFixed(),
          token,
          type,
          payload
        })
      };
      msg.sig = await dispatch('signMessage', msg.msg);
      const result = await client.request('message', msg);
      commit('SEND_SUCCESS');
      dispatch('notify', ['green', `Your ${type} is in!`]);
      return result;
    } catch (e) {
      commit('SEND_FAILURE', e);
      const errorMessage =
        e && e.error_description
          ? `Oops, ${e.error_description}`
          : 'Oops, something went wrong!';
      dispatch('notify', ['red', errorMessage]);
      return;
    }
  },
  getProposals: async ({ commit, rootState }, payload) => {
    const { decimals } = rootState.web3.spaces[payload];
    commit('GET_PROPOSALS_REQUEST');
    try {
      let proposals: any = await client.request(`${payload}/proposals`);
      if (proposals) {
        let balances = await multicall(
          rpcProvider,
          abi['TestToken'],
          Object.values(proposals).map((proposal: any) => [
            proposal.msg.token,
            'balanceOf',
            [proposal.address]
          ])
        );
        balances = balances.map(balance =>
          parseFloat(formatUnits(balance.toString(), decimals))
        );
        proposals = Object.fromEntries(
          Object.entries(proposals).map((proposal: any, i) => {
            proposal[1].balance = balances[i];
            return [proposal[0], proposal[1]];
          })
        );
      }
      commit('GET_PROPOSALS_SUCCESS');
      return formatProposals(proposals);
    } catch (e) {
      commit('GET_PROPOSALS_FAILURE', e);
    }
  },
  getProposal: async ({ commit, rootState }, payload) => {
    commit('GET_PROPOSAL_REQUEST');
    try {
      const result: any = {};
      const [proposal, votes] = await Promise.all([
        ipfs.get(payload.id),
        client.request(`${payload.token}/proposal/${payload.id}`)
      ]);
      result.proposal = formatProposal(proposal);
      result.proposal.ipfsHash = payload.id;
      result.votes = votes;
      const { snapshot } = result.proposal.msg.payload;
      const blockTag =
        snapshot > rootState.web3.blockNumber ? 'latest' : parseInt(snapshot);

      // Score with ERC20 balanceOf strategy
      const options = {
        address: payload.token,
        decimals: rootState.web3.spaces[payload.token].decimals
      };
      const votersBalances = await strategies.erc20BalanceOf(
        rpcProvider,
        Object.values(result.votes).map((vote: any) => vote.address),
        options,
        blockTag
      );

      // Score with Balancer strategy
      const votingPowers = await strategies.balancer(
        rpcProvider,
        // @ts-ignore
        Object.keys(votes),
        options,
        blockTag
      );

      result.votes = Object.fromEntries(
        Object.entries(result.votes)
          .map((vote: any) => {
            const bptBalance = votingPowers[vote[1].address] || 0;
            vote[1].balance = votersBalances[vote[1].address] + bptBalance;
            vote[1].bptBalance = bptBalance;
            vote[1].walletBalance = votersBalances[vote[1].address];
            return vote;
          })
          .sort((a, b) => b[1].balance - a[1].balance)
          .filter(vote => vote[1].balance > 0)
      );

      result.results = {
        totalVotes: result.proposal.msg.payload.choices.map(
          (choice, i) =>
            Object.values(result.votes).filter(
              (vote: any) => vote.msg.payload.choice === i + 1
            ).length
        ),
        totalBalances: result.proposal.msg.payload.choices.map((choice, i) =>
          Object.values(result.votes)
            .filter((vote: any) => vote.msg.payload.choice === i + 1)
            .reduce((a, b: any) => a + b.balance, 0)
        ),
        totalBptBalances: result.proposal.msg.payload.choices.map((choice, i) =>
          Object.values(result.votes)
            .filter((vote: any) => vote.msg.payload.choice === i + 1)
            .reduce((a, b: any) => a + b.bptBalance, 0)
        ),
        totalWalletBalances: result.proposal.msg.payload.choices.map(
          (choice, i) =>
            Object.values(result.votes)
              .filter((vote: any) => vote.msg.payload.choice === i + 1)
              .reduce((a, b: any) => a + b.walletBalance, 0)
        ),
        totalVotesBalances: Object.values(result.votes).reduce(
          (a, b: any) => a + b.balance,
          0
        )
      };

      commit('GET_PROPOSAL_SUCCESS');
      return result;
    } catch (e) {
      commit('GET_PROPOSAL_FAILURE', e);
    }
  },
  getPower: async (
    { commit, dispatch, rootState },
    { token, address, snapshot }
  ) => {
    commit('GET_POWER_REQUEST');
    const blockTag =
      snapshot > rootState.web3.blockNumber ? 'latest' : parseInt(snapshot);
    try {
      const score = await strategies.balancer(
        rpcProvider,
        [address],
        { address: token },
        blockTag
      );
      const bpt = score[address] ? score[address] : 0;
      const base = await dispatch('getBalance', { blockTag, token });
      commit('GET_POWER_SUCCESS');
      return { base, bpt, total: base + bpt };
    } catch (e) {
      commit('GET_POWER_FAILURE', e);
    }
  }
};

export default {
  mutations,
  actions
};
