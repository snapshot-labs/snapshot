<script setup>
import { computed, ref, watchEffect, inject, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { getAddress } from '@ethersproject/address';
import {
  validateSchema,
  getSpaceUri,
  clone
} from '@snapshot-labs/snapshot.js/src/utils';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import defaults from '@/locales/default';
import { useCopy } from '@/composables/useCopy';
import { useWeb3 } from '@/composables/useWeb3';
import { calcFromSeconds, calcToSeconds } from '@/helpers/utils';
import { useClient } from '@/composables/useClient';
import { setPageTitle } from '@/helpers/utils';
import { usePlugins } from '@/composables/usePlugins';

const props = defineProps({
  spaceId: String,
  space: Object,
  from: String,
  spaceFrom: Object,
  spaceLoading: Boolean,
  loadExtentedSpaces: Function
});

const basicValidation = { name: 'basic', params: {} };

const { pluginIndex } = usePlugins();
const { t } = useI18n();
const { copyToClipboard } = useCopy();
const { web3Account } = useWeb3();
const { send, clientLoading } = useClient();
const notify = inject('notify');

const currentSettings = ref({});
const currentTextRecord = ref('');
const currentStrategy = ref({});
const currentPlugin = ref({});
const currentStrategyIndex = ref(false);
const modalNetworksOpen = ref(false);
const modalSkinsOpen = ref(false);
const modalStrategyOpen = ref(false);
const modalCategoryOpen = ref(false);
const modalVotingTypeOpen = ref(false);
const modalPluginsOpen = ref(false);
const modalValidationOpen = ref(false);
const loaded = ref(false);
const uploadLoading = ref(false);
const showErrors = ref(false);
const delayUnit = ref('h');
const periodUnit = ref('h');
const form = ref({
  strategies: [],
  categories: [],
  plugins: {},
  filters: {},
  voting: {},
  validation: basicValidation
});

const validate = computed(() => {
  if (form.value.terms === '') delete form.value.terms;
  if (form.value.avatar === '') delete form.value.avatar;

  return validateSchema(schemas.space, form.value);
});

const isValid = computed(() => {
  return (
    !clientLoading.value && validate.value === true && !uploadLoading.value
  );
});

const textRecord = computed(() => {
  const keyURI = encodeURIComponent(props.spaceId);
  const address = web3Account.value
    ? getAddress(web3Account.value)
    : '<your-address>';
  return `ipns://storage.snapshot.page/registry/${address}/${keyURI}`;
});

const isOwner = computed(() => {
  return currentTextRecord.value === textRecord.value;
});

watch([currentTextRecord, textRecord], () => {
  // Check if the connected wallet is the space owner and add address to admins
  // if not already present
  if (isOwner.value) {
    if (!form.value.admins.includes(web3Account.value)) {
      form.value.admins.push(web3Account.value);
    }
  }
});

const isAdmin = computed(() => {
  if (!props.space || !currentTextRecord.value) return false;
  const admins = (props.space.admins || []).map(admin => admin.toLowerCase());
  return admins.includes(web3Account.value?.toLowerCase());
});

const votingDelay = computed({
  get: () => calcFromSeconds(form.value.voting?.delay, delayUnit.value),
  set: newVal =>
    (form.value.voting.delay = newVal
      ? calcToSeconds(newVal, delayUnit.value)
      : undefined)
});

const votingPeriod = computed({
  get: () => calcFromSeconds(form.value.voting?.period, periodUnit.value),
  set: newVal =>
    (form.value.voting.period = newVal
      ? calcToSeconds(newVal, periodUnit.value)
      : undefined)
});

const categoriesString = computed(() => {
  return form.value.categories ? form.value.categories.join(', ') : '';
});

async function handleSubmit() {
  if (isValid.value) {
    if (form.value.filters.invalids) delete form.value.filters.invalids;
    const result = await send({ id: props.spaceId }, 'settings', form.value);
    console.log('Result', result);
    if (result.id) {
      notify(['green', t('notify.saved')]);
      props.loadExtentedSpaces([props.spaceId]);
    }
  } else {
    console.log('Invalid schema', validate.value);
    showErrors.value = true;
  }
}

function inputError(field) {
  if (!isValid.value && !clientLoading.value && showErrors.value) {
    const errors = Object.keys(defaults.errors);
    const errorFound = validate.value.find(
      error =>
        (errors.includes(error.keyword) &&
          error.params.missingProperty === field) ||
        (errors.includes(error.keyword) && error.instancePath.includes(field))
    );

    if (errorFound?.instancePath.includes('strategies'))
      return t('errors.minStrategy');
    else if (errorFound)
      return t(`errors.${errorFound.keyword}`, [errorFound?.params.limit]);
  }
}

function handleReset() {
  if (props.from) return (form.value = clone(props.spaceFrom));
  if (currentSettings.value)
    return (form.value = clone(currentSettings.value));
  form.value = {
    strategies: [],
    categories: [],
    plugins: {},
    filters: {}
  };
}

function handleEditStrategy(i) {
  currentStrategyIndex.value = i;
  currentStrategy.value = clone(form.value.strategies[i]);
  modalStrategyOpen.value = true;
}

function handleRemoveStrategy(i) {
  form.value.strategies = form.value.strategies.filter(
    (strategy, index) => index !== i
  );
}

function handleSubmitAddCategories(categories) {
  form.value.categories = categories;
}

function handleAddStrategy() {
  currentStrategyIndex.value = false;
  currentStrategy.value = {};
  modalStrategyOpen.value = true;
}

function handleSubmitAddStrategy(strategy) {
  if (currentStrategyIndex.value !== false) {
    form.value.strategies[currentStrategyIndex.value] = strategy;
  } else {
    form.value.strategies = form.value.strategies.concat(strategy);
  }
}

function handleEditPlugins(name) {
  currentPlugin.value = {};
  currentPlugin.value[name] = clone(form.value.plugins[name]);
  modalPluginsOpen.value = true;
}

function handleRemovePlugins(plugin) {
  delete form.value.plugins[plugin];
}

function handleAddPlugins() {
  currentPlugin.value = {};
  modalPluginsOpen.value = true;
}

function handleSubmitAddPlugins(payload) {
  form.value.plugins[payload.key] = payload.input;
}

function handleSubmitAddValidation(validation) {
  form.value.validation = clone(validation);
}

function setUploadLoading(s) {
  uploadLoading.value = s;
}

function setAvatarUrl(url) {
  if (typeof url === 'string') form.value.avatar = url;
}

function formatSpace(spaceRaw) {
  if (!spaceRaw) return;
  const space = clone(spaceRaw);
  if (!space) return;
  delete space.id;
  delete space.followersCount;
  Object.entries(space).forEach(([key, value]) => {
    if (value === null) delete space[key];
  });
  space.strategies = space.strategies || [];
  space.plugins = space.plugins || {};
  space.validation = space.validation || basicValidation;
  space.filters = space.filters || {};
  space.voting = space.voting || {};
  space.voting.delay = space.voting?.delay || undefined;
  space.voting.period = space.voting?.period || undefined;
  space.voting.type = space.voting?.type || undefined;
  space.voting.quorum = space.voting?.quorum || undefined;
  return space;
}

watch(
  () => props.spaceLoading,
  async () => {
    if (!props.spaceLoading) {
      const spaceClone = formatSpace(props.space);
      if (spaceClone) {
        form.value = spaceClone;
        currentSettings.value = clone(spaceClone);
      }
      if (props.from) {
        const fromClone = formatSpace(props.spaceFrom);
        if (fromClone) {
          form.value = fromClone;
        }
      }
      try {
        const uri = await getSpaceUri(
          props.spaceId,
          import.meta.env.VITE_DEFAULT_NETWORK
        );
        console.log('URI', uri);
        currentTextRecord.value = uri;
      } catch (e) {
        console.log(e);
      }

      loaded.value = true;
    }
  }
);

watchEffect(() => {
  props.space && props.space?.name
    ? setPageTitle('page.title.space.settings', { space: props.space.name })
    : setPageTitle('page.title.setup');
});
</script>

<template>
  <Layout v-bind="$attrs">
    <template #content-left>
      <div class="px-4 md:px-0 mb-3">
        <router-link :to="{ name: 'spaceProposals' }" class="text-color">
          <Icon name="back" size="22" class="!align-middle" />
          {{ $t('back') }}
        </router-link>
      </div>
      <div class="px-4 md:px-0">
        <h1 v-text="$t('settings.header')" class="mb-4" />
      </div>
      <Block title="ENS">
        <UiButton class="flex w-full mb-2 items-center">
          <input
            readonly
            v-model="textRecord"
            class="input w-full"
            :placeholder="$t('contectHash')"
          />
          <Icon
            @click="copyToClipboard(textRecord)"
            name="copy"
            size="24"
            class="text-color p-2 -mr-3"
          />
        </UiButton>
        <a
          :href="`https://app.ens.domains/name/${spaceId}`"
          target="_blank"
          class="mb-2 block"
        >
          <UiButton
            class="button-outline w-full"
            :primary="!isOwner && !isAdmin"
          >
            {{
              isOwner || isAdmin ? $t('settings.seeENS') : $t('settings.setENS')
            }}
            <Icon name="external-link" class="ml-1" />
          </UiButton>
        </a>
        <Block
          v-if="currentSettings?.name && !currentTextRecord && loaded"
          :style="'border-color: red !important; margin-bottom: 0 !important;'"
          class="mb-0 mt-3"
        >
          <Icon name="warning" class="mr-2 !text-red" />
          <span class="!text-red">
            {{ $t('settings.warningTextRecord') }}
            <a
              v-text="$t('learnMore')"
              href="https://docs.snapshot.org/spaces/create"
              target="_blank"
            />
          </span>
        </Block>
      </Block>
      <RowLoadingBlock v-if="!loaded" />
      <template v-else>
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
                  class="!ml-2"
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
              <template v-slot:label> {{ $t(`settings.network`) }}* </template>
            </UiInput>
            <UiInput @click="modalCategoryOpen = true">
              <template v-slot:label>
                {{ $t(`settings.categories`) }}
              </template>
              <template v-slot:selected>
                <span class="capitalize">
                  {{ categoriesString }}
                </span>
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
              v-model="form.terms"
              placeholder="e.g. https://example.com/terms"
              :error="inputError('terms')"
            >
              <template v-slot:label> {{ $t(`settings.terms`) }} </template>
            </UiInput>
            <div class="flex items-center space-x-2 pr-2">
              <Checkbox v-model="form.private" />
              <span>{{ $t('settings.hideSpace') }}</span>
            </div>
          </div>
        </Block>
        <Block :title="$t('settings.customDomain')">
          <UiInput
            v-model="form.domain"
            placeholder="e.g. vote.balancer.fi"
            :error="inputError('domain')"
          >
            <template v-slot:label>
              {{ $t('settings.domain') }}
            </template>
            <template v-slot:info>
              <a
                class="flex items-center -mr-1"
                target="_blank"
                href="https://docs.snapshot.org/spaces/add-custom-domain"
              >
                <Icon name="info" size="24" class="text-color" />
              </a>
            </template>
          </UiInput>
          <UiInput @click="modalSkinsOpen = true" :error="inputError('skin')">
            <template v-slot:selected>
              {{ form.skin ? form.skin : $t('defaultSkin') }}
            </template>
            <template v-slot:label>
              {{ $t(`settings.skin`) }}
            </template>
          </UiInput>
        </Block>
        <Block :title="$t('settings.admins')" v-if="isOwner">
          <Block
            :style="`border-color: red !important`"
            v-if="inputError('admins')"
          >
            <Icon name="warning" class="mr-2 !text-red" />
            <span class="!text-red"> {{ inputError('admins') }}&nbsp;</span>
          </Block>
          <UiButton class="block w-full px-3" style="height: auto">
            <TextareaArray
              v-model="form.admins"
              :placeholder="`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`"
              class="input w-full text-left"
              style="font-size: 18px"
            />
          </UiButton>
        </Block>
        <Block :title="$t('settings.strategies') + '*'">
          <div
            v-for="(strategy, i) in form.strategies"
            :key="i"
            class="mb-3 relative"
          >
            <a @click="handleRemoveStrategy(i)" class="absolute p-4 right-0">
              <Icon name="close" size="12" />
            </a>

            <a
              @click="handleEditStrategy(i)"
              class="p-4 block border rounded-md"
            >
              <h4 v-text="strategy.name" />
            </a>
          </div>
          <Block
            :style="`border-color: red !important`"
            v-if="inputError('strategies')"
          >
            <Icon name="warning" class="mr-2 !text-red" />
            <span class="!text-red"> {{ inputError('strategies') }}&nbsp;</span>
            <a
              href="https://docs.snapshot.org/spaces/create#strategies"
              target="_blank"
              rel="noopener noreferrer"
              >{{ $t('learnMore') }}
              <Icon name="external-link" />
            </a>
          </Block>
          <UiButton @click="handleAddStrategy" class="block w-full">
            {{ $t('settings.addStrategy') }}
          </UiButton>
        </Block>
        <Block :title="$t('settings.proposalValidation')">
          <div class="flex items-center space-x-2 pr-2 mb-2">
            <Checkbox v-model="form.filters.onlyMembers" />
            <span>{{ $t('settings.allowOnlyAuthors') }}</span>
          </div>
          <div v-if="form.filters.onlyMembers">
            <Block class="!border-red" v-if="inputError('members')">
              <Icon name="warning" class="mr-2 !text-red" />
              <span class="!text-red"> {{ inputError('members') }}&nbsp;</span>
            </Block>
            <UiButton class="block w-full px-3" style="height: auto">
              <TextareaArray
                v-model="form.members"
                :placeholder="`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`"
                class="input w-full text-left"
                style="font-size: 18px"
              />
            </UiButton>
          </div>
          <template v-else>
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
            </div>
          </template>
        </Block>
        <Block :title="$t('settings.voting')">
          <UiInput v-model="votingDelay" :number="true" placeholder="e.g. 1">
            <template v-slot:label>
              {{ $t('settings.votingDelay') }}
            </template>
            <template v-slot:info>
              <select
                v-model="delayUnit"
                class="input text-center mr-[6px] ml-2"
                required
              >
                <option value="h" selected>hours</option>
                <option value="d">days</option>
              </select>
            </template>
          </UiInput>
          <UiInput v-model="votingPeriod" :number="true" placeholder="e.g. 5">
            <template v-slot:label>
              {{ $t('settings.votingPeriod') }}
            </template>
            <template v-slot:info>
              <select
                v-model="periodUnit"
                class="input text-center mr-[6px] ml-2"
                required
              >
                <option value="h" selected>hours</option>
                <option value="d">days</option>
              </select>
            </template>
          </UiInput>
          <UiInput
            v-model="form.voting.quorum"
            :number="true"
            placeholder="1000"
          >
            <template v-slot:label>
              {{ $t('settings.quorum') }}
            </template>
          </UiInput>
          <UiInput>
            <template v-slot:label>
              {{ $t('settings.type') }}
            </template>
            <template v-slot:selected>
              <div @click="modalVotingTypeOpen = true" class="w-full">
                {{
                  form.voting?.type
                    ? $t(`voting.${form.voting?.type}`)
                    : $t('settings.anyType')
                }}
              </div>
            </template>
          </UiInput>
          <div class="flex items-center space-x-2 pr-2">
            <Checkbox v-model="form.voting.hideAbstain" />
            <span>{{ $t('settings.hideAbstain') }}</span>
          </div>
        </Block>
        <Block :title="$t('plugins')">
          <div v-if="form?.plugins">
            <div
              v-for="(name, index) in Object.keys(form.plugins).filter(
                key => pluginIndex[key]
              )"
              :key="index"
              class="mb-3 relative"
            >
              <div v-if="pluginIndex[name].name">
                <a
                  @click="handleRemovePlugins(name)"
                  class="absolute p-4 right-0"
                >
                  <Icon name="close" size="12" />
                </a>
                <a
                  @click="handleEditPlugins(name)"
                  class="p-4 block border rounded-md"
                >
                  <h4 v-text="pluginIndex[name].name" />
                </a>
              </div>
            </div>
          </div>
          <UiButton @click="handleAddPlugins" class="block w-full">
            {{ $t('settings.addPlugin') }}
          </UiButton>
        </Block>
      </template>
    </template>
    <template v-if="(loaded && isOwner) || (loaded && isAdmin)" #sidebar-right>
      <div class="lg:fixed lg:w-[300px]">
        <Block :title="$t('actions')">
          <UiButton @click="handleReset" class="block w-full mb-2">
            {{ $t('reset') }}
          </UiButton>
          <UiButton
            :disabled="uploadLoading"
            @click="handleSubmit"
            :loading="clientLoading"
            class="block w-full"
            primary
          >
            {{ $t('save') }}
          </UiButton>
        </Block>
      </div>
    </template>
  </Layout>
  <teleport to="#modal">
    <ModalNetworks
      v-model="form.network"
      :open="modalNetworksOpen"
      @close="modalNetworksOpen = false"
    />
    <ModalSkins
      v-model="form.skin"
      :open="modalSkinsOpen"
      @close="modalSkinsOpen = false"
    />
    <ModalStrategy
      :open="modalStrategyOpen"
      :strategy="currentStrategy"
      @close="modalStrategyOpen = false"
      @add="handleSubmitAddStrategy"
    />
    <ModalCategory
      :open="modalCategoryOpen"
      :categories="form.categories"
      @close="modalCategoryOpen = false"
      @add="handleSubmitAddCategories"
    />
    <ModalPlugins
      :open="modalPluginsOpen"
      :plugin="currentPlugin"
      @close="modalPluginsOpen = false"
      @add="handleSubmitAddPlugins"
    />
    <ModalValidation
      :open="modalValidationOpen"
      :validation="form.validation"
      @close="modalValidationOpen = false"
      @add="handleSubmitAddValidation"
    />
    <ModalVotingType
      :open="modalVotingTypeOpen"
      @close="modalVotingTypeOpen = false"
      v-model:selected="form.voting.type"
      allowAny
    />
  </teleport>
</template>
