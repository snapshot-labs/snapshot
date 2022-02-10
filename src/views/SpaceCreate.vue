<script setup>
import { ref, watchEffect, computed, onMounted, inject, watch } from 'vue';
import { useRouter } from 'vue-router';
import draggable from 'vuedraggable';
import { useI18n } from 'vue-i18n';
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
import { setPageTitle } from '@/helpers/utils';
import { useIntl } from '@/composables/useIntl';
import { calcToSeconds } from '@/helpers/utils';

const props = defineProps({
  spaceId: String,
  space: Object,
  from: String
});

const router = useRouter();
const { t } = useI18n();
const { formatCompactNumber } = useIntl();
const auth = getInstance();
const { domain } = useDomain();
const { web3, web3Account } = useWeb3();
const { send, clientLoading } = useClient();
const { store } = useStore();
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
const scheduleProposal = ref(false);
const periodSelectorDays = ref(3);
const periodSelectorHours = ref(0);
const periodSelectorMinutes = ref(0);

const proposal = computed(() =>
  Object.assign(form.value, { choices: choices.value })
);

// Update form start date when toggeling schedule proposal
watch(scheduleProposal, () => {
  form.value.start = parseInt((Date.now() / 1e3).toFixed());
});

// Check if account passes space validation
watch(
  () => [props.space, web3Account.value],
  async () => {
    validationLoading.value = true;
    if (props.space && web3Account.value && auth.isAuthenticated.value) {
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
    }
  },
  { immediate: true }
);

// const votingPeriod = computed({
//   get: () => calcFromSeconds(votingPeriodSeconds.value, periodUnit.value),
//   set: newVal =>
//     (votingPeriodSeconds.value = newVal
//       ? calcToSeconds(newVal, periodUnit.value)
//       : undefined)
// });

const votingPeriodSeconds = computed(
  () =>
    calcToSeconds(periodSelectorDays.value, 'd') +
    calcToSeconds(periodSelectorHours.value, 'h') +
    calcToSeconds(periodSelectorMinutes.value, 'm')
);

const dateStart = computed(() => {
  return props.space?.voting?.delay
    ? parseInt((Date.now() / 1e3).toFixed()) + props.space.voting.delay
    : form.value.start;
});

const dateEnd = computed(() => {
  return props.space?.voting?.period
    ? dateStart.value + props.space.voting.period
    : form.value.start + votingPeriodSeconds.value;
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

function addChoice(num) {
  for (let i = 1; i <= num; i++) {
    choices.value.push({ text: '' });
  }
}

function setDate(ts) {
  if (selectedDate.value) {
    form.value[selectedDate.value] = ts;
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
        key: props.spaceId,
        id: result.id
      }
    });
  }
}

const { modalAccountOpen } = useModal();
const { modalTermsOpen, termsAccepted, acceptTerms } = useTerms(props.spaceId);

const { apolloQuery, queryLoading } = useApolloQuery();

const sourceProposalLoaded = ref(false);
async function loadProposal() {
  const proposal = await apolloQuery(
    {
      query: PROPOSAL_QUERY,
      variables: {
        id: props.from
      }
    },
    'proposal'
  );

  form.value = {
    name: proposal.title,
    body: proposal.body,
    choices: proposal.choices,
    start: proposal.start,
    snapshot: proposal.snapshot,
    type: proposal.type
  };

  // Set the period selectors days, hours and minutes
  const seconds = proposal.end - proposal.start;
  periodSelectorDays.value =
    Math.floor(seconds / (3600 * 24)) <= 14
      ? Math.floor(seconds / (3600 * 24))
      : 14;
  periodSelectorHours.value = Math.floor((seconds % (3600 * 24)) / 3600);
  periodSelectorMinutes.value = Math.floor((seconds % 3600) / 60);

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
  addChoice(2);
  if (props.from) loadProposal();
});

// Prompt user to connect wallet if they haven't already
watch(
  () => props.space,
  () => {
    if (!web3Account.value && !web3.value.authLoading && props.space) {
      modalAccountOpen.value = true;
    }
  }
);

watchEffect(() => {
  if (props.space?.name)
    setPageTitle('page.title.space.create', { space: props.space.name });
});

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

const stepTwoIsValid = computed(() => {
  return (
    dateEnd.value &&
    dateEnd.value > dateStart.value &&
    form.value.snapshot &&
    form.value.snapshot > blockNumber.value / 2 &&
    !choices.value.some((a, i) => a.text === '' && i === 0)
  );
});

const currentStep = ref(1);

const stepIsValid = computed(() => {
  if (
    currentStep.value === 1 &&
    form.value.name &&
    form.value.body.length <= bodyLimit.value
  )
    return true;
  else if (currentStep.value === 2 && stepTwoIsValid.value) return true;
  else return false;
});

const preview = ref(false);

watch(preview, () => {
  window.scrollTo(0, 0);
});

function selectStartDate() {
  if (props.space.voting?.delay) return;

  modalDateSelectOpen.value = true;
  selectedDate.value = 'start';
}

import { usePlugins } from '@/composables/usePlugins';

// Check if has plugins than can be confirgured on proposal creation
const { getPluginComponents } = usePlugins();
const createPluginComponents = computed(() =>
  getPluginComponents('Create', Object.keys(props.space?.plugins))
);
</script>

