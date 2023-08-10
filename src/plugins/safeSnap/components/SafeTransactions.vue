<script>
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { getIpfsUrl, shorten } from '@/helpers/utils';
import SafeSnapTooltip from './Tooltip.vue';
import SafeSnapHandleOutcome from './HandleOutcome.vue';
import SafeSnapHandleOutcomeUma from './HandleOutcomeUma.vue';
import SafeSnapFormImportTransactionsButton from './Form/ImportTransactionsButton.vue';
import SafeSnapFormTransactionBatch from './Form/TransactionBatch.vue';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import { formatUnits } from '@ethersproject/units';
import Plugin, {
  createBatch,
  EIP3770_PREFIXES,
  getGnosisSafeBalances,
  getGnosisSafeCollectibles
} from '../index';

const plugin = new Plugin();

export const ensureRightNetwork = async chainId => {
  const chainIdInt = parseInt(chainId);
  const connectedToChainId = getInstance().provider.value?.chainId;
  if (connectedToChainId === chainIdInt) return; // already on right chain

  if (!window.ethereum || !getInstance().provider.value?.isMetaMask) {
    // we cannot switch automatically
    throw new Error(
      `Connected to wrong chain #${connectedToChainId}, required: #${chainId}`
    );
  }

  const network = networks[chainId];
  const chainIdHex = `0x${chainIdInt.toString(16)}`;

  try {
    // check if the chain to connect to is installed
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }] // chainId must be in hexadecimal numbers
    });
  } catch (error) {
    // This error code indicates that the chain has not been added to MetaMask. Let's add it.
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainIdHex,
              chainName: network.name,
              rpcUrls: network.rpc,
              blockExplorerUrls: [network.explorer.url]
            }
          ]
        });
      } catch (addError) {
        console.error(addError);
      }
    }
    console.error(error);
  }

  await sleep(1e3); // somehow the switch does not take immediate effect :/
  if (window.ethereum.chainId !== chainIdHex) {
    throw new Error(
      `Could not switch to the right chain on MetaMask (required: ${chainIdHex}, active: ${window.ethereum.chainId})`
    );
  }
};

async function fetchBalances(network, safeAddress) {
  if (!safeAddress) {
    return [];
  }

  try {
    const balances = await getGnosisSafeBalances(network, safeAddress);

    const uniswapTokensPromise = fetchTokens(
      'https://gateway.ipfs.io/ipns/tokens.uniswap.org'
    );
    const snapshotTokensPromise = fetchTokens(
      `${import.meta.env.VITE_SIDEKICK_URL}/api/moderation?list=verifiedTokens`
    );

    const tokensLists = await Promise.all([
      uniswapTokensPromise,
      snapshotTokensPromise
    ]);
    const tokens = tokensLists.flat();

    return sortBalances(enhanceBalances(balances, tokens));
  } catch (e) {
    console.warn('Error fetching balances');
    return [];
  }
}

function fetchTokens(url) {
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      return data.verifiedTokens?.tokens || data.tokens || [];
    })
    .catch(() => []);
}

function enhanceBalances(balances, tokens) {
  return balances
    .filter(balance => balance.token)
    .map(balance => enhanceBalance(balance, tokens));
}

function enhanceBalance(balance, tokens) {
  const verifiedToken = getVerifiedToken(balance.tokenAddress, tokens);
  return {
    ...balance.token,
    address: balance.tokenAddress,
    balance: balance.balance
      ? formatUnits(balance.balance, balance.token.decimals)
      : 0,
    verified: !!verifiedToken,
    chainId: verifiedToken ? verifiedToken.chainId : undefined
  };
}

function getVerifiedToken(tokenAddress, tokens) {
  return tokens.find(
    token => token.address.toLowerCase() === tokenAddress.toLowerCase()
  );
}

