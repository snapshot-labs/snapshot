<template>
  <Layout v-bind="$attrs">
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
              :class="{ 'button--submit': !isOwner && !isAdmin }"
              class="button-outline width-full"
            >
              {{
                isOwner || isAdmin
                  ? $t('settings.seeENS')
                  : $t('settings.setENS')
              }}
              <Icon name="external-link" class="ml-1" />
            </UiButton>
          </a>
        </Block>
        <div v-if="isOwner || isAdmin">
          <Block :title="$t('settings.profile')">
            <div class="mb-2">
              <UiInput v-model="form.name" :error="inputError('name')">
                <template v-slot:label>{{ $t(`settings.name`) }}*</template>
              </UiInput>
              <UiInput v-model="form.about" :error="inputError('about')">
                <template v-slot:label> {{ $t(`settings.about`) }} </template>
              </UiInput>
              <UiInput
                v-model="form.avatar"
                placeholder="e.g. https://example.com/space.png"
                :error="inputError('avatar')"
              >
                <template v-slot:label>
                  {{ $t(`settings.avatar`) }}
                </template>
                <template v-slot:info>
                  <Upload
                    class="ml-2"
                    @input="setAvatarUrl"
                    @loading="setUploadLoading"
                  >
                    {{ $t('upload') }}
                  </Upload>
                </template>
              </UiInput>
              <UiInput
                @click="modalNetworksOpen = true"
                :error="inputError('network')"
              >
                <template v-slot:selected>
                  {{
                    form.network
                      ? networks[form.network].name
                      : $t('selectNetwork')
                  }}
                </template>
                <template v-slot:label>
                  {{ $t(`settings.network`) }}*
                </template>
              </UiInput>
              <UiInput
                v-model="form.symbol"
                placeholder="e.g. BAL"
                :error="inputError('symbol')"
              >
                <template v-slot:label> {{ $t(`settings.symbol`) }}* </template>
              </UiInput>
              <UiInput
                @click="modalSkinsOpen = true"
                :error="inputError('skin')"
              >
                <template v-slot:selected>
                  {{ form.skin ? form.skin : $t('defaultSkin') }}
                </template>
                <template v-slot:label>
                  {{ $t(`settings.skin`) }}
                </template>
              </UiInput>
              <UiInput
                v-model="form.twitter"
                placeholder="e.g. elonmusk"
                :error="inputError('twitter')"
              >
                <template v-slot:label>
                  <Icon name="twitter" />
                </template>
              </UiInput>
              <UiInput
                v-model="form.github"
                placeholder="e.g. vbuterin"
                :error="inputError('github')"
              >
                <template v-slot:label>
                  <Icon name="github" />
                </template>
              </UiInput>
              <UiInput
                v-model="form.domain"
                placeholder="e.g. vote.balancer.finance"
                :error="inputError('domain')"
              >
                <template v-slot:label>
                  {{ $t('settings.domain') }}
                </template>
                <template v-slot:info>
                  <a
                    class="d-block py-1 mr-n2"
                    target="_blank"
                    href="https://docs.snapshot.org/spaces/add-custom-domain"
                  >
                    <Icon name="info" size="24" class="text-gray p-1" />
                  </a>
                </template>
              </UiInput>
              <UiInput
                v-model="form.terms"
                placeholder="e.g. https://example.com/terms"
                :error="inputError('terms')"
              >
                <template v-slot:label> {{ $t(`settings.terms`) }} </template>
              </UiInput>
              <div class="d-flex flex-items-center px-2">
                <Checkbox v-model="form.private" class="mr-2 mt-1" />
                {{ $t('settings.hideSpace') }}
              </div>
            </div>
          </Block>
          <Block :title="$t('settings.strategies') + '*'">
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
            <Block
              :style="`border-color: red !important`"
              v-if="inputError('strategies')"
            >
              <Icon name="warning" class="mr-2 text-red" />
              <span class="text-red">
                {{ inputError('strategies') }}&nbsp;</span
              >
              <a
                href="https://docs.snapshot.org/spaces/create#strategies"
                target="_blank"
                rel="noopener noreferrer"
                >{{ $t('learnMore') }}
                <Icon name="external-link" />
              </a>
            </Block>
            <UiButton @click="handleAddStrategy" class="d-block width-full">
              {{ $t('settings.addStrategy') }}
            </UiButton>
          </Block>
          <Block :title="$t('settings.admins')" v-if="isOwner">
            <Block
              :style="`border-color: red !important`"
              v-if="inputError('admins')"
            >
              <Icon name="warning" class="mr-2 text-red" />
              <span class="text-red"> {{ inputError('admins') }}&nbsp;</span>
            </Block>
            <UiButton class="d-block width-full px-3" style="height: auto">
              <TextareaArray
                v-model="form.admins"
                :placeholder="`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`"
                class="input width-full text-left"
                style="font-size: 18px"
              />
            </UiButton>
          </Block>
          <Block :title="$t('settings.members')">
            <Block
              :style="`border-color: red !important`"
              v-if="inputError('members')"
            >
              <Icon name="warning" class="mr-2 text-red" />
              <span class="text-red"> {{ inputError('members') }}&nbsp;</span>
            </Block>
            <UiButton class="d-block width-full px-3" style="height: auto">
              <TextareaArray
                v-model="form.members"
                :placeholder="`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`"
                class="input width-full text-left"
                style="font-size: 18px"
              />
            </UiButton>
          </Block>
          <Block :title="$t('settings.proposalValidation')">
            <div class="mb-2">
              <UiInput
                @click="modalValidationOpen = true"
                :error="inputError('settings.validation')"
              >
                <template v-slot:selected>
                  {{ form.validation.name }}
                </template>
                <template v-slot:label>
                  {{ $t(`settings.validation`) }}
                </template>
              </UiInput>
              <div v-if="form.validation.name === 'basic'">
                <UiInput
                  v-model="form.filters.minScore"
                  :error="inputError('minScore')"
                  :number="true"
                >
                  <template v-slot:label>{{
                    $t('settings.proposalThreshold')
                  }}</template>
                </UiInput>
                <div class="mb-2 d-flex flex-items-center px-2">
                  <Checkbox
                    v-model="form.filters.onlyMembers"
                    class="mr-2 mt-1"
                  />
                  {{ $t('settings.allowOnlyMembers') }}
                </div>
              </div>
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
    <template v-if="(loaded && isOwner) || (loaded && isAdmin)" #sidebar-right>
      <Block :title="$t('actions')">
        <UiButton @click="handleReset" class="d-block width-full mb-2">
          {{ $t('reset') }}
        </UiButton>
        <UiButton
          :disabled="uploadLoading"
          @click="handleSubmit"
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
    <ModalValidation
      :open="modalValidationOpen"
      @close="modalValidationOpen = false"
      @add="handleSubmitAddValidation"
      :validation="clone(form.validation)"
    />
  </teleport>
