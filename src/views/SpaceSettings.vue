<script setup lang="ts">
import { computed, ref, inject, watch, onMounted } from 'vue';
import { useI18n } from '@/composables/useI18n';
import { getAddress } from '@ethersproject/address';
import schemas from '@snapshot-labs/snapshot.js/src/schemas';
import defaults from '@/locales/default.json';
import { useWeb3 } from '@/composables/useWeb3';
import {
  calcFromSeconds,
  calcToSeconds,
  shorten,
  clearAvatarCache
} from '@/helpers/utils';
import { useClient } from '@/composables/useClient';
import { usePlugins } from '@/composables/usePlugins';
import { useSpaceController } from '@/composables/useSpaceController';
import { useEns } from '@/composables/useEns';
import {
  validateSchema,
  getSpaceUri,
  clone
} from '@snapshot-labs/snapshot.js/src/utils';
import { useExtendedSpaces } from '@/composables/useExtendedSpaces';
import { ExtendedSpace } from '@/helpers/interfaces';
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';

const props = defineProps<{
  space: ExtendedSpace;
  sourceSpace: ExtendedSpace;
}>();

const basicValidation = { name: 'basic', params: {} };

const { pluginIndex } = usePlugins();
const { t, setPageTitle } = useI18n();
const { web3Account } = useWeb3();
const { send, clientLoading } = useClient();
const { reloadSpace } = useExtendedSpaces();
const { form } = useSpaceSettingsForm();
const notify: any = inject('notify');

const currentSettings = ref({});
const currentTextRecord = ref('');
const currentPlugin = ref({});
const modalSkinsOpen = ref(false);
const modalCategoryOpen = ref(false);
const modalVotingTypeOpen = ref(false);
const modalPluginsOpen = ref(false);
const modalValidationOpen = ref(false);
const loaded = ref(false);
const uploadLoading = ref(false);
const visitedFields = ref<string[]>([]);
const validateAllFields = ref(false);
const delayUnit = ref('h');
const periodUnit = ref('h');

const defaultNetwork = import.meta.env.VITE_DEFAULT_NETWORK;

const validate = computed(() => {
  const formattedForm = formatSpace(form.value);

  return validateSchema(schemas.space, formattedForm);
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
  const registryNetworkPath = defaultNetwork === '1' ? '' : 'testnet/';
  return `ipns://storage.snapshot.page/registry/${registryNetworkPath}${address}/${keyURI}`;
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
    const formattedForm = formatSpace(form.value);
    const result = await send(
      { id: props.space.id },
      'settings',
      formattedForm
    );
    console.log('Result', result);
    if (result.id) {
      notify(['green', t('notify.saved')]);
      await clearAvatarCache(props.space.id);
      reloadSpace(props.space.id);
    }
  } else {
    console.log('Invalid schema', validate.value);
    validateAllFields.value = true;
  }
}