function sortBalances(balances) {
  return balances.sort((a, b) => b.verified - a.verified);
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

function formatBatches(network, module, batches, multiSend) {
  if (batches.length) {
    const batchSample = batches[0];
    if (Array.isArray(batchSample)) {
      const chainId = parseInt(network);
      return batches.map((txs, index) =>
        createBatch(module, chainId, index, txs, multiSend)
      );
    }
  }
  return batches;
}

export default {
  components: {
    SafeSnapTooltip,
    SafeSnapFormImportTransactionsButton,
    SafeSnapHandleOutcome,
    SafeSnapHandleOutcomeUma,
    SafeSnapFormTransactionBatch
  },
  props: [
    'modelValue',
    'proposal',
    'space',
    'results',
    'network',
    'realityAddress',
    'umaAddress',
    'multiSendAddress',
    'preview',
    'hash'
  ],
  emits: ['update:modelValue'],
  setup() {
    return { shorten };
  },
  data() {
    return {
      input: formatBatches(
        this.network,
        this.realityAddress,
        this.modelValue,
        this.multiSendAddress
      ),
      gnosisSafeAddress: undefined,
      moduleType: undefined,
      moduleAddress: undefined,
      moduleTypeReady: false,
      showHash: false,
      transactionConfig: {
        preview: this.preview,
        gnosisSafeAddress: undefined,
        realityAddress: this.realityAddress,
        umaAddress: this.umaAddress,
        network: this.network,
        multiSendAddress: this.multiSendAddress,
        tokens: [],
        collectables: []
      }
    };
  },
  computed: {
    safeLink() {
      const prefix = EIP3770_PREFIXES[this.network];
      return `https://gnosis-safe.io/app/${prefix}:${this.gnosisSafeAddress}`;
    },
    networkName() {
      if (this.network === '1') return 'Mainnet';
      const { shortName, name } = networks[this.network] || {};
      return shortName || name || `#${this.network}`;
    },
    networkIcon() {
      const { logo } = networks[this.network];
      return getIpfsUrl(logo);
    },
    proposalResolved() {
      const ts = (Date.now() / 1e3).toFixed();
      return ts > this.proposal.end;
    }
  },
  async mounted() {
    try {
      const moduleType = await plugin.validateUmaModule(
        this.network,
        this.umaAddress
      );

      const { dao } =
        moduleType === 'reality'
          ? await plugin.getModuleDetailsReality(
              this.network,
              this.realityAddress
            )
          : await plugin.getModuleDetailsUma(this.network, this.umaAddress);

      const moduleAddress =
        moduleType === 'reality' ? this.realityAddress : this.umaAddress;

      this.moduleType = moduleType;
      this.moduleAddress = moduleAddress;
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
      this.moduleTypeReady = true;
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    addTransactionBatch() {
      this.input.push(
        createBatch(
          this.moduleAddress,
          parseInt(this.network),
          this.input.length,
          [],
          this.multiSendAddress
        )
      );
      this.$emit('update:modelValue', this.input);
    },
    removeBatch(index) {
      this.input.splice(index, 1);
      this.$emit('update:modelValue', this.input);
    },
    updateTransactionBatch(index, batch) {
      this.input[index] = batch;
      this.$emit('update:modelValue', this.input);
    },
    handleImport(txs) {
      this.input.push(
        createBatch(
          this.moduleAddress,
          parseInt(this.network),
          this.input.length,
          txs,
          this.multiSendAddress
        )
      );
      this.$emit('update:modelValue', this.input);
    }
  }
};
</script>

<template>
  <div>
    <h4
      class="flex rounded-t-none border-b px-4 pb-[12px] pt-3 md:rounded-t-md"
    >
      <BaseAvatar class="float-left mr-2" :src="networkIcon" size="28" />
      {{ networkName }} Safe
      <a
        v-if="gnosisSafeAddress"
        :href="safeLink"
        class="ml-2 flex font-normal text-skin-text"
        target="_blank"
      >
        {{ shorten(gnosisSafeAddress) }}
        <i-ho-external-link class="ml-1" />
      </a>
      <div class="flex-grow"></div>
      <SafeSnapTooltip
        v-if="moduleTypeReady"
        :module-address="moduleAddress"
        :multi-send-address="multiSendAddress"
        :module-type="moduleType"
      />
      <LoadingSpinner v-else />
    </h4>
    <UiCollapsibleText
      v-if="hash"
      :show-arrow="true"
      :open="showHash"
      :text="hash"
      class="border-b"
      style="border-width: 0 0 1px 0 !important"
      title="Complete Transaction Hash"
      @toggle="showHash = !showHash"
    />
    <div class="text-center">
      <div
        v-for="(batch, index) in input"
        :key="index"
        class="border-b last:border-b-0"
      >
        <SafeSnapFormTransactionBatch
          :config="transactionConfig"
          :model-value="batch"
          :nonce="index"
          @remove="removeBatch(index)"
          @update:modelValue="updateTransactionBatch(index, $event)"
        />
      </div>

      <div v-if="!preview || proposalResolved">
        <BaseButton v-if="!preview" class="my-3" @click="addTransactionBatch">
          {{ $t('safeSnap.addBatch') }}
        </BaseButton>

        <SafeSnapFormImportTransactionsButton
          v-if="!preview"
          :network="network"
          @import="handleImport($event)"
        />

        <SafeSnapHandleOutcome
          v-if="
            preview &&
            proposalResolved &&
            moduleType === 'reality' &&
            moduleTypeReady
          "
          :batches="input"
          :proposal="proposal"
          :reality-address="transactionConfig.realityAddress"
          :multi-send-address="transactionConfig.multiSendAddress"
          :network="transactionConfig.network"
        />

        <SafeSnapHandleOutcomeUma
          v-if="
            preview &&
            proposalResolved &&
            moduleType === 'uma' &&
            moduleTypeReady
          "
          :batches="input"
          :proposal="proposal"
          :space="space"
          :results="results"
          :uma-address="transactionConfig.umaAddress"
          :multi-send-address="transactionConfig.multiSendAddress"
          :network="transactionConfig.network"
        />
      </div>
    </div>
  </div>
</template>
