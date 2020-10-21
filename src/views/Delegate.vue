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
                v-model="form.address"
                class="input width-full"
                placeholder="Delegate address"
              />
            </UiButton>
            <UiButton class="width-full mb-2">
              <input
                v-model="form.id"
                class="input width-full"
                placeholder="Space (optional)"
              />
            </UiButton>
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
import { keccak256 } from '@ethersproject/keccak256';
import { toUtf8Bytes } from '@ethersproject/strings';
import { multicall } from '@snapshot-labs/snapshot.js/src/utils';
import { sendTransaction } from '@/helpers/web3';
import getProvider from '@/helpers/provider';
import abi from '@/helpers/abi';

const contractAddress = '0x469788fE6E9E9681C6ebF3bF78e7Fd26Fc015446';

export default {
  data() {
    return {
      loaded: false,
      loading: false,
      form: {
        // address: '0x0000000000000000000000000000000000baDDAd',
        // id: 'test_1_project'
      }
    };
  },
  async created() {
    if (this.web3.account) {
      const [delegation] = await multicall(
        this.web3.network.chainId,
        getProvider(this.web3.network.chainId),
        abi['DelegateRegistry'],
        [
          [
            contractAddress,
            'delegation',
            [this.web3.account, keccak256(toUtf8Bytes('test'))]
          ]
        ],
        { blockTag: 'latest' }
      );
      console.log('Delegation to id "test"', delegation);
    }
    this.loaded = true;
  },
  computed: {
    isValid() {
      return (
        isAddress(this.form.address) &&
        this.form.address.toLowerCase() !== this.web3.account
      );
    }
  },
  methods: {
    ...mapActions(['notify']),
    async handleSubmit() {
      this.loading = true;
      try {
        const tx = await sendTransaction(this.$auth.web3, [
          'DelegateRegistry',
          contractAddress,
          'setDelegate',
          [keccak256(toUtf8Bytes(this.form.id)), this.form.address]
        ]);
        console.log(tx);
        this.notify('You did it!');
      } catch (e) {
        console.log(e);
      }
      this.loading = false;
    }
  }
};
</script>
