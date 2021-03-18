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
        <h1 v-if="loaded" v-text="$t('settings.header')" class="mb-4" />
        <PageLoading v-else />
      </div>
      <template v-if="loaded">
        <Block title="ENS">
          <UiButton class="d-flex width-full mb-2">
            <input
              readonly
              v-model="contenthash"
              class="input width-full"
              :placeholder="$t('contectHash')"
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
            <UiButton
              :class="!isReady && 'button--submit'"
              class="button-outline width-full"
            >
              {{ isReady ? $t('settings.seeENS') : $t('settings.setENS') }}
              <Icon name="external-link" class="ml-1" />
            </UiButton>
          </a>
        </Block>
        <div v-if="isReady">
          <Block :title="$t('settings.profile')">
            <div class="mb-2">
              <a
                href="https://docs.snapshot.org/spaces/add-avatar"
                target="_blank"
              >
                <UiButton class="width-full mb-2">
                  {{ $t('settings.changeAvatar') }}
                  <Icon name="external-link" class="ml-1" />
                </UiButton>
              </a>
              <UiButton class="text-left width-full mb-2 d-flex px-3">
                <div class="text-gray mr-2">{{ $t('settings.name') }}</div>
                <input v-model="form.name" class="input flex-auto" required />
              </UiButton>
              <UiButton
                @click="modalNetworksOpen = true"
                class="text-left width-full mb-2 d-flex px-3"
              >
                <div class="text-gray mr-2">{{ $t('network') }}</div>
                <div class="flex-auto">
                  {{
                    form.network
                      ? networks[form.network].name
                      : $t('selectNetwork')
                  }}
                </div>
              </UiButton>
              <UiButton class="text-left width-full mb-2 d-flex px-3">
                <div class="text-gray mr-2">{{ $t('settings.symbol') }}</div>
                <input v-model="form.symbol" class="input flex-auto" required />
              </UiButton>
              <UiButton
                @click="modalSkinsOpen = true"
                class="text-left width-full mb-2 d-flex px-3"
              >
                <div class="text-gray mr-2">{{ $t('settings.skin') }}</div>
                <div class="flex-auto">
                  {{ form.skin ? form.skin : $t('defaultSkin') }}
                </div>
              </UiButton>
              <UiButton class="text-left width-full mb-2 d-flex px-3">
                <div class="text-gray mr-2">{{ $t('settings.domain') }}</div>
                <input v-model="form.domain" class="input flex-auto" />
                <a
                  class="d-block py-1 mr-n2"
                  target="_blank"
                  href="https://docs.snapshot.org/spaces/add-custom-domain"
                >
                  <Icon name="info" size="24" class="text-gray p-1" />
                </a>
              </UiButton>
              <div class="d-flex flex-items-center px-2">
                <Checkbox v-model="form.private" class="mr-2 mt-1" />
                {{ $t('settings.hideSpace') }}
              </div>
            </div>
          </Block>
          <Block :title="$t('strategies')">
            <div
              v-for="(strategy, i) in form.strategies"
              :key="i"
              class="mb-3 position-relative"
            >
              <a
                @click="handleRemoveStrategy(i)"
                class="position-absolute p-4 right-0"
              >
                <Icon name="close" size="12" />
              </a>
              <a
                @click="handleEditStrategy(i)"
                class="p-4 d-block border rounded-2"
              >
                <h4 v-text="strategy.name" />
              </a>
            </div>
            <UiButton @click="handleAddStrategy" class="d-block width-full">
              {{ $t('settings.addStrategy') }}
            </UiButton>
          </Block>

          <Block :title="$t('settings.members')">
            <UiButton class="d-block width-full px-3" style="height: auto;">
              <TextareaArray
                v-model="form.members"
                :placeholder="
                  `0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`
                "
                class="input width-full text-left"
                style="font-size: 18px;"
              />
            </UiButton>
          </Block>
          <Block :title="$t('settings.filters')">
            <div class="mb-2">
              <UiButton class="text-left width-full mb-2 d-flex px-3">
                <div class="text-gray mr-2">
                  {{ $t('settings.defaultTab') }}
                </div>
                <input
                  v-model="form.filters.defaultTab"
                  class="input flex-auto"
                />
              </UiButton>
              <UiButton class="text-left width-full mb-2 d-flex px-3">
                <div class="text-gray mr-2">{{ $t('settings.minScore') }}</div>
                <div class="flex-auto">
                  <InputNumber v-model="form.filters.minScore" class="input" />
                </div>
              </UiButton>
              <div class="mb-2 d-flex flex-items-center px-2">
                <Checkbox
                  v-model="form.filters.onlyMembers"
                  class="mr-2 mt-1"
                />
                {{ $t('settings.showOnly') }}
              </div>
              <UiButton class="d-block width-full px-3" style="height: auto;">
                <TextareaArray
                  v-model="form.filters.invalids"
                  :placeholder="
                    `${$t(
                      'invalidProposals'
                    )}\nQmc4VSHwY3SVmo4oofhL2qDPaYcGaQqndM4oqdQQe2aZHQ\nQmTMAgnPy2q6LRMNwvj27PHvWEgZ3bw7yTtNNEucBZCWhZ`
                  "
                  class="input width-full text-left"
                  style="font-size: 18px;"
                />
              </UiButton>
            </div>
          </Block>
          <Block :title="$t('plugins')">
            <div v-if="form?.plugins">
              <div
                v-for="(plugin, name, index) in form.plugins"
                :key="index"
                class="mb-3 position-relative"
              >
                <div v-if="pluginName(name)">
                  <a
                    @click="handleRemovePlugins(name)"
                    class="position-absolute p-4 right-0"
                  >
                    <Icon name="close" size="12" />
                  </a>
                  <a
                    @click="handleEditPlugins(name)"
                    class="p-4 d-block border rounded-2"
                  >
                    <h4 v-text="pluginName(name)" />
                  </a>
                </div>
              </div>
            </div>
            <UiButton @click="handleAddPlugins" class="d-block width-full">
              {{ $t('settings.addPlugin') }}
            </UiButton>
          </Block>
        </div>
      </template>
    </template>
    <template v-if="loaded && isReady" #sidebar-right>
      <Block :title="$t('actions')">
        <UiButton @click="handleReset" class="d-block width-full mb-2">
          {{ $t('reset') }}
        </UiButton>
        <UiButton
          @click="handleSubmit"
          :disabled="!isValid"
          :loading="loading"
          class="d-block width-full button--submit"
        >
          {{ $t('save') }}
        </UiButton>
      </Block>
    </template>
  </Layout>
  <teleport to="#modal">
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
    <ModalStrategy
      :open="modalStrategyOpen"
      @close="modalStrategyOpen = false"
      @add="handleSubmitAddStrategy"
      :strategy="currentStrategy"
    />
    <ModalPlugins
      :open="modalPluginsOpen"
      @close="modalPluginsOpen = false"
      @add="handleSubmitAddPlugins"
      :plugin="currentPlugin"
    />
  </teleport>
