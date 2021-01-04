<template>
  <UiModal :open="open" @close="$emit('close')">
    <div v-if="!web3.account.bech32 || step === 'connect'">
      <h3 class="m-4 mb-0 text-center">Connect wallet</h3>
      <div class="m-4 mb-5">
        <a
          v-for="(connector, id, i) in config.connectors"
          :key="i"
          @click="$emit('login', connector.id)"
          target="_blank"
          class="mb-2 d-block"
        >
          <UiButton class="button-outline width-full v-align-middle">
            <img
              :src="`https://zilpay.xyz/icons/${connector.id}.png`"
              height="28"
              width="28"
              class="mr-1 v-align-middle"
            />
            {{ connector.name }}
          </UiButton>
        </a>
      </div>
    </div>
    <div v-else>
      <h3 class="m-4 mb-0 text-center">Account</h3>
      <div v-if="$auth.isAuthenticated" class="m-4">
        <a
          :href="_explorer(web3.network.name, web3.account.bech32)"
          target="_blank"
          class="mb-2 d-block"
        >
          <UiButton class="button-outline width-full">
            <Avatar
              :address="web3.account.base16"
              size="16"
              class="mr-2 ml-n1"
            />
            <span v-if="web3.name" v-text="_shorten(web3.name)" />
            <span v-else v-text="_shorten(web3.account.bech32)" />
            <Icon name="external-link" class="ml-1" />
          </UiButton>
        </a>
        <UiButton
          v-show="!web3"
          @click="step = 'connect'"
          class="button-outline width-full mb-2"
        >
          Connect wallet
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  props: ['open'],
  data() {
    return {
      step: null
    };
  },
  watch: {
    open() {
      this.step = null;
    }
  },
  methods: {
    ...mapActions(['logout']),
    async handleLogout() {
      await this.logout();
      this.$emit('close');
    }
  }
};
</script>
