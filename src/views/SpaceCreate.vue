<script setup>
import { ref, watchEffect, computed, onMounted, inject, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import draggable from 'vuedraggable';
import { useI18n } from '@/composables/useI18n';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { getBlockNumber } from '@snapshot-labs/snapshot.js/src/utils/web3';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useModal } from '@/composables/useModal';
import { useTerms } from '@/composables/useTerms';
import { PROPOSAL_QUERY } from '@/helpers/queries';
import validations from '@snapshot-labs/snapshot.js/src/validations';
import { useApp } from '@/composables/useApp';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { useWeb3 } from '@/composables/useWeb3';
import { useClient } from '@/composables/useClient';
import { useStore } from '@/composables/useStore';
import { useIntl } from '@/composables/useIntl';
import { usePlugins } from '@/composables/usePlugins';
import { useImageUpload } from '@/composables/useImageUpload';
import { useStorage } from '@vueuse/core';

const props = defineProps({
  space: Object
});

const router = useRouter();
const route = useRoute();
const { t, setPageTitle } = useI18n();
const { formatCompactNumber, formatNumber } = useIntl();
const auth = getInstance();
const { domain } = useApp();
const { web3, web3Account } = useWeb3();
const { send, clientLoading } = useClient();
const { store } = useStore();
const { pluginIndex } = usePlugins();

const notify = inject('notify');

const EMPTY_PROPOSAL = {
  name: '',
  body: '',
  discussion: '',
  choices: [],
  start: parseInt((Date.now() / 1e3).toFixed()),
  end: 0,
  snapshot: '',
  metadata: { plugins: {} },
  type: 'single-choice'
};

const form = useStorage('snapshot.proposal', EMPTY_PROPOSAL);

const choices = ref([]);
const blockNumber = ref(-1);
const bodyLimit = ref(14400);

const modalDateSelectOpen = ref(false);
const modalVotingTypeOpen = ref(false);
const selectedDate = ref('');
const passValidation = ref([true]);
const validationLoading = ref(false);
const loadingSnapshot = ref(true);
const textAreaEl = ref(null);
const imageDragging = ref(false);

const proposal = computed(() =>
  Object.assign(form.value, { choices: choices.value })
);

const sourceProposal = computed(() => route.params.sourceProposal);

// Check if account passes space validation
// (catch errors to show confiuration error message)
const executingValidationFailed = ref(false);
watch(
  () => web3Account.value,
  async () => {
    validationLoading.value = true;
    if (web3Account.value && auth.isAuthenticated.value) {
      try {
        const validationName = props.space.validation?.name ?? 'basic';
        const validationParams = props.space.validation?.params ?? {};
        const isValid = await validations[validationName](
          web3Account.value,
          clone(props.space),
          '',
          clone(validationParams)
        );

        passValidation.value = [isValid, validationName];
        console.log('Pass validation?', isValid, validationName);
        validationLoading.value = false;
      } catch (e) {
        executingValidationFailed.value = true;
        console.log(e);
      }
    }
  },
  { immediate: true }
);

const userSelectedDateStart = ref(false);
const userSelectedDateEnd = ref(false);

function setDate(ts) {
  if (selectedDate.value) {
    form.value[selectedDate.value] = ts;
    if (selectedDate.value === 'start') {
      userSelectedDateStart.value = true;
    }
    if (selectedDate.value === 'end') {
      userSelectedDateEnd.value = true;
    }
  }
}

const dateStart = computed(() => {
  return props.space?.voting?.delay
    ? parseInt((Date.now() / 1e3).toFixed()) + props.space.voting.delay
    : form.value.start;
});

const dateEnd = computed(() => {
  return props.space?.voting?.period
    ? dateStart.value + props.space.voting.period
    : userSelectedDateEnd.value
    ? form.value.end
    : dateStart.value + 259200;
});

const isValid = computed(() => {
  const isSafeSnapPluginValid = form.value.metadata.plugins?.safeSnap
    ? form.value.metadata.plugins.safeSnap.valid
    : true;

  return (
    !clientLoading.value &&
    form.value.body.length <= bodyLimit.value &&
    dateEnd.value &&
    dateEnd.value > dateStart.value &&
    form.value.snapshot &&
    form.value.snapshot > blockNumber.value / 2 &&
    choices.value.length >= 1 &&
    !choices.value.some((a, i) => a.text === '' && i === 0) &&
    passValidation.value[0] &&
    isSafeSnapPluginValid &&
    !web3.value.authLoading
  );
});

