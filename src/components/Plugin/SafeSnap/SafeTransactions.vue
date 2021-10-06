<script>
import Plugin from '@/../snapshot-plugins/src/plugins/safeSnap';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import {
  getGnosisSafeBalances,
  getGnosisSafeCollectibles
} from '@/helpers/abi/utils';

const plugin = new Plugin();

const GNOSIS_SAFE_DEPLOYMENTS = {
  1: 'https://gnosis-safe.io',
  4: 'https://rinkeby.gnosis-safe.io',
  100: 'https://xdai.gnosis-safe.io',
  73799: 'https://volta.gnosis-safe.io',
  246: 'https://ewc.gnosis-safe.io',
  137: 'https://polygon.gnosis-safe.io',
  56: 'https://bsc.gnosis-safe.io',
  42161: 'https://arbitrum.gnosis-safe.io'
};

async function fetchBalances(network, gnosisSafeAddress) {
  if (gnosisSafeAddress) {
    try {
      const balances = await getGnosisSafeBalances(network, gnosisSafeAddress);
      return balances
        .filter(balance => balance.token)
        .map(balance => ({
          ...balance.token,
          address: balance.tokenAddress
        }));
    } catch (e) {
      console.warn('Error fetching balances');
    }
  }
  return [];
}

async function fetchCollectibles(network, gnosisSafeAddress) {
  if (gnosisSafeAddress) {
    try {
      return await getGnosisSafeCollectibles(network, gnosisSafeAddress);
    } catch (error) {
      console.warn('Error fetching collectables');
    }
  }
  return [];
}

export default {
  props: ['modelValue', 'proposal', 'network', 'realityAddress', 'preview'],
  emits: ['update:modelValue'],
  data() {
    return {
      input: this.modelValue,
      gnosisSafeAddress: undefined,
      transactionConfig: {
        preview: this.preview,
        gnosisSafeAddress: undefined,
        network: this.network,
        tokens: [],
        collectables: []
      }
    };
  },
  async mounted() {
    try {
      const { dao } = await plugin.getModuleDetails(
        this.network,
        this.realityAddress
      );
      this.gnosisSafeAddress = dao;
      this.transactionConfig = {
        ...this.transactionConfig,
        gnosisSafeAddress: this.gnosisSafeAddress,
        tokens: await fetchBalances(this.network, this.gnosisSafeAddress),
        collectables: await fetchCollectibles(
          this.network,
          this.gnosisSafeAddress
        )
      };
    } catch (e) {
      console.error(e);
    }
  },
  computed: {
    safeLink() {
      const baseUrl =
        GNOSIS_SAFE_DEPLOYMENTS[this.network] || 'https://gnosis-safe.io';
      return `${baseUrl}/app/#/safes/${this.gnosisSafeAddress}`;
    },
    networkName() {
      if (this.network === '1') return 'Mainnet';
      const { shortName, name } = networks[this.network] || {};
      return shortName || name || `#${this.network}`;
    },
    networkIcon() {
      return `https://raw.githubusercontent.com/snapshot-labs/snapshot.js/master/src/networks/${this.network}.png`;
    },
    proposalResolved() {
      const ts = (Date.now() / 1e3).toFixed();
      return ts > this.proposal.end;
    }
  },
  methods: {
    addTransactionBatch() {
      this.input.push([]);
      this.$emit('update:modelValue', this.input);
    },
    removeBatch(index) {
      this.input.splice(index, 1);
      this.$emit('update:modelValue', this.input);
    },
    getBatchNonce(index) {
      return this.input
        .slice(0, index)
        .reduce((acc, transactions) => acc + transactions.length, 0);
    },
    updateTransactionBatch(index, batch) {
      this.input[index] = batch;
      this.$emit('update:modelValue', this.input);
    }
  }
};
</script>

<template>
  <div class="border-t border-b md:border rounded-none md:rounded-md mb-4">
    <h4
      class="px-4 pt-3 border-b block rounded-t-none md:rounded-t-md"
      style="padding-bottom: 12px"
    >
      <UiAvatar
        class="mr-2 float-left mt-[-2px]"
        :imgsrc="networkIcon"
        :seed="network"
        size="28"
      />
      {{ networkName }} Safe
      <a
        v-if="gnosisSafeAddress"
        :href="safeLink"
        class="text-color"
        style="font-weight: normal"
        target="_blank"
      >
        {{ _shorten(gnosisSafeAddress) }}
        <i class="iconfont iconexternal-link" />
      </a>
    </h4>
    <div class="text-center">
      <div v-for="(batch, index) in input" v-bind:key="index" class="border-b">
        <PluginSafeSnapFormTransactionBatch
          :config="transactionConfig"
          :index="index"
          :modelValue="batch"
          :nonce="getBatchNonce(index)"
          @remove="removeBatch(index)"
          @update:modelValue="updateTransactionBatch(index, $event)"
        />
      </div>

      <div v-if="!preview || proposalResolved">
        <UiButton class="my-3" v-if="!preview" @click="addTransactionBatch">
          {{ $t('safeSnap.addBatch') }}
        </UiButton>

        <PluginSafeSnapHandleOutcome
          v-if="preview && proposalResolved"
          :txs="input"
          :proposalId="proposal.id"
          :realityAddress="realityAddress"
          :network="transactionConfig.network"
        />
      </div>
    </div>
  </div>
</template>
