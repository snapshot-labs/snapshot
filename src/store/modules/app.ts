import { getProfiles } from '@/helpers/3box';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { ipfsGet } from '@snapshot-labs/snapshot.js/src/utils';
import {
  getBlockNumber,
  signMessage
} from '@snapshot-labs/snapshot.js/src/utils/web3';
import getProvider from '@/helpers/provider';
import gateways from '@snapshot-labs/snapshot.js/src/gateways.json';
import client from '@/helpers/client';
import {
  formatProposal,
  formatProposals,
  formatSpace,
  isAddressEqual,
  ones
} from '@/helpers/utils';

import { version } from '@/../package.json';

import { HarmonyAddress } from '@harmony-js/crypto';
import * as ethUtil from 'ethereumjs-util';

const gateway = process.env.VUE_APP_IPFS_GATEWAY || gateways[0];

const backendEmulation = (msg, signatureRPC) => {
  const data = Buffer.from(msg, 'utf8');
  const msgHash = ethUtil.hashPersonalMessage(data);

  const params = ethUtil.fromRpcSig(signatureRPC);

  const rr = ethUtil.ecrecover(
    ethUtil.toBuffer(msgHash),
    params.v,
    params.r,
    params.s
  );

  const addressHex = ethUtil.bufferToHex(ethUtil.publicToAddress(rr));

  console.log(`Address: ${addressHex}`);
  console.log(`Address: ${new HarmonyAddress(addressHex).bech32}`);
};

export interface Validator {
  active: boolean;
  address: string;
  apr: number;
  hasLogo: boolean;
  identity: string; // "Moonstake"
  name: string; // "Moonstake"
  rate: string; // "0.100000000000000000"
  total_stake: string; // "8466571117002000000000000"
  uptime_percentage: number; // 0.9994578043619792
}

const state = {
  init: false,
  loading: false,
  authLoading: false,
  modalOpen: false,
  spaces: {},
  validators: [] as Validator[]
};

