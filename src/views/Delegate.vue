<script setup>
import { ref, computed, watch, onMounted, watchEffect, inject } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useProfiles } from '@/composables/useProfiles';
import { isAddress } from '@ethersproject/address';
import { formatBytes32String } from '@ethersproject/strings';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import {
  sendTransaction,
  getScores
} from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { sleep } from '@snapshot-labs/snapshot.js/src/utils';
import {
  getDelegates,
  getDelegators,
  getDelegatesBySpace,
  contractAddress
} from '@/helpers/delegation';
import { useApp } from '@/composables/useApp';
import { useWeb3 } from '@/composables/useWeb3';
import { useTxStatus } from '@/composables/useTxStatus';
import { useExtendedSpaces } from '@/composables/useExtendedSpaces';
import { shorten, setPageTitle, n } from '@/helpers/utils';

const abi = ['function setDelegate(bytes32 id, address delegate)'];

const route = useRoute();
const { t } = useI18n();
const auth = getInstance();
const notify = inject('notify');
const { explore } = useApp();
const { web3, web3Account } = useWeb3();
const { pendingCount } = useTxStatus();
const { loadExtentedSpaces, extentedSpaces, spaceLoading } =
  useExtendedSpaces();

const modalOpen = ref(false);
const currentId = ref('');
const currentDelegate = ref('');
const loaded = ref(false);
const loading = ref(false);
const delegatesLoading = ref(false);
const delegates = ref([]);
const delegatesWithScore = ref([]);
const delegators = ref([]);
const form = ref({
  address: route.params.to || '',
  id: route.params.key || ''
});

const { profiles, loadProfiles } = useProfiles();

const networkKey = computed(() => web3.value.network.key);
const space = computed(() => explore.value.spaces[form.value.id]);

const isValid = computed(() => {
  const address = form.value.address;
  return (
    auth.isAuthenticated.value &&
    web3Account.value &&
    (address.includes('.eth') || isAddress(address)) &&
    address.toLowerCase() !== web3Account.value.toLowerCase() &&
    (form.value.id === '' || explore.value.spaces[form.value.id])
  );
});

async function load() {
  if (web3Account.value) {
    const [delegatesObj, delegatorsObj] = await Promise.all([
      getDelegates(networkKey.value, web3Account.value),
      getDelegators(networkKey.value, web3Account.value)
    ]);
    delegates.value = delegatesObj.delegations;
    delegators.value = delegatorsObj.delegations;
  }
}

async function handleSubmit() {
  loading.value = true;
  try {
    let address = form.value.address;
    if (address.includes('.eth'))
      address = await getProvider('1').resolveName(address);
    const tx = await sendTransaction(
      auth.web3,
      contractAddress,
      abi,
      'setDelegate',
      [formatBytes32String(form.value.id), address]
    );
    pendingCount.value++;
    loading.value = false;
    const receipt = await tx.wait();
    console.log('Receipt', receipt);
    await sleep(3e3);
    notify(t('notify.delegationSuccess'));
    pendingCount.value--;
    await load();
  } catch (e) {
    pendingCount.value--;
    console.log(e);
  }
  loading.value = false;
}

function clearDelegate(id, delegate) {
  currentId.value = id;
  currentDelegate.value = delegate;
  modalOpen.value = true;
}

async function getDelegatesWithScore() {
  const delegationStrategy = extentedSpaces.value
    .find(s => s.id === form.value.id)
    .strategies.filter(strategy => strategy.name === 'delegation');
  if (delegationStrategy.length === 0) return;

  delegatesLoading.value = true;
  try {
    const delegationsRes = await Promise.all([
      getDelegatesBySpace(space.value.network, ''),
      getDelegatesBySpace(space.value.network, space.value.id)
    ]);

    const delegations = [
      ...delegationsRes[0].delegations,
      ...delegationsRes[1].delegations
    ];

    const uniqueDelegators = Array.from(
      new Set(delegations.map(d => d.delegate))
    ).map(delegate => {
      return delegations.find(a => a.delegate === delegate);
    });

    const delegatesAddresses = uniqueDelegators.map(d => d.delegate);

    const scores = await getScores(
      space.value.id,
      delegationStrategy,
      space.value.network,
      delegatesAddresses,
      'latest',
      import.meta.env.VITE_SCORES_URL + '/api/scores'
    );

    uniqueDelegators.forEach(delegate => {
      const delegationScore = scores[0];
      Object.entries(delegationScore).forEach(([address, score]) => {
        if (address === delegate.delegate) {
          delegate.score = score;
        }
      });
    });

    const sortedDelegates = uniqueDelegators
      .filter(delegate => delegate.score > 0)
      .sort((a, b) => b.score - a.score);

    delegatesWithScore.value = sortedDelegates;
    delegatesLoading.value = false;
  } catch (e) {
    delegatesLoading.value = false;
    console.log(e);
    return e;
  }
}