</template>

<script>
import { mapActions } from 'vuex';
import { getAddress } from '@ethersproject/address';
import { validateSchema } from '@snapshot-labs/snapshot.js/src/utils';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import gateways from '@snapshot-labs/snapshot.js/src/gateways.json';
import { clone, filterPlugins } from '@/helpers/utils';
import plugins from '@snapshot-labs/snapshot.js/src/plugins';
import { getSpaceUri, uriGet } from '@/helpers/ens';

const gateway = process.env.VUE_APP_IPFS_GATEWAY || gateways[0];

export default {
  data() {
    return {
      key: this.$route.params.key,
      from: this.$route.params.from,
      currentSettings: {},
      currentContenthash: '',
      currentStrategy: {},
      currentPlugin: {},
      currentStrategyIndex: false,
      modalNetworksOpen: false,
      modalSkinsOpen: false,
      modalStrategyOpen: false,
      modalPluginsOpen: false,
      loaded: false,
      loading: false,
      form: {
        strategies: [],
        plugins: {},
        filters: {}
      },
      networks
    };
  },
  computed: {
    validate() {
      return validateSchema(schemas.space, this.form);
    },
    isValid() {
      if (this.validate !== true) console.log(this.validate);
      return !this.loading && this.web3.account && this.validate === true;
    },
    contenthash() {
      const address = this.web3.account
        ? getAddress(this.web3.account)
        : '<your-address>';
      return `ipns://storage.snapshot.page/registry/${address}/${this.key}`;
    },
    isReady() {
      return this.currentContenthash === this.contenthash;
    },
    plugins() {
      return filterPlugins(plugins, this.app.spaces, '');
    }
  },
  async created() {
    try {
      const uri = await getSpaceUri(this.key);
      this.currentContenthash = uri;
      const [protocolType, decoded] = uri.split('://');
      let space = clone(this.app.spaces?.[this.key]);
      if (!space) space = await uriGet(gateway, decoded, protocolType);
      delete space.key;
      delete space._activeProposals;
      space.strategies = space.strategies || [];
      space.plugins = space.plugins || {};
      space.filters = space.filters || {};
      this.currentSettings = clone(space);
      this.form = space;
    } catch (e) {
      console.log(e);
    }
    if (this.from) {
      const from = clone(this.app.spaces[this.from]);
      delete from.key;
      delete from._activeProposals;
      this.form = from;
    }
    this.loaded = true;
  },
  methods: {
    ...mapActions(['notify', 'send', 'getSpaces']),
    async handleSubmit() {
      this.loading = true;
      try {
        await this.send({
          space: this.key,
          type: 'settings',
          payload: this.form
        });
      } catch (e) {
        console.log(e);
      }
      await this.getSpaces();
      this.loading = false;
    },
    handleReset() {
      if (this.from) return (this.form = clone(this.app.spaces[this.from]));
      if (this.currentSettings) return (this.form = this.currentSettings);
      this.form = {
        strategies: [],
        plugins: {},
        filters: {}
      };
    },
    handleCopy() {
      this.notify(this.$t('notify.copied'));
    },

    handleEditStrategy(i) {
      this.currentStrategyIndex = i;
      this.currentStrategy = clone(this.form.strategies[i]);
      this.modalStrategyOpen = true;
    },
    handleRemoveStrategy(i) {
      this.form.strategies = this.form.strategies.filter(
        (strategy, index) => index !== i
      );
    },
    handleAddStrategy() {
      this.currentStrategyIndex = false;
      this.currentStrategy = {};
      this.modalStrategyOpen = true;
    },
    handleSubmitAddStrategy(strategy) {
      if (this.currentStrategyIndex !== false) {
        this.form.strategies[this.currentStrategyIndex] = strategy;
      } else {
        this.form.strategies = this.form.strategies.concat(strategy);
      }
    },

    handleEditPlugins(name) {
      this.currentPlugin = {};
      this.currentPlugin[name] = clone(this.form.plugins[name]);
      this.modalPluginsOpen = true;
    },
    handleRemovePlugins(plugin) {
      delete this.form.plugins[plugin];
    },
    handleAddPlugins() {
      this.currentPlugin = {};
      this.modalPluginsOpen = true;
    },
    handleSubmitAddPlugins(payload) {
      this.form.plugins[payload.key] = payload.input;
    },
    pluginName(key) {
      const plugin = this.plugins.find(obj => {
        return obj.key === key;
      });
      return plugin.name;
    }
  }
};
</script>
