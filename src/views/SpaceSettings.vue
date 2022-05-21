<script setup>
import { computed, ref, inject, watch, onMounted } from 'vue';
import { useI18n } from '@/composables/useI18n';
import { getAddress } from '@ethersproject/address';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import defaults from '@/locales/default';
import { useWeb3 } from '@/composables/useWeb3';
import { calcFromSeconds, calcToSeconds } from '@/helpers/utils';
import { useClient } from '@/composables/useClient';
import { usePlugins } from '@/composables/usePlugins';
import { useSpaceController } from '@/composables/useSpaceController';
import { useEns } from '@/composables/useEns';
import { shorten } from '@/helpers/utils';
import {
  validateSchema,
  getSpaceUri,
  clone
} from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps({
  space: Object,
  sourceSpace: Object,
  loadExtentedSpaces: Function
});

const basicValidation = { name: 'basic', params: {} };

const { pluginIndex } = usePlugins();
const { t, setPageTitle } = useI18n();
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
const visitedFields = ref([]);
const validateAllFields = ref(false);
const delayUnit = ref('h');
const periodUnit = ref('h');

const form = ref({
  strategies: [],
  categories: [],
  admins: [],
  plugins: {},
  filters: {},
  voting: {},
  validation: basicValidation
});

const validate = computed(() => {
  if (form.value.terms === '') delete form.value.terms;
  if (form.value.avatar === '') delete form.value.avatar;
  if (form.value.website === '') delete form.value.website;

  return validateSchema(schemas.space, form.value);
});

const isValid = computed(() => {
  return (
    !clientLoading.value && validate.value === true && !uploadLoading.value
  );
});

const textRecord = computed(() => {
  const keyURI = encodeURIComponent(props.space.id);
  const address = web3Account.value
    ? getAddress(web3Account.value)
    : '<your-address>';
  return `ipns://storage.snapshot.page/registry/${address}/${keyURI}`;
});

const isSpaceController = computed(() => {
  return currentTextRecord.value === textRecord.value;
});

const { loadOwnedEnsDomains, ownedEnsDomains } = useEns();

watch(
  [currentTextRecord, textRecord],
  async () => {
    loadOwnedEnsDomains();
  },
  { immediate: true }
);

const ensOwner = computed(() =>
  ownedEnsDomains.value?.map(d => d.name).includes(props.space.id)
);

const isSpaceAdmin = computed(() => {
  if (!props.space || !currentTextRecord.value) return false;
  const admins = (props.space?.admins || []).map(admin => admin.toLowerCase());
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
    const result = await send({ id: props.space.id }, 'settings', form.value);
    console.log('Result', result);
    if (result.id) {
      notify(['green', t('notify.saved')]);
      props.loadExtentedSpaces([props.space.id]);
    }
  } else {
    console.log('Invalid schema', validate.value);
    validateAllFields.value = true;
  }
}

function inputError(field) {
  if (
    !isValid.value &&
    !clientLoading.value &&
    (visitedFields.value.includes(field) || validateAllFields.value)
  ) {
    const errors = Object.keys(defaults.errors);
    const errorFound = validate.value.find(
      error =>
        (errors.includes(error.keyword) &&
          error.params.missingProperty === field) ||
        (errors.includes(error.keyword) && error.instancePath.includes(field))
    );

    if (errorFound?.instancePath.includes('strategies'))
      return t('errors.minStrategy');
    else if (errorFound?.instancePath.includes('website'))
      return t('errors.website');
    else if (errorFound)
      return t(`errors.${errorFound.keyword}`, [errorFound?.params.limit]);
  }
  return false;
}

