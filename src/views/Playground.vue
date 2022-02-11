<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { getBlockNumber } from '@snapshot-labs/snapshot.js/src/utils/web3';
import { getScores } from '@snapshot-labs/snapshot.js/src/utils';
import { useI18n } from '@/composables/useI18n';
import { useCopy } from '@/composables/useCopy';
import { decode, encode } from '@/helpers/b64';
import { useIntl } from '@/composables/useIntl';
import { useStrategies } from '@/composables/useStrategies';

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
  <Layout v-bind="$attrs">
    <template #content-left>
      <PageLoading v-if="!strategy" />
      <div v-else>
        <div class="px-4 md:px-0 mb-3">
          <router-link
            :to="`/strategy/${$route.params.name}`"
            class="text-color"
          >
            <Icon name="back" size="22" class="!align-middle" />
            {{ $t('back') }}
          </router-link>
        </div>
        <div class="">
          <h1 class="mb-2 px-4 md:px-0">
            {{ strategy.id }}
          </h1>
          <Block :title="$t('settings.header')">
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
            <Block
              v-if="networkError"
              class="mt-4"
              style="border-color: red !important"
            >
              <Icon name="warning" class="mr-2 !text-red" />
              <span class="!text-red">{{ $t('networkErrorPlayground') }}</span>
            </Block>
          </Block>
          <Block :title="$t('strategyParams')">
            <SDefaultObject
              v-if="strategyDefinition"
              v-model="form.params"
              :definition="strategyDefinition"
            />
            <UiButton
              v-else
              class="block w-full mb-3 overflow-x-auto"
              style="height: auto"
            >
              <TextareaJson
                v-model="form.params"
                @update:modelValue="handleURLUpdate"
                :placeholder="$t('strategyParameters')"
                class="input text-left"
              />
            </UiButton>
            <Block v-if="strategyError" style="border-color: red !important">
              <Icon name="warning" class="mr-2 !text-red" />
              <span class="!text-red"> {{ strategyError }}</span>
            </Block>
          </Block>
          <Block :title="$t('addresses')">
            <UiButton class="block w-full px-3" style="height: auto">
              <TextareaArray
                v-model="form.addresses"
                @change:modelValue="handleURLUpdate"
                :placeholder="`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`"
                class="input w-full text-left"
                style="font-size: 18px"
              />
            </UiButton>
          </Block>
        </div>
      </div>
    </template>
    <template #sidebar-right>
      <Block :title="$t('actions')">
        <UiButton
          @click="loadScores"
          :loading="loading"
          :disabled="loading || !strategy"
          class="w-full"
          :style="[loading ? '' : 'padding-top: 0.2rem']"
          primary
        >
          <Icon name="play" size="18" />
        </UiButton>
        <UiButton @click="copyURL" class="w-full mt-2">
          <Icon name="insertlink" size="18" class="align-text-bottom mr-1" />
          {{ t('copyLink') }}
        </UiButton>
      </Block>
      <Block v-if="scores" :title="$t('results')">
        <div
          class="flex justify-between"
          v-for="score in Object.keys(scores[0])"
          :key="score"
        >
          <User :address="score" :space="form" />
          <span>
            {{ formatCompactNumber(scores[0][score]) }}
            {{ form.params.symbol }}
          </span>
        </div>
      </Block>
    </template>
  </Layout>
  <teleport to="#modal">
    <ModalNetworks
      :open="modalNetworksOpen"
      @close="modalNetworksOpen = false"
      v-model="form.network"
      @update:modelValue="event => handleURLUpdate(event, 'networkUpdate')"
    />
  </teleport>
</template>
