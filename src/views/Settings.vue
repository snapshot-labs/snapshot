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
          <h1 v-if="loaded" v-text="'Settings'" class="mb-4" />
          <PageLoading v-else />
        </div>
        <template v-if="loaded">
          <Block title="ENS">
            <UiButton class="d-flex width-full mb-2">
              <input
                readonly
                v-model="contenthash"
                class="input width-full"
                placeholder="Content hash"
              />
              <Icon
                v-clipboard:copy="contenthash"
                v-clipboard:success="handleCopy"
                name="copy"
                size="24"
                class="text-gray p-2 mr-n3"
              />
            </UiButton>
            <a
              :href="`https://app.ens.domains/name/${key}`"
              target="_blank"
              class="mb-2 d-block"
            >
              <UiButton class="button-outline width-full">
                {{
                  currentContenthash !== contenthash
                    ? 'Set record on ENS'
                    : 'See on ENS'
                }}
                <Icon name="external-link" class="ml-1" />
              </UiButton>
            </a>
          </Block>
          <Block title="Profile">
            <div class="mb-2">
              <UiButton class="width-full mb-2">
                <input
                  v-model="form.name"
                  class="input width-full"
                  placeholder="Name"
                  required
                />
              </UiButton>
              <UiButton
                @click="modalNetworksOpen = true"
                class="text-left width-full mb-2"
              >
                {{
                  form.network ? networks[form.network].name : 'Select network'
                }}
              </UiButton>
              <UiButton class="width-full mb-2">
                <input
                  v-model="form.symbol"
                  class="input width-full"
                  placeholder="Symbol"
                  required
                />
              </UiButton>
              <UiButton
                @click="modalSkinsOpen = true"
                class="text-left width-full mb-2"
              >
                {{ form.skin ? form.skin : 'Select skin' }}
              </UiButton>
              <UiButton class="width-full mb-2">
                <input
                  v-model="form.domain"
                  class="input width-full"
                  placeholder="Domain name"
                />
              </UiButton>
            </div>
          </Block>
          <Block title="Strategies">
            <div
              v-for="(strategy, i) in form.strategies"
              :key="i"
              class="p-4 border rounded-2 mb-3"
            >
              <h4 v-text="strategy.name" />
            </div>
            <UiButton class="d-block width-full">
              Add strategy
            </UiButton>
          </Block>
          <Block title="Members">
            <UiButton class="d-block width-full" style="height: auto;">
              <TextareaArray
                :value="form.members"
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
                  v-model="form.filters.defaultTab"
                  class="input width-full"
                  placeholder="Default tab"
                />
              </UiButton>
              <UiButton class="width-full mb-2">
                <input
                  v-model="form.filters.minScore"
                  class="input width-full"
                  placeholder="Minimum score"
                />
              </UiButton>
              <UiButton class="width-full mb-2">
                <input
                  v-model="form.filters.onlyMembers"
                  type="number"
                  class="input width-full"
                  placeholder="Only members proposals"
                />
              </UiButton>
              <UiButton class="d-block width-full" style="height: auto;">
                <TextareaArray
                  :value="form.filters.invalids"
                  v-model="form.filters.invalids"
                  :placeholder="
                    `Qmc4VSHwY3SVmo4oofhL2qDPaYcGaQqndM4oqdQQe2aZHQ\nQmTMAgnPy2q6LRMNwvj27PHvWEgZ3bw7yTtNNEucBZCWhZ`
                  "
                  class="input width-full text-left"
                />
              </UiButton>
            </div>
          </Block>
        </template>
      </div>
      <div v-if="loaded" class="col-12 col-lg-4 float-left">
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
      v-model="form.network"
    />
    <ModalSkins
      :open="modalSkinsOpen"
      @close="modalSkinsOpen = false"
      v-model="form.skin"
    />
  </Container>
</template>

<script>
import { mapActions } from 'vuex';
import { getAddress } from '@ethersproject/address';
import { resolveContent } from '@/helpers/web3';
import getProvider from '@/helpers/provider';
import ipfs from '@/helpers/ipfs';
import { clone } from '@/helpers/utils';
import networks from '@/helpers/networks.json';

export default {
  data() {
    return {
      key: this.$route.params.key,
      from: this.$route.params.from,
      space: {},
      currentContenthash: '',
      modalNetworksOpen: false,
      modalSkinsOpen: false,
      loaded: false,
      loading: false,
      form: {
        filters: {}
      },
      networks
    };
  },
  computed: {
    isValid() {
      return !this.loading && this.web3.account;
    },
    contenthash() {
      const address = this.web3.account
        ? getAddress(this.web3.account)
        : 'YOUR_ADDRESS';
      return `ipns://storage.snapshot.page/registry/${address}/${this.key}`;
    }
  },
  async created() {
    try {
      const { protocolType, decoded } = await resolveContent(
        getProvider(1),
        this.key
      );
      this.currentContenthash = `${protocolType}://${decoded}`;
      this.space = await ipfs.get(decoded, protocolType);
      this.space.key = this.key;
      this.space.token = this.key;
      this.space.filters = this.space.filters || {};
      this.form = this.space;
    } catch (e) {
      console.log(e);
    }
    if (this.from) this.form = clone(this.app.spaces[this.from]);
    this.loaded = true;
  },
  methods: {
    ...mapActions(['notify']),
    async handleSubmit() {
      this.loading = true;
      this.loading = false;
    },
    handleCopy() {
      this.notify('Copied!');
    }
  }
};
</script>