</template>

<script>
import { mapActions } from 'vuex';
import { computed } from 'vue';
import { useSearchFilters } from '@/composables/useSearchFilters';
import { getAddress } from '@ethersproject/address';
import { validateSchema } from '@snapshot-labs/snapshot.js/src/utils';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import gateways from '@snapshot-labs/snapshot.js/src/gateways.json';
import { clone } from '@/helpers/utils';
import { getSpaceUri, uriGet } from '@/helpers/ens';
import defaults from '@/locales/default';

const gateway = process.env.VUE_APP_IPFS_GATEWAY || gateways[0];
const basicValidation = { name: 'basic', params: {} };

export default {
  setup() {
    const { filteredPlugins } = useSearchFilters();
    const plugins = computed(() => filteredPlugins());

    function pluginName(key) {
      const plugin = plugins.value.find(obj => {
        return obj.key === key;
      });
      return plugin.name;
    }

    return { pluginName };
  },
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
      modalValidationOpen: false,
      loaded: false,
      loading: false,
      uploadLoading: false,
      showErrors: false,
      form: {
        strategies: [],
        plugins: {},
        filters: {},
        validation: basicValidation
      },
      networks
    };
  },
  computed: {
    validate() {
      if (this.form.terms === '') delete this.form.terms;
      return validateSchema(schemas.space, this.form);
    },
    isValid() {
      return !this.loading && this.validate === true && !this.uploadLoading;
    },
    contenthash() {
      const key = encodeURIComponent(this.key);
      const address = this.web3.account
        ? getAddress(this.web3.account)
        : '<your-address>';
      return `ipns://storage.snapshot.page/registry/${address}/${key}`;
    },
    isOwner() {
      return this.currentContenthash === this.contenthash;
    },
    isAdmin() {
      if (!this.app.spaces[this.key]) return false;
      const admins = (this.app.spaces[this.key].admins || []).map(admin =>
        admin.toLowerCase()
      );
      return admins.includes(this.web3.account?.toLowerCase());
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
      space.validation = space.validation || basicValidation;
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
      if (this.isValid) {
        if (this.form.filters.invalids) delete this.form.filters.invalids;
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
      } else {
        this.showErrors = true;
      }
    },
    inputError(field) {
      if (!this.isValid && !this.loading && this.showErrors) {
        const errors = Object.keys(defaults.errors);
        const errorFound = this.validate.find(
          error =>
            (errors.includes(error.keyword) &&
              error.params.missingProperty === field) ||
            (errors.includes(error.keyword) &&
              error.instancePath.includes(field))
        );

        if (errorFound?.instancePath.includes('strategies'))
          return this.$t('errors.minStrategy');
        else if (errorFound)
          return this.$tc(`errors.${errorFound.keyword}`, [
            errorFound?.params.limit
          ]);
      }
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
      this.form.plugins[payload.key] = payload.inputClone;
    },
    handleSubmitAddValidation(validation) {
      this.form.validation = validation;
    },
    setUploadLoading(s) {
      this.uploadLoading = s;
    },
    setAvatarUrl(url) {
      if (typeof url === 'string') this.form.avatar = url;
    },
    clone
  }
};
</script>
