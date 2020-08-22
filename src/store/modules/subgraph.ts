import { getAddress } from '@ethersproject/address';
import { request } from '@/helpers/subgraph';

const mutations = {
  GET_VOTING_POWER_REQUEST() {
    console.debug('GET_VOTING_POWER_REQUEST');
  },
  GET_VOTING_POWER_SUCCESS() {
    console.debug('GET_VOTING_POWER_SUCCESS');
  },
  GET_VOTING_POWER_FAILURE(_state, payload) {
    console.debug('GET_VOTING_POWER_FAILURE', payload);
  },
  GET_VOTING_POWERS_REQUEST() {
    console.debug('GET_VOTING_POWERS_REQUEST');
  },
  GET_VOTING_POWERS_SUCCESS() {
    console.debug('GET_VOTING_POWERS_SUCCESS');
  },
  GET_VOTING_POWERS_FAILURE(_state, payload) {
    console.debug('GET_VOTING_POWERS_FAILURE', payload);
  }
};

const actions = {
  getVotingPowers: async ({ commit }, { blockTag, token, addresses }) => {
    commit('GET_VOTING_POWERS_REQUEST');
    try {
      const block = blockTag === 'latest' ? undefined : { number: blockTag };
      const result = await request('getVotingPowers', {
        poolShares: {
          __args: {
            block,
            where: {
              userAddress_in: addresses.map(address => address.toLowerCase())
            }
          }
        }
      });
      const votingPowers: any = Object.fromEntries(
        addresses.map(address => [address, 0])
      );
      if (result && result.poolShares) {
        result.poolShares.forEach(poolShare =>
          poolShare.poolId.tokens.map(poolToken => {
            const [, tokenAddress] = poolToken.id.split('-');
            if (tokenAddress === token.toLowerCase()) {
              const userAddress = getAddress(poolShare.userAddress.id);
              const shares =
                (poolToken.balance / poolShare.poolId.totalShares) *
                poolShare.balance;
              votingPowers[userAddress] = votingPowers[userAddress] + shares;
            }
          })
        );
      }
      commit('GET_VOTING_POWERS_SUCCESS');
      return votingPowers;
    } catch (e) {
      commit('GET_VOTING_POWERS_FAILURE', e);
    }
  },
  getVotingPowersByPools: async (
    { commit },
    { blockTag, token, addresses }
  ) => {
    commit('GET_VOTING_POWERS_REQUEST');
    try {
      const block = blockTag === 'latest' ? undefined : { number: blockTag };
      const result = await request('getVotingPowers', {
        poolShares: {
          __args: {
            block,
            where: {
              userAddress_in: addresses.map(address => address.toLowerCase())
            }
          }
        }
      });
      const votingPowers: any = Object.fromEntries(
        addresses.map(address => [address, {}])
      );
      if (result && result.poolShares) {
        result.poolShares.forEach(poolShare =>
          poolShare.poolId.tokens.map(poolToken => {
            const [poolId, tokenAddress] = poolToken.id.split('-');
            if (tokenAddress === token.toLowerCase()) {
              const userAddress = getAddress(poolShare.userAddress.id);
              const poolAddress = getAddress(poolId);
              votingPowers[userAddress][poolAddress] =
                (poolToken.balance / poolShare.poolId.totalShares) *
                poolShare.balance;
            }
          })
        );
      }
      commit('GET_VOTING_POWERS_SUCCESS');
      return votingPowers || {};
    } catch (e) {
      commit('GET_VOTING_POWERS_FAILURE', e);
    }
  }
};

export default {
  mutations,
  actions
};
