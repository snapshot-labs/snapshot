<template>
  <Layout>
    <template #content-left>
      <div class="px-4 px-md-0 mb-3">
        <router-link :to="{ name: 'home' }" class="text-gray">
          <Icon name="back" size="22" class="v-align-middle" />
          {{ $t('backToHome') }}
        </router-link>
      </div>
      <div class="px-4 px-md-0">
        <h1 v-if="loaded" v-text="$t('delegate.header')" class="mb-4" />
        <PageLoading v-else />
      </div>
      <template v-if="loaded">
        <Block :itle="$t('delegate.selectAddress')">
          <UiButton class="width-full mb-2">
            <input
              v-model.trim="form.address"
              class="input width-full"
              :placeholder="$t('delegate.addressPlaceholder')"
            />
          </UiButton>
          <UiButton class="width-full mb-2">
            <input
              v-model.trim="form.id"
              class="input width-full"
              :placeholder="$t('delegate.spacePlaceholder')"
            />
          </UiButton>
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
            />
            <div
              v-text="_shorten(delegate.space || '-', 'choice')"
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
            />
            <div
              v-text="_shorten(delegator.space || '-', 'choice')"
              class="flex-auto text-right text-white"
            />
          </div>
        </Block>
      </template>
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
    />
  </teleport>
</template>

<script>
import { mapActions } from 'vuex';
import { isAddress } from '@ethersproject/address';
import { formatBytes32String } from '@ethersproject/strings';
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
  data() {
    return {
      modalOpen: false,
      currentId: '',
      currentDelegate: '',
      loaded: false,
      loading: false,
      delegates: [],
      delegators: [],
      form: {
        address: '',
        id: ''
      }
    };
  },
  watch: {
    'web3.account': async function(val, prev) {
      if (val?.toLowerCase() !== prev) await this.load();
    },
    'web3.network.key': async function(val, prev) {
      if (val !== prev) await this.load();
    }
  },
  async created() {
    await this.load();
    this.loaded = true;
  },
  computed: {
    isValid() {
      const address = this.form.address;
      return (
        this.$auth.isAuthenticated.value &&
        (address.includes('.eth') || isAddress(address)) &&
        address.toLowerCase() !== this.web3.account.toLowerCase() &&
        (this.form.id === '' || this.app.spaces[this.form.id])
      );
    }
  },
  methods: {
    ...mapActions(['notify']),
    async load() {
      if (this.web3.account) {
        const [delegates, delegators] = await Promise.all([
          getDelegates(this.web3.network.key, this.web3.account),
          getDelegators(this.web3.network.key, this.web3.account)
        ]);
        this.delegates = delegates.delegations;
        this.delegators = delegators.delegations;
      }
    },
    async handleSubmit() {
      this.loading = true;
      try {
        let address = this.form.address;
        if (address.includes('.eth'))
          address = await getProvider('1').resolveName(address);
        const tx = await sendTransaction(
          this.$auth.web3,
          contractAddress,
          abi['DelegateRegistry'],
          'setDelegate',
          [formatBytes32String(this.form.id), address]
        );
        const receipt = await tx.wait();
        console.log('Receipt', receipt);
        await sleep(3e3);
        this.notify(this.$t('notify.youDidIt'));
        await this.load();
      } catch (e) {
        console.log(e);
      }
      this.loading = false;
    },
    clearDelegate(id, delegate) {
      this.currentId = id;
      this.currentDelegate = delegate;
      this.modalOpen = true;
    }
  }
};
</script>
