<template>
  <Container :slim="true">
    <div class="px-4 px-md-0 mb-3">
      <router-link
        :to="{ name: domain ? 'home' : 'proposals' }"
        class="text-gray"
      >
        <Icon name="back" size="22" class="v-align-middle" />
        {{ space.name }}
      </router-link>
    </div>
    <div>
      <div class="col-12 col-lg-8 float-left pr-0 pr-lg-5">
        <div class="px-4 px-md-0">
          <h1 v-text="'Settings'" class="mb-4" />
        </div>
        <Block title="Profile">
          <div class="mb-2">
            <UiButton class="width-full mb-2">
              <input
                v-model="form.name"
                type="number"
                class="input width-full"
                placeholder="Name"
              />
            </UiButton>
            <UiButton
              @click="modalNetworksOpen = true"
              class="text-left width-full mb-2"
            >
              Select network
            </UiButton>
            <UiButton
              @click="modalSkinsOpen = true"
              class="text-left width-full mb-2"
            >
              Select skin
            </UiButton>
            <UiButton class="width-full mb-2">
              <input
                v-model="form.domain"
                type="number"
                class="input width-full"
                placeholder="Domain name"
              />
            </UiButton>
          </div>
        </Block>
        <Block title="Strategies">
          <UiButton class="d-block width-full">
            Add strategy
          </UiButton>
        </Block>
        <Block title="Members">
          <UiButton class="d-block width-full" style="height: auto;">
            <textarea-autosize
              v-model="form.members"
              :placeholder="
                `0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`
              "
              class="input width-full text-left"
            />
          </UiButton>
        </Block>
        <Block title="Filters">
          <div class="mb-2">
            <UiButton class="width-full mb-2">
              <input
                v-model="form.defaultView"
                type="number"
                class="input width-full"
                placeholder="Default tab"
              />
            </UiButton>
            <UiButton class="width-full mb-2">
              <input
                v-model="form.min"
                type="number"
                class="input width-full"
                placeholder="Minimum score"
              />
            </UiButton>
            <UiButton class="width-full mb-2">
              <input
                v-model="form.showOnlyCore"
                type="number"
                class="input width-full"
                placeholder="Only members proposals"
              />
            </UiButton>
            <UiButton class="d-block width-full" style="height: auto;">
              <textarea-autosize
                v-model="form.invalids"
                :placeholder="
                  `Qmc4VSHwY3SVmo4oofhL2qDPaYcGaQqndM4oqdQQe2aZHQ\nQmTMAgnPy2q6LRMNwvj27PHvWEgZ3bw7yTtNNEucBZCWhZ`
                "
                class="input width-full text-left"
              />
            </UiButton>
          </div>
        </Block>
      </div>
      <div class="col-12 col-lg-4 float-left">
        <Block title="Actions">
          <UiButton @click="handleSubmit" class="d-block width-full mb-2">
            Reset
          </UiButton>
          <UiButton
            @click="handleSubmit"
            :disabled="!isValid"
            :loading="loading"
            class="d-block width-full button--submit"
          >
            Save
          </UiButton>
        </Block>
      </div>
    </div>
    <ModalNetworks
      :open="modalNetworksOpen"
      @close="modalNetworksOpen = false"
    />
    <ModalSkins :open="modalSkinsOpen" @close="modalSkinsOpen = false" />
  </Container>
</template>

<script>
export default {
  data() {
    return {
      key: this.$route.params.key,
      modalNetworksOpen: false,
      modalSkinsOpen: false,
      loading: false,
      form: {
        name: '',
        body: ''
      }
    };
  },
  computed: {
    space() {
      return this.app.spaces[this.key];
    },
    isValid() {
      return !this.loading && this.web3.account;
    }
  },
  methods: {
    async handleSubmit() {
      this.loading = true;
      this.loading = false;
    }
  }
};
</script>
