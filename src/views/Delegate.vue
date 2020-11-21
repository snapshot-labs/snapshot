<template>
  <Container :slim="true">
    <div class="px-4 px-md-0 mb-3">
      <router-link :to="{ name: 'home' }" class="text-gray">
        <Icon name="back" size="22" class="v-align-middle" />
        Home
      </router-link>
    </div>
    <div>
      <div class="col-12 col-lg-8 float-left pr-0 pr-lg-5">
        <div class="px-4 px-md-0">
          <h1 v-if="loaded" v-text="'Delegate'" class="mb-4" />
          <PageLoading v-else />
        </div>
        <template v-if="loaded">
          <Block title="Select address">
            <UiButton class="width-full mb-2">
              <input
                v-model.trim="form.address"
                class="input width-full"
                placeholder="Delegate address or ENS name"
              />
            </UiButton>
            <UiButton class="width-full mb-2">
              <input
                v-model.trim="form.id"
                class="input width-full"
                placeholder="Space (optional)"
              />
            </UiButton>
          </Block>
          <Block
            v-if="delegates.length > 0"
            :slim="true"
            title="Your delegation(s)"
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
            </div>
          </Block>
          <Block
            v-if="delegators.length > 0"
            :slim="true"
            title="Delegated to you"
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
      </div>
      <div v-if="loaded" class="col-12 col-lg-4 float-left">
        <Block title="Actions">
          <UiButton
            @click="handleSubmit"
            :disabled="!isValid || !$auth.isAuthenticated"
            :loading="loading"
            class="d-block width-full button--submit"
          >
            Confirm
          </UiButton>
        </Block>
      </div>
    </div>
  </Container>
</template>

<script>
import { mapActions } from 'vuex';
import { isAddress } from '@ethersproject/address';
import { formatBytes32String } from '@ethersproject/strings';
import { sendTransaction } from '@snapshot-labs/snapshot.js/src/utils';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import abi from '@/helpers/abi';
import { getDelegates, getDelegators } from '@/helpers/delegation';

const contractAddress = '0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446';

export default {
  data() {
    return {
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
      if (val && val.toLowerCase() !== prev) await this.load();
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
        this.$auth.isAuthenticated &&
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
        this.notify('You did it!');
        await this.load();
      } catch (e) {
        console.log(e);
      }
      this.loading = false;
    }
  }
};
</script>
