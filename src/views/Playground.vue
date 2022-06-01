<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import mapKeys from 'lodash/fp/mapKeys';
import { getAddress } from '@ethersproject/address';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { getBlockNumber } from '@snapshot-labs/snapshot.js/src/utils/web3';
import { getScores } from '@snapshot-labs/snapshot.js/src/utils';
import { useI18n } from '@/composables/useI18n';
import { useCopy } from '@/composables/useCopy';
import { decode, encode } from '@/helpers/b64';
import { useIntl } from '@/composables/useIntl';
import { useStrategies } from '@/composables/useStrategies';
import { validateSchema } from '@snapshot-labs/snapshot.js/src/utils';

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
      const { params, network, snapshot, addresses } = JSON.parse(
        decode(queryParams.query)
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

const modalNetworksOpen = ref(false);
const loading = ref(false);
const strategyError = ref(null);
const networkError = ref(null);
const scores = ref(null);
const form = ref({
  params: {},
  network: 1,
  snapshot: '',
  addresses: []
});

const strategyValidationErrors = computed(
  () => validateSchema(strategyDefinition.value, form.value.params) ?? []
);

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
      form.value.network.toString(),
      form.value.addresses,
      parseInt(form.value.snapshot),
      import.meta.env.VITE_SCORES_URL + '/api/scores'
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
    provider = await getProvider(form.value.network, 'light');
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
    query: { query: encode(JSON.stringify(form.value)) },
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
    `${window.location.origin}/#${route.path}?query=${encode(
      JSON.stringify(form.value)
    )}`
  );
}

watch(
  strategyExample,
  () => {
    form.value.params = strategyExample.value?.strategy.params ?? defaultParams;
    form.value.network = strategyExample.value?.network ?? 1;
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

  if (queryParams.query) {
    form.value.snapshot = strategyExample.value.snapshot;
    loading.value = false;
  } else {
    loadSnapshotBlockNumber();
  }
});
</script>

<template>
  <TheLayout v-bind="$attrs">
    <template #content-left>
      <LoadingPage v-if="!strategy" />
      <div v-else>
        <div class="px-4 md:px-0 mb-3">
          <router-link
            :to="`/strategy/${$route.params.name}`"
            class="text-skin-text"
          >
            <BaseIcon name="back" size="22" class="!align-middle" />
            {{ $t('back') }}
          </router-link>
        </div>
        <h1 class="mb-2 px-4 md:px-0">
          {{ strategy.id }}
        </h1>
        <div class="space-y-3">
          <BaseBlock :title="$t('settings.header')">
            <div class="space-y-2">
              <UiInput @click="modalNetworksOpen = true">
                <template v-slot:selected>
                  {{
                    form.network
                      ? networks[form.network].name
                      : $t('selectNetwork')
                  }}
                </template>
                <template v-slot:label> {{ $t(`settings.network`) }} </template>
              </UiInput>
              <UiInput
                v-model="form.snapshot"
                @update:modelValue="handleURLUpdate"
              >
                <template v-slot:label>
                  {{ $t('snapshot') }}
                </template>
              </UiInput>
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
            <SDefaultObject
              v-if="strategyDefinition"
              v-model="form.params"
              :definition="strategyDefinition"
              :errors="strategyValidationErrors"
            />
            <TextareaJson
              v-else
              v-model="form.params"
              @update:modelValue="handleURLUpdate"
              :placeholder="$t('strategyParameters')"
              class="input text-left"
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
              @change:modelValue="handleURLUpdate"
              :placeholder="`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`"
              class="input w-full text-left"
              style="font-size: 18px"
            />
          </BaseBlock>
        </div>
      </div>
    </template>
    <template #sidebar-right>
      <div class="space-y-3">
        <BaseBlock :title="$t('actions')">
          <BaseButton
            @click="loadScores"
            :loading="loading"
            :disabled="loading || !strategy"
            class="w-full"
            :style="[loading ? '' : 'padding-top: 0.2rem']"
            primary
          >
            <BaseIcon name="play" size="18" />
          </BaseButton>
          <BaseButton @click="copyURL" class="w-full mt-2">
            <BaseIcon
              name="insertlink"
              size="18"
              class="align-text-bottom mr-1"
            />
            {{ t('copyLink') }}
          </BaseButton>
        </BaseBlock>
        <BaseBlock v-if="scores" :title="$t('results')">
          <div
            class="flex justify-between"
            v-for="(score, key) in scoresWithZeroBalanceAddresses"
            :key="score"
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
  <teleport to="#modal">
    <ModalNetworks
      :open="modalNetworksOpen"
      @close="modalNetworksOpen = false"
      v-model="form.network"
      @update:modelValue="event => handleURLUpdate(event, 'networkUpdate')"
    />
  </teleport>
</template>
