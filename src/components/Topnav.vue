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
                :class="space && 'hide-sm'"
                class="mr-1"
                v-text="'snapshot'"
              />
              <span v-if="space" class="pl-1 pr-2 text-gray" v-text="'/'" />
            </router-link>
            <router-link
              v-if="space"
              :to="{ name: 'proposals' }"
              class="d-inline-block d-flex flex-items-center"
              style="font-size: 24px; padding-top: 4px;"
            >
              <Token :space="space.key" symbolIndex="space" size="28" />
              <span class="ml-2" v-text="space.name" />
            </router-link>
          </div>
          <div :key="web3.account">
            <template v-if="$auth.isAuthenticated.value">
              <UiButton
                @click="modalOpen = true"
                class="button-outline"
                :loading="app.authLoading"
              >
                <Avatar
                  :profile="web3.profile"
                  :address="web3.account"
                  size="16"
                  class="mr-0 mr-sm-2 mr-md-2 mr-lg-2 mr-xl-2 ml-n1"
                />
                <span
                  v-if="web3.profile && (web3.profile.name || web3.profile.ens)"
                  v-text="web3.profile.name || web3.profile.ens"
                  class="hide-sm"
                />
                <span v-else v-text="_shorten(web3.account)" class="hide-sm" />
              </UiButton>
            </template>
            <UiButton
              v-if="!$auth.isAuthenticated.value"
              @click="modalOpen = true"
              :loading="loading || app.authLoading"
            >
              <span class="hide-sm" v-text="'Connect wallet'" />
              <Icon
                name="login"
                size="20"
                class="hide-md hide-lg hide-xl ml-n2 mr-n2 v-align-text-bottom"
              />
            </UiButton>
            <UiButton @click="modalAboutOpen = true" class="ml-2">
              <span v-text="'?'" class="ml-n1 mr-n1" />
            </UiButton>
          </div>
        </div>
      </Container>
    </nav>
    <teleport to="#modal">
      <ModalAccount
        :open="modalOpen"
        @close="modalOpen = false"
        @login="handleLogin"
      />
      <ModalAbout :open="modalAboutOpen" @close="modalAboutOpen = false" />
    </teleport>
  </Sticky>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  data() {
    return {
      loading: false,
      modalOpen: false,
      modalAboutOpen: false
    };
  },
  computed: {
    space() {
      const key = this.domain || this.$route.params.key;
      return this.app.spaces[key] ? this.app.spaces[key] : false;
    }
  },
  created() {
    this.setTitle();
  },
  watch: {
    space() {
      this.setTitle();
    }
  },
  methods: {
    ...mapActions(['login']),
    setTitle() {
      document.title = this.space.name ? this.space.name : 'Snapshot';
    },
    async handleLogin(connector) {
      this.modalOpen = false;
      this.loading = true;
      await this.login(connector);
      this.loading = false;
    }
  }
};
</script>
