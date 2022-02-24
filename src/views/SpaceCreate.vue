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
import { useDomain } from '@/composables/useDomain';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { useWeb3 } from '@/composables/useWeb3';
import { useClient } from '@/composables/useClient';
import { useStore } from '@/composables/useStore';
import { useIntl } from '@/composables/useIntl';
import { usePlugins } from '@/composables/usePlugins';

const props = defineProps({
  space: Object
});

const router = useRouter();
const route = useRoute();
const { t, setPageTitle } = useI18n();
const { formatCompactNumber } = useIntl();
const auth = getInstance();
const { domain } = useDomain();
const { web3, web3Account } = useWeb3();
const { send, clientLoading } = useClient();
const { store } = useStore();
const { pluginIndex } = usePlugins();

const notify = inject('notify');

const choices = ref([]);
const blockNumber = ref(-1);
const bodyLimit = ref(14400);
const form = ref({
  name: '',
  body: '',
  choices: [],
  start: parseInt((Date.now() / 1e3).toFixed()),
  end: 0,
  snapshot: '',
  metadata: { plugins: {} },
  type: 'single-choice'
});
const modalDateSelectOpen = ref(false);
const modalVotingTypeOpen = ref(false);
const selectedDate = ref('');
const nameInput = ref(null);
const passValidation = ref([true]);
const validationLoading = ref(false);
const loadingSnapshot = ref(true);

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

// Focus proposal name field when page loads
watch(nameInput, () => nameInput?.value?.focus());

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
</script>

<template>
  <Layout v-bind="$attrs">
    <template #content-left>
      <div v-if="currentStep === 1" class="px-4 md:px-0 overflow-hidden mb-3">
        <router-link
          :to="domain ? { path: '/' } : { name: 'spaceProposals' }"
          class="text-skin-text"
        >
          <Icon name="back" size="22" class="!align-middle" />
          {{ $t('back') }}
        </router-link>
      </div>

      <!-- Shows when no wallet is connected and the space has any sort 
      of validation set -->
      <BaseMessageBlock
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
          <BaseAnchor
            :link="{ name: 'spaceAbout', params: { key: space.id } }"
            >{{ t('learnMore') }}</BaseAnchor
          >
        </div>
      </BaseMessageBlock>

      <!-- Shows when wallet is connected and executing validation fails (e.g.
      due to misconfigured strategy)  -->
      <BaseMessageBlock
        level="warning"
        v-else-if="executingValidationFailed"
        :routeObject="{ name: 'spaceAbout', params: { key: space.id } }"
      >
        {{ $t('create.validationWarning.executionError') }}
      </BaseMessageBlock>

      <!-- Shows when wallet is connected and doesn't pass validaion -->
      <BaseMessageBlock level="warning" v-else-if="passValidation[0] === false">
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
          <BaseAnchor :link="{ name: 'spaceAbout', params: { key: space.id } }">
            {{ t('learnMore') }}
          </BaseAnchor>
        </div>
      </BaseMessageBlock>

      <template v-if="currentStep === 1">
        <div class="px-4 md:px-0">
          <div class="flex flex-col mb-6">
            <h1
              v-if="preview"
              v-text="form.name || $t('create.untitled')"
              class="mb-2 w-full break-all"
            />
            <input
              v-else
              v-model="form.name"
              maxlength="128"
              class="text-2xl font-semibold input mb-2 w-full"
              :placeholder="$t('create.question')"
              ref="nameInput"
            />
            <div class="relative group">
              <TextareaAutosize
                v-if="!preview"
                v-model="form.body"
                class="input pt-0 w-full"
                style="font-size: 22px"
                :placeholder="$t('create.content')"
                :max-length="bodyLimit"
              />
            </div>

            <div v-if="form.body && preview" class="mb-4">
              <UiMarkdown :body="form.body" />
            </div>
            <p v-if="form.body.length > bodyLimit" class="!text-red mt-4">
              -{{ formatCompactNumber(-(bodyLimit - form.body.length)) }}
            </p>
          </div>
        </div>
      </template>
      <template v-else-if="currentStep === 2">
        <Block :title="$t('create.voting')">
          <UiInput class="!mb-4" @click="modalVotingTypeOpen = true">
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
            <div class="overflow-hidden w-full space-y-2">
              <draggable
                v-model="choices"
                tag="transition-group"
                :component-data="{
                  type: 'transition-group'
                }"
                v-bind="{ animation: 200 }"
                :disabled="disableChoiceEdit"
                item-key="id"
                handle=".drag-handle"
              >
                >
                <template #item="{ element, index }">
                  <UiInput
                    v-model="element.text"
                    maxlength="32"
                    :disabled="disableChoiceEdit"
                    :placeholder="index > 0 ? $t('optional') : ''"
                    class="group mb-0"
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
                        <Icon name="draggable" size="16" class="mr-[12px]" />
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
                <Icon size="20" name="plus" class="text-skin-link" />
              </UiSidebarButton>
            </div>
          </div>
        </Block>

        <Block
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
              :class="{ 'cursor-not-allowed': space.voting?.delay }"
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
                <Icon
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
              :class="{ 'cursor-not-allowed': space.voting?.period }"
            >
              <template v-slot:selected>
                <span v-text="$d(dateEnd * 1e3, 'short', 'en-US')" />
              </template>
              <template v-slot:label>
                {{ $t(`create.end`) }}
              </template>
              <template v-slot:info>
                <Icon
                  name="calendar"
                  size="18"
                  class="flex items-center text-skin-text"
                  :class="{ 'cursor-not-allowed': space.voting?.period }"
                />
              </template>
            </UiInput>
          </div>
        </Block>

        <Block v-if="$route.query.snapshot" :title="$t('snapshot')">
          <UiInput
            v-model="form.snapshot"
            :number="true"
            :placeholder="$t('create.snapshotBlock')"
          >
            <template v-slot:label>
              {{ $t('snapshot') }}
            </template>
          </UiInput>
        </Block>
      </template>
      <template v-else>
        <div class="h-[1px] w-full" />
        <PluginCreate
          v-if="space?.plugins && (!sourceProposal || sourceProposalLoaded)"
          :proposal="proposal"
          :space="space"
          :preview="preview"
          v-model="form.metadata.plugins"
        />
      </template>
    </template>
    <template #sidebar-right>
      <Block class="lg:fixed lg:w-[320px]">
        <UiButton
          v-if="currentStep === 1"
          @click="preview = !preview"
          :loading="clientLoading || queryLoading"
          class="block w-full mb-3"
          no-focus
        >
          {{ preview ? $t('create.edit') : $t('create.preview') }}
        </UiButton>
        <UiButton
          v-else
          @click="currentStep--"
          class="block w-full mb-3"
          no-focus
        >
          {{ $t('back') }}
        </UiButton>

        <UiButton
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
        </UiButton>
        <UiButton
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
        </UiButton>
      </Block>
    </template>
  </Layout>
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