function formatSpace(spaceRaw) {
  if (!spaceRaw) return;
  const space = clone(spaceRaw);
  if (!space) return;
  delete space.id;
  delete space.followersCount;
  if (form.value.filters.invalids) delete form.value.filters.invalids;
  Object.entries(space).forEach(([key, value]) => {
    if (value === null || value === '') delete space[key];
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

function inputError(field) {
  if (
    !isValid.value &&
    !clientLoading.value &&
    (visitedFields.value.includes(field) || validateAllFields.value) &&
    Array.isArray(validate.value)
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
  return '';
}

function handleReset() {
  if (props.sourceSpace) return (form.value = clone(props.sourceSpace));
  if (currentSettings.value) return (form.value = clone(currentSettings.value));
}

function handleSubmitAddCategories(categories) {
  form.value.categories = categories;
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

onMounted(async () => {
  if (props.space) {
    const spaceClone = clone(props.space);
    if (spaceClone) {
      form.value = spaceClone;
      currentSettings.value = clone(spaceClone);
    }
  }
  if (props.sourceSpace) {
    const fromClone = clone(props.sourceSpace);
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
    reloadSpace(props.space.id);
  }
}
</script>

<template>
  <TheLayout v-bind="$attrs">
    <template #content-left>
      <div class="mb-3 px-4 md:px-0">
        <router-link :to="{ name: 'spaceProposals' }" class="text-skin-text">
          <BaseIcon name="back" size="22" class="!align-middle" />
          {{ $t('back') }}
        </router-link>
      </div>
      <div class="px-4 md:px-0">
        <h1 class="mb-4" v-text="$t('settings.header')" />
      </div>
      <LoadingRow v-if="!loaded" block />
      <template v-else-if="currentTextRecord">
        <div class="space-y-3">
          <BaseMessage
            v-if="
              !(isSpaceController || isSpaceAdmin || ensOwner) &&
              currentTextRecord
            "
            class="mx-4 mb-5 md:mx-0"
            level="info"
          >
            {{ $t('settings.connectWithSpaceOwner') }}
          </BaseMessage>
          <BaseBlock :title="$t('settings.profile')">
            <div class="mb-2 space-y-2">
              <UiInput
                v-model="form.name"
                :error="inputError('name')"
                @blur="visitedFields.push('name')"
              >
                <template #label>{{ $t(`settings.name`) }}*</template>
              </UiInput>
              <UiInput
                v-model="form.about"
                :error="inputError('about')"
                @blur="visitedFields.push('about')"
              >
                <template #label> {{ $t(`settings.about`) }} </template>
              </UiInput>
              <UiInput
                v-model="form.avatar"
                placeholder="e.g. https://example.com/space.png"
                :error="inputError('avatar')"
                @blur="visitedFields.push('avatar')"
              >
                <template #label>
                  {{ $t(`settings.avatar`) }}
                </template>
                <template #info>
                  <InputUploadImage
                    class="!ml-2"
                    @input="setAvatarUrl"
                    @loading="setUploadLoading"
                  >
                    {{ $t('upload') }}
                  </InputUploadImage>
                </template>
              </UiInput>
              <UiInput @click="modalCategoryOpen = true">
                <template #label>
                  {{ $t(`settings.categories`) }}
                </template>
                <template #selected>
                  <span class="capitalize">
                    {{ categoriesString }}
                  </span>
                </template>
              </UiInput>
              <UiInput
                v-model="form.twitter"
                placeholder="e.g. elonmusk"
                :error="inputError('twitter')"
                @blur="visitedFields.push('twitter')"
              >
                <template #label>
                  <BaseIcon name="twitter" />
                </template>
              </UiInput>
              <UiInput
                v-model="form.github"
                placeholder="e.g. vbuterin"
                :error="inputError('github')"
                @blur="visitedFields.push('github')"
              >
                <template #label>
                  <BaseIcon name="github" />
                </template>
              </UiInput>
              <UiInput
                v-model="form.website"
                placeholder="e.g. https://example.com"
                :error="inputError('website')"
                @blur="visitedFields.push('website')"
              >
                <template #label>
                  <BaseIcon name="earth" />
                </template>
              </UiInput>
              <UiInput
                v-model="form.terms"
                placeholder="e.g. https://example.com/terms"
                :error="inputError('terms')"
                @blur="visitedFields.push('terms')"
              >
                <template #label> {{ $t(`settings.terms`) }} </template>
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
              class="mb-2"
              @blur="visitedFields.push('domain')"
            >
              <template #label>
                {{ $t('settings.domain') }}
              </template>
              <template #info>
                <BaseLink
                  class="-mr-1 flex items-center"
                  link="https://docs.snapshot.org/spaces/add-custom-domain"
                  hide-external-icon
                >
                  <BaseIcon name="info" size="24" class="text-skin-text" />
                </BaseLink>
              </template>
            </UiInput>
            <UiInput :error="inputError('skin')" @click="modalSkinsOpen = true">
              <template #selected>
                {{ form.skin ? form.skin : $t('defaultSkin') }}
              </template>
              <template #label>
                {{ $t(`settings.skin`) }}
              </template>
            </UiInput>
          </BaseBlock>
          <BaseBlock v-if="isSpaceController" :title="$t('settings.admins')">
            <BaseBlock v-if="inputError('admins')" class="mb-2 !border-red">
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
            <BaseBlock v-if="inputError('members')" class="mb-2 !border-red">
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

          <StrategiesBlock
            :form="form"
            :get-error="inputError"
            @update-strategies="val => (form.strategies = val)"
            @update-network="val => (form.network = val)"
            @update-symbol="val => (form.symbol = val)"
          />

          <BaseBlock :title="$t('settings.proposalValidation')">
            <div class="space-y-2">
              <UiInput
                :error="inputError('settings.validation')"
                @click="modalValidationOpen = true"
              >
                <template #selected>
                  {{ form.validation.name }}
                </template>
                <template #label>
                  {{ $t(`settings.validation`) }}
                </template>
              </UiInput>
              <div v-if="form.validation.name === 'basic'">
                <UiInput
                  v-model="form.filters.minScore"
                  :error="inputError('minScore')"
                  :number="true"
                >
                  <template #label>{{
                    $t('settings.proposalThreshold')
                  }}</template>
                </UiInput>
                <div class="mt-2 flex items-center space-x-2 pr-2">
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
                <template #label>
                  {{ $t('settings.votingDelay') }}
                </template>
                <template #info>
                  <select
                    v-model="delayUnit"
                    class="input mr-[6px] ml-2 text-center"
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
                <template #label>
                  {{ $t('settings.votingPeriod') }}
                </template>
                <template #info>
                  <select
                    v-model="periodUnit"
                    class="input mr-[6px] ml-2 text-center"
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
                <template #label>
                  {{ $t('settings.quorum') }}
                </template>
              </UiInput>
              <UiInput>
                <template #label>
                  {{ $t('settings.type') }}
                </template>
                <template #selected>
                  <div class="w-full" @click="modalVotingTypeOpen = true">
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
                class="relative mb-3"
              >
                <div v-if="pluginIndex[name].name">
                  <a
                    class="absolute right-0 p-4"
                    @click="handleRemovePlugins(name)"
                  >
                    <BaseIcon name="close" size="12" />
                  </a>
                  <a
                    class="block rounded-md border p-4"
                    @click="handleEditPlugins(name)"
                  >
                    <h4 v-text="pluginIndex[name].name" />
                  </a>
                </div>
              </div>
            </div>
            <BaseButton class="block w-full" @click="handleAddPlugins">
              {{ $t('settings.addPlugin') }}
            </BaseButton>
          </BaseBlock>
        </div>
      </template>
    </template>

    <template #sidebar-right>
      <div class="mt-5 lg:mt-0" />
      <div
        v-if="
          !(isSpaceController || isSpaceAdmin || ensOwner) && currentTextRecord
        "
      />
      <div v-else-if="loaded" class="lg:fixed lg:w-[318px]">
        <BaseBlock>
          <BaseButton
            v-if="ensOwner"
            :loading="settingENSRecord"
            class="mb-2 block w-full"
            @click="modalControllerEditOpen = true"
          >
            {{ $t('settings.editController') }}
          </BaseButton>
          <div v-if="isSpaceAdmin || isSpaceController">
            <BaseButton class="mb-2 block w-full" @click="handleReset">
              {{ $t('reset') }}
            </BaseButton>
            <BaseButton
              :disabled="uploadLoading"
              :loading="clientLoading"
              class="block w-full"
              primary
              @click="handleSubmit"
            >
              {{ $t('save') }}
            </BaseButton>
          </div>
        </BaseBlock>
      </div>
    </template>
  </TheLayout>
  <teleport to="#modal">
    <ModalSkins
      v-model="form.skin"
      :open="modalSkinsOpen"
      @close="modalSkinsOpen = false"
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
      v-model:selected="form.voting.type"
      :open="modalVotingTypeOpen"
      allow-any
      @close="modalVotingTypeOpen = false"
    />
    <ModalControllerEdit
      :open="modalControllerEditOpen"
      :current-text-record="currentTextRecord"
      :ens-address="space.id"
      @close="modalControllerEditOpen = false"
      @set="confirmSetRecord()"
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
      <div class="m-4 space-y-4 text-skin-link">
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