function handleReset() {
  if (props.sourceSpace) return (form.value = clone(props.sourceSpace));
  if (currentSettings.value) return (form.value = clone(currentSettings.value));
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

onMounted(async () => {
  if (props.space) {
    const spaceClone = formatSpace(props.space);
    if (spaceClone) {
      form.value = spaceClone;
      currentSettings.value = clone(spaceClone);
    }
  }
  if (props.sourceSpace) {
    const fromClone = formatSpace(props.sourceSpace);
    if (fromClone) {
      form.value = fromClone;
    }
  }
  try {
    const uri = await getSpaceUri(
      props.space.id,
      import.meta.env.VITE_DEFAULT_NETWORK
    );
    console.log('URI', uri);
    currentTextRecord.value = uri;
  } catch (e) {
    console.log(e);
  }

  loaded.value = true;
});

onMounted(() => {
  setPageTitle('page.title.space.settings', { space: props.space.name });
});

const {
  settingENSRecord,
  ensAddress,
  modalUnsupportedNetworkOpen,
  modalConfirmSetTextRecordOpen,
  spaceControllerInput,
  setRecord,
  confirmSetRecord
} = useSpaceController();

const modalControllerEditOpen = ref(false);

async function handleSetRecord() {
  const tx = await setRecord();
  const receipt = await tx.wait();
  if (receipt) {
    props.loadExtentedSpaces([props.space.id]);
  }
}
</script>

<template>
  <TheLayout v-bind="$attrs">
    <template #content-left>
      <div class="px-4 md:px-0 mb-3">
        <router-link :to="{ name: 'spaceProposals' }" class="text-skin-text">
          <BaseIcon name="back" size="22" class="!align-middle" />
          {{ $t('back') }}
        </router-link>
      </div>
      <div class="px-4 md:px-0">
        <h1 v-text="$t('settings.header')" class="mb-4" />
      </div>
      <LoadingRow v-if="!loaded" block />
      <BaseBlock v-else-if="!currentTextRecord">
        <BaseMessageBlock level="warning" class="mb-4">
          {{ $t('settings.needToSetEnsText') }}
        </BaseMessageBlock>
        <BaseButton
          @click="modalControllerEditOpen = true"
          :loading="settingENSRecord"
          primary
          class="w-full"
        >
          {{ $t('settings.setEnsTextRecord') }}
        </BaseButton>
      </BaseBlock>
      <template v-else-if="currentTextRecord">
        <div class="space-y-3">
          <BaseBlock :title="$t('settings.profile')">
            <div class="space-y-2 mb-2">
              <UiInput
                v-model="form.name"
                :error="inputError('name')"
                @blur="visitedFields.push('name')"
              >
                <template v-slot:label>{{ $t(`settings.name`) }}*</template>
              </UiInput>
              <UiInput
                v-model="form.about"
                :error="inputError('about')"
                @blur="visitedFields.push('about')"
              >
                <template v-slot:label> {{ $t(`settings.about`) }} </template>
              </UiInput>
              <UiInput
                v-model="form.avatar"
                placeholder="e.g. https://example.com/space.png"
                :error="inputError('avatar')"
                @blur="visitedFields.push('avatar')"
              >
                <template v-slot:label>
                  {{ $t(`settings.avatar`) }}
                </template>
                <template v-slot:info>
                  <ImageUpload
                    class="!ml-2"
                    @input="setAvatarUrl"
                    @loading="setUploadLoading"
                  >
                    {{ $t('upload') }}
                  </ImageUpload>
                </template>
              </UiInput>
              <UiInput
                @click="modalNetworksOpen = true"
                :error="inputError('network')"
                @blur="visitedFields.push('network')"
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
                @blur="visitedFields.push('symbol')"
              >
                <template v-slot:label> {{ $t(`settings.symbol`) }}* </template>
              </UiInput>
              <UiInput
                v-model="form.twitter"
                placeholder="e.g. elonmusk"
                :error="inputError('twitter')"
                @blur="visitedFields.push('twitter')"
              >
                <template v-slot:label>
                  <BaseIcon name="twitter" />
                </template>
              </UiInput>
              <UiInput
                v-model="form.github"
                placeholder="e.g. vbuterin"
                :error="inputError('github')"
                @blur="visitedFields.push('github')"
              >
                <template v-slot:label>
                  <BaseIcon name="github" />
                </template>
              </UiInput>
              <UiInput
                v-model="form.website"
                placeholder="e.g. https://example.com"
                :error="inputError('website')"
                @blur="visitedFields.push('website')"
              >
                <template v-slot:label>
                  <BaseIcon name="earth" />
                </template>
              </UiInput>
              <UiInput
                v-model="form.terms"
                placeholder="e.g. https://example.com/terms"
                :error="inputError('terms')"
                @blur="visitedFields.push('terms')"
              >
                <template v-slot:label> {{ $t(`settings.terms`) }} </template>
              </UiInput>
              <div class="flex items-center space-x-2 pr-2">
                <BaseCheckbox v-model="form.private" />
                <span>{{ $t('settings.hideSpace') }}</span>
              </div>
            </div>
          </BaseBlock>
          <BaseBlock :title="$t('settings.customDomain')">
            <UiInput
              v-model="form.domain"
              placeholder="e.g. vote.balancer.fi"
              :error="inputError('domain')"
              @blur="visitedFields.push('domain')"
              class="mb-2"
            >
              <template v-slot:label>
                {{ $t('settings.domain') }}
              </template>
              <template v-slot:info>
                <BaseLink
                  class="flex items-center -mr-1"
                  link="https://docs.snapshot.org/spaces/add-custom-domain"
                  hide-external-icon
                >
                  <BaseIcon name="info" size="24" class="text-skin-text" />
                </BaseLink>
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
          </BaseBlock>
          <BaseBlock :title="$t('settings.admins')" v-if="isSpaceController">
            <BaseBlock class="!border-red mb-2" v-if="inputError('admins')">
              <BaseIcon name="warning" class="mr-2 !text-red" />
              <span class="!text-red"> {{ inputError('admins') }}&nbsp;</span>
            </BaseBlock>
            <TextareaArray
              v-model="form.admins"
              :placeholder="`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`"
              class="input w-full text-left"
              style="font-size: 18px"
            />
          </BaseBlock>
          <BaseBlock :title="$t('settings.authors')">
            <BaseBlock class="!border-red mb-2" v-if="inputError('members')">
              <BaseIcon name="warning" class="mr-2 !text-red" />
              <span class="!text-red"> {{ inputError('members') }}&nbsp;</span>
            </BaseBlock>
            <TextareaArray
              v-model="form.members"
              :placeholder="`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`"
              class="input w-full text-left"
              style="font-size: 18px"
            />
          </BaseBlock>
          <BaseBlock :title="$t('settings.strategies') + '*'">
            <div
              v-for="(strategy, i) in form.strategies"
              :key="i"
              class="mb-3 relative"
            >
              <a @click="handleRemoveStrategy(i)" class="absolute p-4 right-0">
                <BaseIcon name="close" size="12" />
              </a>

              <a
                @click="handleEditStrategy(i)"
                class="p-4 block border rounded-md"
              >
                <h4 v-text="strategy.name" />
              </a>
            </div>
            <BaseBlock
              :style="`border-color: red !important`"
              v-if="inputError('strategies')"
            >
              <BaseIcon name="warning" class="mr-2 !text-red" />
              <span class="!text-red">
                {{ inputError('strategies') }}&nbsp;</span
              >
              <BaseLink
                link="https://docs.snapshot.org/spaces/create#strategies"
              >
                {{ $t('learnMore') }}
              </BaseLink>
            </BaseBlock>
            <BaseButton @click="handleAddStrategy" class="block w-full">
              {{ $t('settings.addStrategy') }}
            </BaseButton>
          </BaseBlock>
          <BaseBlock :title="$t('settings.proposalValidation')">
            <div class="space-y-2">
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
                <div class="flex items-center space-x-2 pr-2 mt-2">
                  <BaseCheckbox v-model="form.filters.onlyMembers" />
                  <span>{{ $t('settings.allowOnlyAuthors') }}</span>
                </div>
              </div>
            </div>
          </BaseBlock>
          <BaseBlock :title="$t('settings.voting')">
            <div class="space-y-2">
              <UiInput
                v-model="votingDelay"
                :number="true"
                placeholder="e.g. 1"
              >
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
              <UiInput
                v-model="votingPeriod"
                :number="true"
                placeholder="e.g. 5"
              >
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
                <BaseCheckbox v-model="form.voting.hideAbstain" />
                <span>{{ $t('settings.hideAbstain') }}</span>
              </div>
            </div>
          </BaseBlock>
          <BaseBlock :title="$t('plugins')">
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
                    <BaseIcon name="close" size="12" />
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
            <BaseButton @click="handleAddPlugins" class="block w-full">
              {{ $t('settings.addPlugin') }}
            </BaseButton>
          </BaseBlock>
        </div>
      </template>
    </template>

    <template #sidebar-right>
      <BaseMessageBlock
        level="info"
        v-if="
          !(isSpaceController || isSpaceAdmin || ensOwner) && currentTextRecord
        "
      >
        {{ $t('settings.connectWithSpaceOwner') }}
      </BaseMessageBlock>
      <div v-else-if="loaded" class="lg:fixed lg:w-[318px]">
        <BaseBlock>
          <BaseButton
            v-if="ensOwner"
            @click="modalControllerEditOpen = true"
            :loading="settingENSRecord"
            class="block w-full mb-2"
          >
            {{ $t('settings.editController') }}
          </BaseButton>
          <div v-if="isSpaceAdmin || isSpaceController">
            <BaseButton @click="handleReset" class="block w-full mb-2">
              {{ $t('reset') }}
            </BaseButton>
            <BaseButton
              :disabled="uploadLoading"
              @click="handleSubmit"
              :loading="clientLoading"
              class="block w-full"
              primary
            >
              {{ $t('save') }}
            </BaseButton>
          </div>
        </BaseBlock>
      </div>
    </template>
  </TheLayout>
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
      :space="space"
      :defaultNetwork="form.network"
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
    <ModalControllerEdit
      :open="modalControllerEditOpen"
      @close="modalControllerEditOpen = false"
      :currentTextRecord="currentTextRecord"
      :ensAddress="space.id"
      @set="(ensAddress = space.id), confirmSetRecord()"
    />
    <ModalUnsupportedNetwork
      :open="modalUnsupportedNetworkOpen"
      @close="modalUnsupportedNetworkOpen = false"
      @networkChanged="modalConfirmSetTextRecordOpen = true"
    />
    <ModalConfirmAction
      :open="modalConfirmSetTextRecordOpen"
      @close="modalConfirmSetTextRecordOpen = false"
      @confirm="handleSetRecord"
    >
      <div class="space-y-4 m-4 text-skin-link">
        <p>
          {{
            $t('setup.confirmToSetAddress', {
              address: shorten(spaceControllerInput)
            })
          }}
          {{ $t('setup.controllerHasAuthority') + '.' }}
        </p>
      </div>
    </ModalConfirmAction>
  </teleport>
</template>
