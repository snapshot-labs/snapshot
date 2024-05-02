<script setup lang="ts">
import { GnosisSafe, NFT, Token, Transaction } from './types';
import { fetchBalances, fetchCollectibles } from './utils';
import { cloneDeep } from 'lodash';
import SelectSafe from './components/Input/SelectSafe.vue';
import TransactionBuilder from './components/TransactionBuilder/TransactionBuilder.vue';
import BotSupportWarning from './components/BotSupportWarning.vue';

// PROPS
const props = defineProps<{
  allSafes: GnosisSafe[];
  unconfiguredSafes: GnosisSafe[];
  safe: GnosisSafe;
}>();

// VARS
const configuredSafe = ref<GnosisSafe>();
const tokens = ref<Token[]>([]);
const collectibles = ref<NFT[]>([]);
const isLoading = ref(false);

// EMITS

// emits an event with the shape expected by the parent of the plugin component
const emit = defineEmits<{
  updateSafe: [value: GnosisSafe];
  addSafe: [value: GnosisSafe];
  removeSafe: [];
}>();

// METHODS
function update(newlyConfiguredSafe: GnosisSafe) {
  emit('updateSafe', newlyConfiguredSafe);
}

// METHODS
function removeSafe() {
  if (configuredSafe.value) {
    emit('removeSafe');
  }
}

// when changing safes, we create a whole new object and replace it
function replaceSafe(safe: GnosisSafe | null) {
  if (!safe) return;
  configuredSafe.value = cloneDeep(safe);
  update(configuredSafe.value);
}

function addTransaction(transaction: Transaction) {
  if (!configuredSafe.value) return;
  configuredSafe.value.transactions.push(transaction);
}

function removeTransaction(transactionIndex: number) {
  if (!configuredSafe.value) return;
  configuredSafe.value.transactions.splice(transactionIndex, 1);
}

function updateTransaction(transaction: Transaction, transactionIndex: number) {
  if (!configuredSafe.value) return;
  configuredSafe.value.transactions[transactionIndex] = transaction;
}

// fetch tokens and nfts for selected safe
async function loadBalancesAndCollectibles() {
  if (!configuredSafe.value?.safeAddress) return;
  isLoading.value = true;
  tokens.value = await fetchBalances(
    configuredSafe.value.network,
    configuredSafe.value.safeAddress
  );
  collectibles.value = await fetchCollectibles(
    configuredSafe.value.network,
    configuredSafe.value.safeAddress
  );
  isLoading.value = false;
}

async function loadBalancesAndUpdate() {
  isLoading.value = true;
  // fetch tokens and nfts
  await loadBalancesAndCollectibles();
  isLoading.value = false;

  if (configuredSafe.value) {
    update(configuredSafe.value);
  }
}

watch(
  () => [configuredSafe.value?.safeAddress, configuredSafe.value?.network],
  loadBalancesAndUpdate
);

onMounted(async () => {
  // take the first safe available
  configuredSafe.value = cloneDeep(props.safe);
  loadBalancesAndUpdate();
});
</script>

<template>
  <div class="flex p-4 flex-col gap-0 relative pb-4">
    <button class="text-red ml-auto" @click="removeSafe">
      Remove treasury
    </button>
    <h2 class="text-md">Add oSnap transactions</h2>
    <h3 class="text-base">Pick a safe</h3>
    <SelectSafe
      :safes="[...unconfiguredSafes, configuredSafe ?? props.safe]"
      :selectedSafe="configuredSafe ?? props.safe"
      @updateSafe="replaceSafe($event)"
    />
    <BotSupportWarning
      v-if="configuredSafe"
      :safe-address="configuredSafe.safeAddress"
      :chain-id="configuredSafe.network"
    />
    <div class="mt-4 border-b last:border-b-0">
      <TransactionBuilder
        v-if="!!configuredSafe"
        :safe="configuredSafe"
        :tokens="tokens"
        :collectibles="collectibles"
        @add-transaction="addTransaction"
        @remove-transaction="removeTransaction"
        @update-transaction="updateTransaction"
      />
    </div>
  </div>
</template>
