<template>
  <Layout>
    <template #content-left>
      <div class="px-4 px-md-0 mb-3">
        <router-link :to="`/strategy/${$route.params.name}`" class="text-gray">
          <Icon name="back" size="22" class="v-align-middle" />
          {{ $t('back') }}
        </router-link>
      </div>
      <div class="px-4 px-md-0">
        <h1 class="mb-2">
          {{ strategy.key }}
        </h1>
        <Block :title="$t('settings.header')">
          <UiInput @click="modalNetworksOpen = true">
            <template v-slot:selected>
              {{
                form.network ? networks[form.network].name : $t('selectNetwork')
              }}
            </template>
            <template v-slot:label> {{ $t(`settings.network`) }} </template>
          </UiInput>
          <UiInput v-model="form.snapshot">
            <template v-slot:label>
              {{ $t('snapshot') }}
            </template>
          </UiInput>
          <Block
            v-if="networkError"
            class="mt-4"
            style="border-color: red !important"
          >
            <Icon name="warning" class="mr-2 text-red" />
            <span class="text-red">{{ $t('networkErrorPlayground') }}</span>
          </Block>
        </Block>
        <Block :title="$t('strategyParams')">
          <UiButton
            class="d-block width-full mb-3 overflow-x-auto"
            style="height: auto"
          >
            <TextareaAutosize
              v-model="form.params"
              :placeholder="$t('strategyParameters')"
              class="input text-left"
              style="width: 560px"
            />
          </UiButton>
          <Block v-if="strategyError" style="border-color: red !important">
            <Icon name="warning" class="mr-2 text-red" />
            <span class="text-red"> {{ strategyError }}</span>
          </Block>
        </Block>
        <Block :title="$t('addresses')">
          <UiButton class="d-block width-full px-3" style="height: auto">
            <TextareaArray
              v-model="form.addresses"
              :placeholder="`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`"
              class="input width-full text-left"
              style="font-size: 18px"
            />
          </UiButton>
        </Block>
      </div>
    </template>
    <template #sidebar-right>
      <Block :title="$t('actions')">
        <UiButton
          @click="loadScores"
          :loading="loading"
          :disables="loading"
          class="width-full button--submit"
          :style="[loading ? '' : 'padding-top: 0.2rem']"
        >
          <Icon name="play" size="18" />
        </UiButton>
      </Block>
      <Block v-if="scores" :title="$t('results')">
        <div v-for="score in Object.keys(scores[0])" :key="score">
          <User :address="score" />
          <span class="float-right"
            >{{ _n(scores[0][score]) }}
            {{ JSON.parse(form.params).symbol }}</span
          >
        </div>
      </Block>
    </template>
  </Layout>
  <teleport to="#modal">
    <ModalNetworks
      :open="modalNetworksOpen"
      @close="modalNetworksOpen = false"
      v-model="form.network"
    />
  </teleport>
</template>

<script>
import { watchEffect, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import strategies from '@/helpers/strategies';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { getBlockNumber } from '@snapshot-labs/snapshot.js/src/utils/web3';
import { getScores } from '@snapshot-labs/snapshot.js/src/utils';

const defaultParams = {
  symbol: 'BAL',
  address: '0xba100000625a3754423978a60c9317c58a424e3D',
  decimals: 18
};

export default {
  setup() {
    const route = useRoute();
    let provider;

    const strategy = computed(() => strategies[route.params.name]);
    const strategyExample = computed(() => strategy.value.examples?.[0]);

    const modalNetworksOpen = ref(false);
    const loading = ref(false);
    const strategyError = ref(null);
    const networkError = ref(null);
    const scores = ref(null);
    const form = ref({
      params: JSON.stringify(
        strategyExample.value?.strategy.params ?? defaultParams,
        null,
        2
      ),
      network: 1,
      snapshot: '',
      addresses: strategyExample.value?.addresses ?? []
    });

    async function loadScores() {
      scores.value = null;
      strategyError.value = null;
      loading.value = true;
      try {
        const strategyParams = {
          __typename: 'Strategy',
          name: strategy.value.key,
          params: JSON.parse(form.value.params)
        };
        const blockNumber = await getBlockNumber(provider);
        const blockTag =
          form.value.snapshot > blockNumber
            ? 'latest'
            : parseInt(form.value.snapshot);
        scores.value = await getScores(
          '',
          [strategyParams],
          form.value.network,
          provider,
          form.value.addresses,
          blockTag
        );
        console.log(scores.value);
        loading.value = false;
      } catch (e) {
        loading.value = false;
        console.log(e);
        strategyError.value = e;
      }
    }

    watchEffect(async () => {
      loading.value = true;
      scores.value = null;
      networkError.value = false;
      try {
        provider = await getProvider(form.value.network);
        form.value.snapshot = await getBlockNumber(provider);
        loading.value = false;
      } catch (e) {
        loading.value = false;
        networkError.value = true;
        console.log(e);
      }
    });

    return {
      form,
      modalNetworksOpen,
      networks,
      loading,
      strategy,
      loadScores,
      scores,
      strategyError,
      networkError
    };
  }
};
</script>
