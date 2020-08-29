<template>
  <Sticky class="mb-4">
    <div
      v-if="config.env === 'develop'"
      class="p-3 text-center bg-blue"
      style="color: white; font-size: 20px;"
    >
      This is the demo site, give it a try!
    </div>
    <nav id="topnav" class="border-bottom width-full bg-black">
      <Container>
        <div class="d-flex flex-items-center" style="height: 78px;">
          <div class="flex-auto d-flex flex-items-center">
            <router-link
              :to="{ name: 'home' }"
              class="d-inline-block d-flex flex-items-center"
              style="font-size: 24px; padding-top: 4px;"
            >
              <span
                :class="namespace && 'hide-sm'"
                class="mr-1"
                v-text="'snapshot'"
              />
            </router-link>
            <router-link
              v-if="namespace"
              :to="{ name: 'proposals' }"
              class="d-inline-block d-flex flex-items-center"
              style="font-size: 24px; padding-top: 4px;"
            >
              <span class="pl-1 pr-2 text-gray" v-text="'/'" />
              <Token :namespace="namespace.key" size="28" />
              <span class="ml-2" v-text="namespace.symbol" />
            </router-link>
          </div>
          <div :key="web3.account">
            <template v-if="web3.account && !wrongNetwork">
              <UiButton
                @click="modalOpen = true"
                class="button-outline"
                :loading="loading"
              >
                <Avatar :address="web3.account" size="16" class="mr-2 ml-n1" />
                <span v-if="web3.name" v-text="web3.name" />
                <span v-else v-text="_shorten(web3.account)" />
              </UiButton>
            </template>
            <UiButton
              v-if="web3.injectedLoaded && wrongNetwork"
              class="text-red"
            >
              <Icon name="warning" class="ml-n1 mr-1 v-align-middle" />
              Wrong network
            </UiButton>
            <UiButton
              v-if="showLogin"
              @click="modalOpen = true"
              :loading="loading"
            >
              Connect wallet
            </UiButton>
            <UiButton @click="modalAboutOpen = true" class="ml-2">
              <span v-text="'?'" class="ml-n1 mr-n1" />
            </UiButton>
          </div>
        </div>
        <ModalAccount
          :open="modalOpen"
          @close="modalOpen = false"
          @login="handleLogin"
        />
        <ModalAbout :open="modalAboutOpen" @close="modalAboutOpen = false" />
      </Container>
    </nav>
  </Sticky>
</template>

<script>
import { mapActions } from 'vuex';
import namespaces from '@/namespaces.json';

export default {
  data() {
    return {
      loading: false,
      modalOpen: false,
      modalAboutOpen: false
    };
  },
  computed: {
    wrongNetwork() {
      return this.config.chainId !== this.web3.injectedChainId;
    },
    showLogin() {
      return (
        (!this.web3.account && !this.web3.injectedLoaded) ||
        (!this.web3.account && !this.wrongNetwork)
      );
    },
    namespace() {
      try {
        return namespaces[this.$route.params.key];
      } catch (e) {
        return {};
      }
    }
  },
  methods: {
    ...mapActions(['login']),
    async handleLogin(connector) {
      this.modalOpen = false;
      this.loading = true;
      await this.login(connector);
      this.loading = false;
    }
  }
};
</script>