const disableChoiceEdit = computed(() => form.value.type === 'basic');

function addChoices(num) {
  for (let i = 1; i <= num; i++) {
    choices.value.push({ id: choices.value.length, text: '' });
  }
}

async function handleSubmit() {
  form.value.snapshot = parseInt(form.value.snapshot);
  form.value.choices = choices.value
    .map(choice => choice.text)
    .filter(choiceText => choiceText.length > 0);
  form.value.metadata.network = props.space.network;
  form.value.metadata.strategies = props.space.strategies;
  form.value.start = props.space.voting?.delay
    ? parseInt((Date.now() / 1e3).toFixed()) + props.space.voting.delay
    : dateStart.value;
  form.value.end = props.space.voting?.period
    ? form.value.start + props.space.voting.period
    : dateEnd.value;
  const result = await send(props.space, 'proposal', form.value);
  console.log('Result', result);
  if (result.id) {
    store.space.proposals = [];
    notify(['green', t('notify.proposalCreated')]);
    form.value = EMPTY_PROPOSAL;
    router.push({
      name: 'spaceProposal',
      params: {
        key: props.space.id,
        id: result.id
      }
    });
  }
}

const { modalAccountOpen } = useModal();
const { modalTermsOpen, termsAccepted, acceptTerms } = useTerms(props.space.id);

const { apolloQuery, queryLoading } = useApolloQuery();

const sourceProposalLoaded = ref(false);
async function loadProposal() {
  const proposal = await apolloQuery(
    {
      query: PROPOSAL_QUERY,
      variables: {
        id: sourceProposal.value
      }
    },
    'proposal'
  );

  userSelectedDateEnd.value = true;

  form.value = {
    name: proposal.title,
    body: proposal.body,
    discussion: proposal.discussion,
    choices: proposal.choices,
    start: proposal.start,
    end: proposal.end,
    snapshot: proposal.snapshot,
    type: proposal.type
  };

  const { network, strategies, plugins } = proposal;
  form.value.metadata = { network, strategies, plugins };

  choices.value = proposal.choices.map((text, key) => ({
    key,
    text
  }));

  sourceProposalLoaded.value = true;
}

onMounted(async () => {
  addChoices(2);
  if (sourceProposal.value) loadProposal();
});

onMounted(() =>
  setPageTitle('page.title.space.create', { space: props.space.name })
);

watchEffect(async () => {
  loadingSnapshot.value = true;
  if (props.space?.network) {
    blockNumber.value = await getBlockNumber(getProvider(props.space.network));
    form.value.snapshot = blockNumber.value;
    loadingSnapshot.value = false;
  }
  if (props.space?.voting?.type) form.value.type = props.space.voting.type;
});

watchEffect(() => {
  if (form.value.type === 'basic') {
    choices.value = [
      { key: 1, text: t('voting.choices.for') },
      { key: 2, text: t('voting.choices.against') },
      { key: 3, text: t('voting.choices.abstain') }
    ];
  }
});

const currentStep = ref(1);

const stepIsValid = computed(() => {
  if (
    currentStep.value === 1 &&
    form.value.name &&
    form.value.body.length <= bodyLimit.value &&
    passValidation.value[0] === true
  )
    return true;
  else if (
    currentStep.value === 2 &&
    dateEnd.value &&
    dateEnd.value > dateStart.value &&
    form.value.snapshot &&
    form.value.snapshot > blockNumber.value / 2 &&
    !choices.value.some((a, i) => a.text === '' && i === 0)
  )
    return true;
  else return false;
});

const preview = ref(false);

watch(preview, () => {
  window.scrollTo(0, 0);
});

function selectDate(date) {
  selectedDate.value = date;
  modalDateSelectOpen.value = true;
}

// Update form start date when going to step two
watch(currentStep, () => {
  if (!userSelectedDateEnd.value)
    form.value.start = parseInt((Date.now() / 1e3).toFixed());
});

// Check if has plugins that can be confirgured on proposal creation
const needsPluginConfigs = computed(() =>
  Object.keys(props.space?.plugins ?? {}).some(
    pluginKey => pluginIndex[pluginKey]?.defaults?.proposal
  )
);

const injectImageToBody = image => {
  const cursorPosition = textAreaEl.value.selectionStart;
  const currentBody = textAreaEl.value.value;
  form.value.body =
    currentBody.substring(0, cursorPosition) +
    `
![${image.name}](${image.url})` +
    currentBody.substring(cursorPosition);
};

