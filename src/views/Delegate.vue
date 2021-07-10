<template>
  <Layout v-bind="$attrs">
    <template #content-left>
      <div class="px-4 px-md-0 mb-3">
        <router-link :to="{ name: 'home' }" class="text-gray">
          <Icon name="back" size="22" class="v-align-middle" />
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
            class="px-4 py-3 border-top d-flex"
          >
            <User
              :address="delegate.delegate"
              :space="{ network: web3.network.key }"
              :profile="profiles[delegate.delegate]"
            />
            <div
              v-text="_shorten(delegate.space || $t('allSpaces'), 'choice')"
              class="flex-auto text-right text-white"
            />
            <a
              @click="clearDelegate(delegate.space, delegate.delegate)"
              class="px-2 mr-n2 ml-2"
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
            class="px-4 py-3 border-top d-flex"
          >
            <User
              :address="delegator.delegator"
              :space="{ network: web3.network.key }"
              :profile="profiles[delegator.delegator]"
            />
            <div
              v-text="_shorten(delegator.space || '-', 'choice')"
              class="flex-auto text-right text-white"
            />
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
          class="d-block width-full button--submit"
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

<script>
import { ref, computed, watch, onMounted, watchEffect } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useProfiles } from '@/composables/useProfiles';
import { isAddress } from '@ethersproject/address';
import { formatBytes32String } from '@ethersproject/strings';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import abi from '@/helpers/abi';
import {
  getDelegates,
  getDelegators,
  contractAddress
} from '@/helpers/delegation';
import { sleep } from '@/helpers/utils';

export default {
  setup() {
    const route = useRoute();
    const store = useStore();
    const { t } = useI18n();
    const auth = getInstance();

    const modalOpen = ref(false);
    const currentId = ref('');
    const currentDelegate = ref('');
    const loaded = ref(false);
    const loading = ref(false);
    const delegates = ref([]);
    const delegators = ref([]);
    const form = ref({
      address: '',
      id: route.params.key || ''
    });

    const web3Account = computed(() => store.state.web3.account);
    const networkKey = computed(() => store.state.web3.network.key);

    const isValid = computed(() => {
      const address = form.value.address;
      return (
        auth.isAuthenticated.value &&
        (address.includes('.eth') || isAddress(address)) &&
        address.toLowerCase() !== web3Account.value.toLowerCase() &&
        (form.value.id === '' || store.state.app.spaces[form.value.id])
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
          abi['DelegateRegistry'],
          'setDelegate',
          [formatBytes32String(form.value.id), address]
        );
        const receipt = await tx.wait();
        console.log('Receipt', receipt);
        await sleep(3e3);
        store.dispatch('notify', t('notify.youDidIt'));
        await load();
      } catch (e) {
        console.log(e);
      }
      loading.value = false;
    }

    function clearDelegate(id, delegate) {
      currentId.value = id;
      currentDelegate.value = delegate;
      modalOpen.value = true;
    }

    const { profiles, addressArray } = useProfiles();

    watchEffect(() => {
      addressArray.value = delegates.value
        .map(delegate => delegate.delegate)
        .concat(delegators.value.map(delegator => delegator.delegator));
    });

    watch(web3Account, (val, prev) => {
      if (val?.toLowerCase() !== prev) load();
    });

    watch(networkKey, (val, prev) => {
      if (val !== prev) load();
    });

    onMounted(async () => {
      await load();
      loaded.value = true;
    });

    return {
      modalOpen,
      currentId,
      currentDelegate,
      loaded,
      loading,
      delegates,
      delegators,
      form,
      load,
      handleSubmit,
      isValid,
      clearDelegate,
      profiles
    };
  }
};
</script>
