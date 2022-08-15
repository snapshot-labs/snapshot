<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import mapKeys from 'lodash/fp/mapKeys';
import { getAddress } from '@ethersproject/address';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { getBlockNumber } from '@snapshot-labs/snapshot.js/src/utils/web3';
import { getScores } from '@snapshot-labs/snapshot.js/src/utils';
import { decodeJson, encodeJson } from '@/helpers/b64';
import { useI18n, useCopy, useStrategies, useIntl } from '@/composables';

const defaultParams = {
  symbol: 'BAL',
  address: '0xba100000625a3754423978a60c9317c58a424e3D',
  decimals: 18
};

const router = useRouter();
const route = useRoute();
const { query: queryParams } = useRoute();
const { copyToClipboard } = useCopy();
const { t, setPageTitle } = useI18n();
const { formatCompactNumber } = useIntl();
const {
  getExtendedStrategy,
  extendedStrategy: strategy,
  strategyDefinition
} = useStrategies();

let provider;

const strategyExample = computed(() => {
  if (queryParams.query) {
    try {
      const { params, network, snapshot, addresses } = decodeJson(
        queryParams.query
      );
      return {
        ...strategy.value?.examples?.[0],
        addresses,
        network,
        snapshot,
        strategy: { params }
      };
    } catch (e) {
      return strategy.value?.examples?.[0];
    }
  }
  return strategy.value?.examples?.[0];
});

const loading = ref(false);
const strategyError = ref(null);
const networkError = ref(null);
const scores = ref(null);
const form = ref({
  params: {},
  network: '1',
  snapshot: '',
  addresses: []
});

const scoresWithZeroBalanceAddresses = computed(() => {
  if (!scores.value) {
    return null;
  }
  // If an address is not present inside the scoresObject, add it with a zero balance
  const addressesArray = (form.value.addresses ?? []).map(getAddress);
  const scoresObject = mapKeys(getAddress, scores.value[0] ?? {});
  const scoresObjectWithZeroBalances = addressesArray.reduce((acc, address) => {
    acc[address] = scoresObject[address] || 0;
    return acc;
  }, {});
  // Order scoreObjectWithZeroBalances by score
  return Object.fromEntries(
    Object.entries(scoresObjectWithZeroBalances).sort((a, b) => b[1] - a[1])
  );
});

async function loadScores() {
  scores.value = null;
  strategyError.value = null;
  loading.value = true;

  try {
    const strategyParams = {
      name: strategy.value.id,
      params: form.value.params
    };
    scores.value = await getScores(
      '',
      [strategyParams],
      form.value.network,
      form.value.addresses,
      parseInt(form.value.snapshot),
      `${import.meta.env.VITE_SCORES_URL}/api/scores`
    );
    loading.value = false;
  } catch (e) {
    loading.value = false;
    console.log(e);
    strategyError.value = e;
  }
}

async function loadSnapshotBlockNumber() {
  try {
    provider = await getProvider(form.value.network);
    form.value.snapshot = await getBlockNumber(provider);
    loading.value = false;
  } catch (e) {
    loading.value = false;
    networkError.value = true;
    console.log(e);
  }
}

async function handleURLUpdate(_, paramName) {
  router.replace({
    query: { query: encodeJson(form.value) },
    params: { retainScrollPosition: true }
  });

  if (paramName === 'networkUpdate') {
    loading.value = true;
    scores.value = null;
    networkError.value = false;
    loadSnapshotBlockNumber();
  }
}

function copyURL() {
  copyToClipboard(
    `${window.location.origin}/#${route.path}?query=${encodeJson(form.value)}`
  );
}

watch(
  strategyExample,
  () => {
    form.value.params = strategyExample.value?.strategy.params ?? defaultParams;
    form.value.network = strategyExample.value?.network ?? '1';
    form.value.addresses = strategyExample.value?.addresses ?? [];
  },
  { immediate: true }
);

onMounted(async () => {
  getExtendedStrategy(route.params.name);
  setPageTitle('page.title.playground');

  loading.value = true;
  scores.value = null;
  networkError.value = false;
  if (queryParams.query && strategyExample.value.snapshot) {
    form.value.snapshot = strategyExample.value.snapshot;
    loading.value = false;
  } else {
    loadSnapshotBlockNumber();
  }
});

function handleNetworkSelect(value) {
  form.value.network = value;
  handleURLUpdate(null, 'networkUpdate');
}
</script>

<template>
  <TheLayout v-bind="$attrs">
    <template #content-left>
      <LoadingPage v-if="!strategy" />
      <div v-else>
        <div class="mb-3 px-4 md:px-0">
          <router-link :to="{ path: `/strategy/${$route.params.name}` }">
            <ButtonBack />
          </router-link>
        </div>
        <h1 class="mb-2 px-4 md:px-0">
          {{ strategy.id }}
        </h1>
        <div class="space-y-3">
          <BaseBlock :title="$t('settings.header')">
            <div class="space-y-2">
              <ComboboxNetwork
                :network="form.network"
                @select="handleNetworkSelect"
              />
              <BaseInput
                v-model="form.snapshot"
                :title="$t('snapshot')"
                @update:modelValue="handleURLUpdate"
              />
            </div>
            <BaseBlock
              v-if="networkError"
              class="mt-4"
              style="border-color: red !important"
            >
              <BaseIcon name="warning" class="mr-2 !text-red" />
              <span class="!text-red">{{ $t('networkErrorPlayground') }}</span>
            </BaseBlock>
          </BaseBlock>
          <BaseBlock :title="$t('strategyParams')">
            <FormObject
              v-if="strategyDefinition"
              v-model="form.params"
              :definition="strategyDefinition"
            />
            <TextareaJson
              v-else
              v-model="form.params"
              :placeholder="$t('strategyParameters')"
              class="input text-left"
              @update:modelValue="handleURLUpdate"
            />
            <BaseBlock
              v-if="strategyError"
              style="border-color: red !important"
            >
              <BaseIcon name="warning" class="mr-2 !text-red" />
              <span class="!text-red"> {{ strategyError }}</span>
            </BaseBlock>
          </BaseBlock>
          <BaseBlock :title="$t('addresses')">
            <TextareaArray
              v-model="form.addresses"
              :placeholder="`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`"
              @change:modelValue="handleURLUpdate"
            />
          </BaseBlock>
        </div>
      </div>
    </template>
    <template #sidebar-right>
      <div class="space-y-3">
        <BaseBlock :title="$t('actions')">
          <BaseButton
            :loading="loading"
            :disabled="loading || !strategy"
            class="w-full"
            :style="[loading ? '' : 'padding-top: 0.2rem']"
            primary
            @click="loadScores"
          >
            <BaseIcon name="play" size="18" />
          </BaseButton>
          <BaseButton class="mt-2 w-full" @click="copyURL">
            <BaseIcon
              name="insertlink"
              size="18"
              class="mr-1 align-text-bottom"
            />
            {{ t('copyLink') }}
          </BaseButton>
        </BaseBlock>
        <BaseBlock v-if="scores" :title="$t('results')">
          <div
            v-for="(score, key) in scoresWithZeroBalanceAddresses"
            :key="score"
            class="flex justify-between"
          >
            <BaseUser :address="key" :space="form" />
            <span>
              {{ formatCompactNumber(score) }}
              {{ form.params.symbol }}
            </span>
          </div>
        </BaseBlock>
      </div>
    </template>
  </TheLayout>
</template>
