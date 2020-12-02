<template>
  <UiModal :open="open" @close="$emit('close')">
    <template slot="header">
      <h3 v-if="!web3.account || step === 'connect'">Connect wallet</h3>
      <h3 v-else>Account</h3>
    </template>
    <div v-if="!web3.account || step === 'connect'">
      <div class="m-4 mb-5">
        <a
          v-for="(connector, id, i) in config.connectors"
          :key="i"
          @click="$emit('login', connector.id)"
          target="_blank"
          class="mb-2 d-block"
        >
          <UiButton
            v-if="id !== 'injected'"
            class="button-outline width-full v-align-middle"
          >
            <img
              :src="`${path}/${connector.id}.png`"
              height="28"
              width="28"
              class="mr-1 v-align-middle"
            />
            {{ connector.name }}
          </UiButton>
          <UiButton
            v-else-if="injected"
            class="button-outline width-full v-align-middle"
          >
            <img
              :src="`${path}/${injected.id}.png`"
              height="28"
              width="28"
              class="mr-1 v-align-middle"
            />
            {{ injected.name }}
          </UiButton>
        </a>
      </div>
    </div>
    <div v-else>
      <div v-if="$auth.isAuthenticated" class="m-4">
        <a
          :href="_explorer(web3.network.key, web3.account)"
          target="_blank"
          class="mb-2 d-block"
        >
          <UiButton class="button-outline width-full">
            <Avatar
              :profile="web3.profile"
              :address="web3.account"
              size="16"
              class="mr-2 ml-n1"
            />
            <span v-if="web3.profile.name" v-text="web3.profile.name" />
            <span v-else-if="web3.name" v-text="web3.name" />
            <span v-else v-text="_shorten(web3.account)" />
            <Icon name="external-link" class="ml-1" />
          </UiButton>
        </a>
        <a
          v-if="web3.profile.name"
          :href="`https://3box.io/${web3.account}/edit`"
          target="_blank"
          class="mb-2 d-block"
        >
          <UiButton class="button-outline width-full">
            Edit profile on 3Box
            <Icon name="external-link" class="ml-1" />
          </UiButton>
        </a>
        <a
          v-else
          href="https://3box.io/hub"
          target="_blank"
          class="mb-2 d-block"
        >
          <UiButton class="button-outline width-full">
            Create profile on 3Box
            <Icon name="external-link" class="ml-1" />
          </UiButton>
        </a>
        <UiButton
          @click="step = 'connect'"
          class="button-outline width-full mb-2"
        >
          Connect wallet
        </UiButton>
        <UiButton
          @click="handleLogout"
          class="button-outline width-full text-red mb-2"
        >
          Log out
        </UiButton>
      </div>
    </div>
  </UiModal>
</template>

<script>
import { mapActions } from 'vuex';
import { getInjected } from '@/helpers/utils';

export default {
  props: ['open'],
  data() {
    return {
      step: null,
      path:
        'https://raw.githubusercontent.com/snapshot-labs/lock/master/connectors/assets'
    };
  },
  watch: {
    open() {
      this.step = null;
    }
  },
  computed: {
    injected() {
      return getInjected();
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