watchEffect(() => {
  loadProfiles(
    delegates.value
      .map(delegate => delegate.delegate)
      .concat(delegators.value.map(delegator => delegator.delegator))
      .concat(delegatesWithScore.value.map(delegate => delegate.delegate))
  );
});

watch(web3Account, (val, prev) => {
  if (val?.toLowerCase() !== prev) load();
});

watch(networkKey, (val, prev) => {
  if (val !== prev) load();
});

watchEffect(async () => {
  if (explore.value.spaces[form.value.id]) {
    await loadExtentedSpaces([form.value.id]);
    if (extentedSpaces.value.some(s => s.id === form.value.id))
      getDelegatesWithScore();
  } else delegatesWithScore.value = [];
});

onMounted(async () => {
  setPageTitle('page.title.delegate');
  await load();
  loaded.value = true;
});
</script>

<template>
  <Layout v-bind="$attrs">
    <template #content-left>
      <div class="px-4 md:px-0 mb-3">
        <router-link :to="{ path: '/' }" class="text-color">
          <Icon name="back" size="22" class="!align-middle" />
          {{ $t('backToHome') }}
        </router-link>
        <h1 v-if="loaded" v-text="$t('delegate.header')" />
      </div>
      <template v-if="loaded">
        <Block :title="$t('delegate.selectDelegate')">
          <UiInput
            v-model.trim="form.address"
            :placeholder="$t('delegate.addressPlaceholder')"
            class="mt-2"
          >
            <template v-slot:label>{{ $t('delegate.to') }}</template>
          </UiInput>
          <UiInput
            v-model.trim="form.id"
            :placeholder="$t('delegate.spacePlaceholder')"
          >
            <template v-slot:label>{{ $t('space') }}</template>
          </UiInput>
        </Block>
        <Block
          v-if="delegates.length > 0"
          :slim="true"
          :title="$t('delegate.delegations')"
        >
          <div
            v-for="(delegate, i) in delegates"
            :key="i"
            :style="i === 0 && 'border: 0 !important;'"
            class="px-4 py-3 border-t flex"
          >
            <User
              :address="delegate.delegate"
              :space="{ network: web3.network.key }"
              :profile="profiles[delegate.delegate]"
            />
            <div
              v-text="shorten(delegate.space || $t('allSpaces'), 'choice')"
              class="flex-auto text-right link-color"
            />
            <a
              @click="clearDelegate(delegate.space, delegate.delegate)"
              class="px-2 -mr-2 ml-2"
            >
              <Icon name="close" size="12" class="mb-1" />
            </a>
          </div>
        </Block>
        <Block
          v-if="delegators.length > 0"
          :slim="true"
          :title="$t('delegate.delegated')"
        >
          <div
            v-for="(delegator, i) in delegators"
            :key="i"
            :style="i === 0 && 'border: 0 !important;'"
            class="px-4 py-3 border-t flex"
          >
            <User
              :address="delegator.delegator"
              :space="{ network: web3.network.key }"
              :profile="profiles[delegator.delegator]"
            />
            <div
              v-text="shorten(delegator.space || '-', 'choice')"
              class="flex-auto text-right link-color"
            />
          </div>
        </Block>
        <Block
          v-if="
            delegatesLoading || spaceLoading || delegatesWithScore.length > 0
          "
          :title="$t('delegate.topDelegates')"
          :slim="true"
          :loading="delegatesLoading || spaceLoading"
        >
          <div
            v-for="(delegate, i) in delegatesWithScore"
            :key="i"
            :style="i === 0 && 'border: 0 !important;'"
            class="px-4 py-3 border-t flex"
          >
            <User
              :profile="profiles[delegate.delegate]"
              :address="delegate.delegate"
              :space="{ network: web3.network.key }"
              class="column"
            />
            <div class="flex-auto column text-right link-color">
              {{ delegate.score >= 0.005 ? n(delegate.score) : '> 0.01' }}
              {{ extentedSpaces.find(s => s.id === form.id).symbol }}
            </div>
          </div>
        </Block>
      </template>
      <PageLoading v-else />
    </template>
    <template #sidebar-right>
      <Block :title="$t('actions')">
        <UiButton
          @click="handleSubmit"
          :disabled="!isValid || !$auth.isAuthenticated.value"
          :loading="loading"
          class="block w-full"
          primary
        >
          {{ $t('confirm') }}
        </UiButton>
      </Block>
    </template>
  </Layout>
  <teleport to="#modal">
    <ModalClearDelegate
      v-if="loaded"
      :open="modalOpen"
      @close="modalOpen = false"
      @reload="load"
      :id="currentId"
      :delegate="currentDelegate"
      :profiles="profiles"
    />
  </teleport>
</template>