const mutations = {
  SET(_state, payload) {
    Object.keys(payload).forEach(key => {
      _state[key] = payload[key];
    });
  },
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
  init: async ({ commit, dispatch }) => {
    const auth = getInstance();

    commit('SET', { loading: true });
    await dispatch('getSpaces');
    commit('SET', { loading: false, init: true });
  },
  loading: ({ commit }, payload) => {
    commit('SET', { loading: payload });
  },
  toggleModal: ({ commit }) => {
    commit('SET', { modalOpen: !state.modalOpen });
  },
  getSpaces: async ({ commit }) => {
    let spaces: any = await client.request('spaces');

    spaces = Object.fromEntries(
      Object.entries(spaces).map(space => [
        space[0],
        formatSpace(space[0], space[1])
      ])
    );

    commit('SET', { spaces });
    return spaces;
  },
  getValidators: async ({ commit }, spaceKey) => {
    const network = spaceKey === 'staking-mainnet' ? 'mainnet' : 'testnet';

    const res: any = await client.getByUrl(
      `https://api.stake.hmny.io/networks/${network}/validators`
    );

    const validators = res.validators.filter(v => !!v.active);

    // const validators: any = [
    //   {
    //     address: 'one1y9g54dnh8yj3yt3cnl3xsj56jwqy8ar4xyu508',
    //     total_stake: 70 * 1e18
    //   },
    //   {
    //     address: 'one1437j7lqq54v9ng7qqs0x7cf42tqkcz4thckwua',
    //     total_stake: 30 * 1e18
    //   }
    // ].concat(res.validators.filter(v => !!v.active));

    commit('SET', { validators });

    return validators;
  },
  send: async ({ commit, dispatch, rootState }, { space, type, payload }) => {
    const auth = getInstance();

    commit('SEND_REQUEST');

    let address;

    if (rootState.web3.connectorId === 'harmony') {
      // @ts-ignore
      const account = await window.onewallet.getAccount();
      address = account.address;
    }

    address =
      rootState.web3.connectorId === 'harmony'
        ? new HarmonyAddress(address).checksum
        : rootState.web3.account;

    try {
      const msg: any = {
        address,
        msg: JSON.stringify({
          version,
          timestamp: (Date.now() / 1e3).toFixed(),
          space,
          type,
          payload
        })
      };

      if (rootState.web3.connectorId === 'harmony') {
        // @ts-ignore
        msg.sig = await window.onewallet.sign(msg.msg);
      } else {
        msg.sig = await signMessage(auth.web3, msg.msg, rootState.web3.account);
      }

      backendEmulation(msg.msg, msg.sig);

      const result = await client.request('message', msg);
      commit('SEND_SUCCESS');
      dispatch('notify', [
        'green',
        type === 'delete-proposal' ? `Proposal deleted` : `Your ${type} is in!`
      ]);
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
  getProposals: async ({ commit, dispatch }, space) => {
    commit('GET_PROPOSALS_REQUEST');

    await dispatch('getValidators', space.key);

    try {
      let proposals: any = await client.request(`${space.key}/proposals`);
      if (proposals) {
        const scores: any = [
          Object.values(proposals).reduce((acc: any, proposal: any) => {
            const validator = state.validators.find(v =>
              isAddressEqual(v.address, proposal.address)
            );

            return {
              ...acc,
              [proposal.address]: validator
                ? Number(ones(validator.total_stake))
                : Number(ones(0)) // TODO: test only
            };
          }, {})
        ];

        // await getScores(
        //   space.key,
        //   space.strategies,
        //   space.network,
        //   getProvider(space.network),
        //   Object.values(proposals).map((proposal: any) => proposal.address)
        // );
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
      commit('GET_PROPOSALS_SUCCESS');
      return formatProposals(proposals);
    } catch (e) {
      commit('GET_PROPOSALS_FAILURE', e);
    }
  },
  getProposal: async ({ commit }, { space, id }) => {
    commit('GET_PROPOSAL_REQUEST');
    try {
      const provider = getProvider(space.network);
      console.time('getProposal.data');
      const response = await Promise.all([
        ipfsGet(gateway, id),
        client.request(`${space.key}/proposal/${id}`),
        getBlockNumber(provider)
      ]);
      console.timeEnd('getProposal.data');
      const [, , blockNumber] = response;
      let [proposal, votes]: any = response;
      proposal = formatProposal(proposal);
      proposal.ipfsHash = id;
      const voters = Object.keys(votes);
      const { snapshot } = proposal.msg.payload;
      const blockTag = snapshot > blockNumber ? 'latest' : parseInt(snapshot);

      /* Get scores */
      // console.log(provider, provider);

      // console.log(
      //   99999,
      //   await getScores(
      //     space.key,
      //     space.strategies,
      //     space.network,
      //     provider,
      //     voters,
      //     // @ts-ignore
      //     blockTag
      //   ),
      //   voters.map(addr => {
      //     const validator = state.validators.find(v =>
      //       isAddressEqual(addr, addr)
      //     );
      //
      //     return { [addr]: validator ? validator.total_stake : 0 };
      //   })
      // ),
      console.time('getProposal.scores');
      const [scores, profiles]: any = await Promise.all([
        Promise.resolve([
          voters.reduce((acc, addr) => {
            const validator = state.validators.find(v =>
              isAddressEqual(v.address, addr)
            );

            return {
              ...acc,
              [addr]: validator
                ? Number(ones(validator.total_stake))
                : Number(ones(0)) // TODO: test only
            };
          }, {})
        ]),
        // getScores(
        //   space.key,
        //   space.strategies,
        //   space.network,
        //   provider,
        //   voters,
        //   // @ts-ignore
        //   blockTag
        // ),
        getProfiles([proposal.address, ...voters])
      ]);

      // console.log(3333, scores, profiles);

      console.timeEnd('getProposal.scores');
      console.log('Scores', scores);

      const authorProfile = profiles[proposal.address];
      voters.forEach(address => {
        votes[address].profile = profiles[address];
      });
      proposal.profile = authorProfile;

      console.log('space.strategies', space.strategies);

      votes = Object.fromEntries(
        Object.entries(votes)
          .map((vote: any) => {
            console.log('vote: ', vote);

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

      commit('GET_PROPOSAL_SUCCESS');
      return { proposal, votes, results };
    } catch (e) {
      commit('GET_PROPOSAL_FAILURE', e);
    }
  },
  getPower: async ({ commit }, { space, address, snapshot }) => {
    commit('GET_POWER_REQUEST');
    try {
      /*
      const blockNumber = await getBlockNumber(getProvider(space.network));

      console.log(blockNumber, space.network, getProvider(space.network));

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
      */
      const validator = state.validators.find(
        v =>
          new HarmonyAddress(v.address).checksum ===
          new HarmonyAddress(address).checksum
      );

      const scores = [validator ? ones(validator.total_stake) : ones(0)]; // TODO: test only

      commit('GET_POWER_SUCCESS');
      return {
        scores,
        totalScore: scores.reduce((a, b: any) => a + b, 0)
      };
    } catch (e) {
      commit('GET_POWER_FAILURE', e);
    }
  }
};

export default {
  state,
  mutations,
  actions
};