const {
  upload,
  error: imageUploadError,
  uploading
} = useImageUpload({
  onSuccess: injectImageToBody
});

const handlePaste = e => {
  for (let i = 0; i < e.clipboardData.items.length; ++i) {
    let item = e.clipboardData.items[i];
    if (item.kind == 'file' && item.type.startsWith('image/')) {
      const file = item.getAsFile();
      upload(new File([file], 'image', { type: file.type }));
    }
  }
};

const handleDrop = e => {
  for (let i = 0; i < e.dataTransfer.files.length; i++) {
    let item = e.dataTransfer.files[i];
    if (item.type.startsWith('image/')) {
      upload(item);
    }
  }
};
</script>

<template>
  <TheLayout v-bind="$attrs">
    <template #content-left>
      <div v-if="currentStep === 1" class="px-4 md:px-0 overflow-hidden mb-3">
        <router-link
          :to="domain ? { path: '/' } : { name: 'spaceProposals' }"
          class="text-skin-text"
        >
          <BaseIcon name="back" size="22" class="!align-middle" />
          {{ $t('back') }}
        </router-link>
      </div>

      <!-- Shows when no wallet is connected and the space has any sort
      of validation set -->
      <BaseMessageBlock
        class="mb-4"
        level="warning"
        v-if="
          !web3Account &&
          !web3.authLoading &&
          (space?.validation?.params.minScore ||
            space?.filters.minScore ||
            space?.filters.onlyMembers)
        "
      >
        <span v-if="space?.filters.onlyMembers">
          {{ $t('create.validationWarning.basic.member') }}
        </span>
        <span
          v-else-if="
            space?.validation?.params.minScore || space?.filters.minScore
          "
        >
          {{
            $tc('create.validationWarning.basic.minScore', [
              formatCompactNumber(space.filters.minScore),
              space.symbol
            ])
          }}
        </span>
        <div>
          <BaseLink :link="{ name: 'spaceAbout', params: { key: space.id } }">{{
            t('learnMore')
          }}</BaseLink>
        </div>
      </BaseMessageBlock>

      <!-- Shows when wallet is connected and executing validation fails (e.g.
      due to misconfigured strategy)  -->
      <BaseMessageBlock
        level="warning"
        v-else-if="executingValidationFailed"
        :routeObject="{ name: 'spaceAbout', params: { key: space.id } }"
        class="mb-4"
      >
        {{ $t('create.validationWarning.executionError') }}
      </BaseMessageBlock>

      <!-- Shows when wallet is connected and doesn't pass validaion -->
      <BaseMessageBlock
        level="warning"
        v-else-if="passValidation[0] === false"
        class="mb-4"
      >
        <span v-if="passValidation[1] === 'basic'">
          <span v-if="space?.filters.onlyMembers">
            {{ $t('create.validationWarning.basic.member') }}
          </span>
          <span
            v-else-if="
              space?.validation?.params.minScore || space?.filters.minScore
            "
          >
            {{
              $tc('create.validationWarning.basic.minScore', [
                formatCompactNumber(space.filters.minScore),
                space.symbol
              ])
            }}
          </span>
        </span>
        <span v-else>
          {{
            $t(
              space.validation.params.rules ||
                'create.validationWarning.customValidation'
            )
          }}
        </span>
        <div>
          <BaseLink :link="{ name: 'spaceAbout', params: { key: space.id } }">
            {{ t('learnMore') }}
          </BaseLink>
        </div>
      </BaseMessageBlock>

      <template v-if="currentStep === 1">
        <div class="px-4 md:px-0">
          <div class="flex flex-col space-y-3">
            <h1
              v-if="preview"
              v-text="form.name || $t('create.untitled')"
              class="w-full break-all"
            />
            <SBaseInput
              v-else
              v-model="form.name"
              :title="$t('create.proposalTitle')"
              :maxLength="128"
              focusOnMount
            />

            <div v-if="!preview">
              <div class="flex justify-between">
                <SBaseLabel>
                  {{ $t('create.proposalDescription') }}
                </SBaseLabel>
                <div class="text-xs">
                  {{ formatNumber(form.body.length) }} /
                  {{ formatNumber(bodyLimit) }}
                </div>
              </div>
              <div
                @drop.prevent="handleDrop"
                @dragover="imageDragging = true"
                @dragleave="imageDragging = false"
              >
                <div
                  class="min-h-[240px] peer border rounded-t-xl overflow-hidden focus-within:border-skin-text"
                >
                  <textarea
                    @paste="handlePaste"
                    ref="textAreaEl"
                    class="s-input pt-0 w-full min-h-[240px] border-none !rounded-xl text-base h-full mt-0"
                    :maxLength="bodyLimit"
                    v-model="form.body"
                  />
                </div>

                <label
                  class="relative flex justify-between border border-skin-border rounded-b-xl py-1 px-2 items-center peer-focus-within:border-skin-text border-t-0"
                >
                  <input
                    accept="image/jpg, image/jpeg, image/png"
                    type="file"
                    class="opacity-0 absolute p-[5px] top-0 right-0 bottom-0 left-0 w-full ml-0"
                    @change="e => upload(e.target.files[0])"
                  />

                  <span class="pointer-events-none relative pl-1 text-sm">
                    <span v-if="uploading" class="flex">
                      <LoadingSpinner small class="mr-2 -mt-[2px]" />
                      {{ $t('create.uploading') }}
                    </span>
                    <span v-else-if="imageUploadError !== ''">
                      {{ imageUploadError }}</span
                    >
                    <span v-else>
                      {{ $t('create.uploadImageExplainer') }}
                    </span>
                  </span>
                  <BaseLink
                    class="relative inline"
                    link="https://docs.github.com/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
                    v-tippy="{ content: $t('create.markdown') }"
                    hide-external-icon
                  >
                    <BaseIcon name="markdown" class="text-skin-text" />
                  </BaseLink>
                </label>
              </div>
            </div>

            <div v-if="form.body && preview" class="mb-4">
              <BaseMarkdown :body="form.body" />
            </div>

            <SBaseInput
              v-if="!preview"
              v-model="form.discussion"
              placeholder="e.g. https://forum.balancer.fi/proposal..."
              :title="$t('create.discussion')"
            />
          </div>
        </div>
      </template>
      <div v-else-if="currentStep === 2" class="space-y-4">
        <BaseBlock :title="$t('create.voting')">
          <UiInput
            @click="!space.voting?.type ? (modalVotingTypeOpen = true) : null"
            :disabled="space.voting?.type"
            v-tippy="{
              content: !!space.voting?.type ? $t('create.typeEnforced') : null
            }"
            :class="[
              space.voting?.type ? 'cursor-not-allowed' : 'cursor-pointer'
            ]"
            class="!mb-4"
          >
            <template v-slot:selected>
              <span class="w-full">
                {{ $t(`voting.${form.type}`) }}
              </span>
            </template>
            <template v-slot:label>
              {{ $t(`create.votingSystem`) }}
            </template>
          </UiInput>
          <div class="flex">
            <div class="overflow-hidden w-full">
              <draggable
                v-model="choices"
                v-bind="{ animation: 200 }"
                :disabled="disableChoiceEdit"
                item-key="id"
                handle=".drag-handle"
                class="space-y-2"
              >
                >
                <template #item="{ element, index }">
                  <UiInput
                    v-model="element.text"
                    maxlength="32"
                    :disabled="disableChoiceEdit"
                    :placeholder="index > 0 ? $t('optional') : ''"
                    class="group"
                    :focusOnMount="index === 0"
                  >
                    <template v-slot:label>
                      <div
                        class="flex items-center cursor-grab active:cursor-grabbing drag-handle"
                        :class="{
                          'cursor-not-allowed active:cursor-not-allowed':
                            disableChoiceEdit
                        }"
                      >
                        <BaseIcon
                          name="draggable"
                          size="16"
                          class="mr-[12px]"
                        />
                        {{ $tc('create.choice', [index + 1]) }}
                      </div>
                    </template>
                    <template v-slot:info>
                      <span
                        class="text-skin-text text-xs hidden group-focus-within:block"
                      >
                        {{ `${element.text.length}/32` }}
                      </span>
                    </template>
                  </UiInput>
                </template>
              </draggable>
            </div>
            <div v-if="!disableChoiceEdit" class="w-[48px] flex items-end ml-2">
              <UiSidebarButton
                v-if="!disableChoiceEdit"
                @click="addChoices(1)"
                class="!w-[48px] !h-[48px]"
              >
                <BaseIcon size="20" name="plus" class="text-skin-link" />
              </UiSidebarButton>
            </div>
          </div>
        </BaseBlock>

        <BaseBlock
          :title="$t('create.period')"
          icon="info"
          :iconTooltip="$t('create.votingPeriodExplainer')"
        >
          <div class="md:flex md:space-x-3">
            <UiInput
              @click="!space.voting?.delay ? selectDate('start') : null"
              :disabled="!!space.voting?.delay"
              v-tippy="{
                content: !!space.voting?.delay
                  ? $t('create.delayEnforced')
                  : null
              }"
              :class="[
                space.voting?.delay ? 'cursor-not-allowed' : 'cursor-pointer'
              ]"
            >
              <template v-slot:selected>
                <span
                  v-text="
                    Math.round(dateStart / 10) ===
                    Math.round(parseInt((Date.now() / 1e3).toFixed()) / 10)
                      ? $t('create.now')
                      : $d(dateStart * 1e3, 'short', 'en-US')
                  "
                />
              </template>
              <template v-slot:label>
                {{ $t(`create.start`) }}
              </template>
              <template v-slot:info>
                <BaseIcon
                  name="calendar"
                  size="18"
                  class="flex items-center text-skin-text"
                />
              </template>
            </UiInput>

            <UiInput
              @click="!space.voting?.period ? selectDate('end') : null"
              :disabled="!!space.voting?.period"
              v-tippy="{
                content: space.voting?.period
                  ? $t('create.periodEnforced')
                  : null
              }"
              class="mb-0 md:mb-2"
              :class="[
                space.voting?.period ? 'cursor-not-allowed' : 'cursor-pointer'
              ]"
            >
              <template v-slot:selected>
                <span v-text="$d(dateEnd * 1e3, 'short', 'en-US')" />
              </template>
              <template v-slot:label>
                {{ $t(`create.end`) }}
              </template>
              <template v-slot:info>
                <BaseIcon
                  name="calendar"
                  size="18"
                  class="flex items-center text-skin-text"
                  :class="{ 'cursor-not-allowed': space.voting?.period }"
                />
              </template>
            </UiInput>
          </div>
        </BaseBlock>

        <BaseBlock v-if="$route.query.snapshot" :title="$t('snapshot')">
          <UiInput
            v-model="form.snapshot"
            :number="true"
            :placeholder="$t('create.snapshotBlock')"
          >
            <template v-slot:label>
              {{ $t('snapshot') }}
            </template>
          </UiInput>
        </BaseBlock>
      </div>
      <div v-else class="space-y-3">
        <PluginCreate
          v-if="space?.plugins && (!sourceProposal || sourceProposalLoaded)"
          :proposal="proposal"
          :space="space"
          :preview="preview"
          v-model="form.metadata.plugins"
        />
      </div>
    </template>
    <template #sidebar-right>
      <BaseBlock class="lg:fixed lg:w-[320px]">
        <BaseButton
          v-if="currentStep === 1"
          @click="preview = !preview"
          :loading="clientLoading || queryLoading"
          class="block w-full mb-2"
        >
          {{ preview ? $t('create.edit') : $t('create.preview') }}
        </BaseButton>
        <BaseButton v-else @click="currentStep--" class="block w-full mb-2">
          {{ $t('back') }}
        </BaseButton>

        <BaseButton
          v-if="currentStep === 3 || (!needsPluginConfigs && currentStep === 2)"
          @click="
            !termsAccepted && space.terms
              ? (modalTermsOpen = true)
              : handleSubmit()
          "
          :disabled="!isValid"
          :loading="clientLoading || queryLoading"
          class="block w-full"
          primary
        >
          {{ $t('create.publish') }}
        </BaseButton>
        <BaseButton
          v-else
          @click="web3Account ? currentStep++ : (modalAccountOpen = true)"
          class="block w-full"
          :disabled="
            (!stepIsValid && !!web3Account) ||
            web3.authLoading ||
            executingValidationFailed
          "
          primary
        >
          {{ web3Account ? $t('create.continue') : $t('connectWallet') }}
        </BaseButton>
      </BaseBlock>
    </template>
  </TheLayout>
  <teleport to="#modal">
    <ModalSelectDate
      :selectedDate="selectedDate"
      :open="modalDateSelectOpen"
      @close="modalDateSelectOpen = false"
      @input="setDate"
    />
    <ModalTerms
      :open="modalTermsOpen"
      :space="space"
      @close="modalTermsOpen = false"
      @accept="acceptTerms(), handleSubmit()"
    />
    <ModalVotingType
      :open="modalVotingTypeOpen"
      @close="modalVotingTypeOpen = false"
      v-model:selected="form.type"
    />
  </teleport>
</template>