<template>
  <Layout v-bind="$attrs">
    <template #content-left>
      <div v-if="currentStep === 1" class="px-4 md:px-0 overflow-hidden mb-3">
        <router-link
          :to="domain ? { path: '/' } : { name: 'spaceProposals' }"
          class="text-color"
        >
          <Icon name="back" size="22" class="!align-middle" />
          {{ $t('back') }}
        </router-link>
      </div>
      <PageLoading
        class="md:px-0 px-4"
        v-if="!space || (validationLoading && web3Account) || web3.authLoading"
      />
      <Block v-else-if="!web3Account">
        <Icon name="warning" class="mr-1" />
        <span v-if="!web3Account">
          {{ $t('connectWalletMessage') }}
        </span>
      </Block>
      <Block
        v-else-if="passValidation[0] === false"
        class="!border-skin-link text-skin-link"
      >
        <Icon name="warning" class="mr-1" />

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
          <a
            @click="
              router.push({ name: 'spaceAbout', params: { key: space.id } })
            "
            target="_blank"
            class="whitespace-nowrap"
            rel="noopener noreferrer"
            >{{ $t('learnMore') }}
            <Icon name="external-link" />
          </a>
        </div>
      </Block>
      <template v-else>
        <template v-if="currentStep === 1">
          <div class="px-4 md:px-0">
            <div class="flex flex-col mb-6">
              <h1
                v-if="preview"
                v-text="form.name || $t('create.untitled')"
                class="mb-2 w-full break-all"
              />
              <input
                v-if="!preview"
                v-model="form.name"
                maxlength="128"
                class="text-2xl font-bold input mb-2 w-full"
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
                <div
                  class="absolute right-0 bottom-2 hidden group-focus-within:block p-1 bg-skin-bg"
                  :class="{ 'text-red': form.body.length === bodyLimit }"
                >
                  {{ `${form.body.length} / ${bodyLimit}` }}
                </div>
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
            <div class="overflow-hidden mb-2">
              <draggable
                v-model="choices"
                :component-data="{ name: 'list' }"
                :disabled="disableChoiceEdit"
                item-key="id"
              >
                <template #item="{ element, index }">
                  <div class="flex space-x-2">
                    <UiInput
                      v-model="element.text"
                      maxlength="32"
                      :disabled="disableChoiceEdit"
                      :placeholder="index > 0 ? $t('optional') : ''"
                      class="group"
                      :focusOnMount="index === 0"
                    >
                      <template v-slot:label>
                        {{ $tc('create.choice', [index + 1]) }}
                      </template>
                      <template v-slot:info>
                        <span
                          class="text-skin-text text-xs hidden group-focus-within:block"
                        >
                          {{ `${element.text.length}/32` }}
                        </span>
                      </template>
                    </UiInput>
                    <UiSidebarButton
                      v-if="!disableChoiceEdit && choices.length === index + 1"
                      @click="addChoice(1)"
                      class="!w-[48px] !h-[48px] flex-none"
                    >
                      <Icon size="20" name="plus" class="text-skin-link" />
                    </UiSidebarButton>
                    <div v-else-if="!disableChoiceEdit" class="w-[54px]"></div>
                  </div>
                </template>
              </draggable>
            </div>
          </Block>

          <Block :title="$t('create.period')">
            <div
              v-if="!space.voting?.period"
              class="flex space-x-[18px] mb-3"
              :class="{ 'mb-1': !space.voting?.delay }"
            >
              <BaseNumberSelector
                v-model="periodSelectorDays"
                :label="$t('create.days')"
                :dropdownRange="15"
              />

              <BaseNumberSelector
                v-model="periodSelectorHours"
                :label="$t('create.hours')"
                :dropdownRange="24"
              />

              <BaseNumberSelector
                v-model="periodSelectorMinutes"
                :label="$t('create.minutes')"
                :dropdownRange="60"
              />
            </div>
            <div
              class="flex items-center space-x-2 pr-2 mb-1"
              v-if="!space.voting?.delay"
            >
              <Checkbox v-model="scheduleProposal" />
              <span>{{ $t('create.schedule') }}</span>
            </div>
            <UiInput
              v-if="scheduleProposal || space.voting?.delay"
              class="mb-3"
              @click="selectStartDate"
              :disabled="!!space.voting?.delay"
              v-tippy="{
                content: !!space.voting?.delay
                  ? $t('create.delayEnforced')
                  : null
              }"
            >
              <template v-slot:selected>
                <span v-text="$d(dateStart * 1e3, 'short', 'en-US')" />
              </template>
              <template v-slot:label> {{ $t(`create.start`) }} </template>
            </UiInput>

            <UiInput
              v-if="space.voting?.period"
              class="mb-3"
              disabled
              v-tippy="{
                content: $t('create.periodEnforced')
              }"
            >
              <template v-slot:selected>
                <span v-text="$d(dateEnd * 1e3, 'short', 'en-US')" />
              </template>
              <template v-slot:label> {{ $t(`create.end`) }} </template>
            </UiInput>
          </Block>

          <Block v-if="$route.query.snapshot" :title="$t('snapshot')">
            <UiInput
              v-model="form.snapshot"
              :number="true"
              :placeholder="$t('create.snapshotBlock')"
            >
              <template v-slot:label>
                {{ $t('Block number') }}
              </template>
            </UiInput>
          </Block>
        </template>
        <template v-else>
          <div class="h-[1px] w-full" />
          <PluginCreate
            v-if="space?.plugins && (!from || sourceProposalLoaded)"
            :proposal="proposal"
            :space="space"
            :preview="preview"
            v-model="form.metadata.plugins"
          />
        </template>
      </template>
    </template>
    <template #sidebar-right>
      <Block
        v-if="web3Account && passValidation[0] === true"
        class="lg:fixed lg:w-[320px]"
      >
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
          v-if="
            currentStep === 3 ||
            (!createPluginComponents.length && currentStep === 2)
          "
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
          @click="currentStep++"
          class="block w-full"
          :disabled="!stepIsValid"
          primary
        >
          {{ $t('create.continue') }}
        </UiButton>
      </Block>
    </template>
  </Layout>
  <teleport to="#modal" v-if="space">
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
