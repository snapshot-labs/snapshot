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
import { calcFromSeconds, calcToSeconds } from '@/helpers/utils';

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
const nameForm = ref(null);
const passValidation = ref([true]);
const validationLoading = ref(false);
const loadingSnapshot = ref(true);
const chooseStartDate = ref(false);
const periodUnit = ref('d');
const votingPeriodSeconds = ref(259200);
const durationSelectorDays = ref(3);
const durationSelectorHours = ref(0);
const durationSelectorMinutes = ref(0);

const proposal = computed(() =>
  Object.assign(form.value, { choices: choices.value })
);

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

const votingPeriod = computed({
  get: () => calcFromSeconds(votingPeriodSeconds.value, periodUnit.value),
  set: newVal =>
    (votingPeriodSeconds.value = newVal
      ? calcToSeconds(newVal, periodUnit.value)
      : undefined)
});

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
  // const ts = (Date.now() / 1e3).toFixed();
  const isSafeSnapPluginValid = form.value.metadata.plugins?.safeSnap
    ? form.value.metadata.plugins.safeSnap.valid
    : true;

  return (
    !clientLoading.value &&
    form.value.body.length <= bodyLimit.value &&
    // form.value.start >= ts &&
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
  form.value.choices = choices.value.map(choice => choice.text);
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

function clickSubmit() {
  !web3Account.value
    ? (modalAccountOpen.value = true)
    : !termsAccepted.value && props.space.terms
    ? (modalTermsOpen.value = true)
    : handleSubmit();
}

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
watch(nameForm, () => nameForm?.value?.focus());

onMounted(async () => {
  addChoice(2);
  if (props.from) loadProposal();
});

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
    !choices.value.some((a, i) => a.text === '' && i === 0) &&
    form.value.snapshot &&
    form.value.snapshot > blockNumber.value / 2
  );
});

const currentStep = ref(1);

function nextStep() {
  if (currentStep.value === 1 && !web3Account.value)
    modalAccountOpen.value = true;
  else if (currentStep.value === 1) {
    if (form.value.name && form.value.body.length <= bodyLimit.value) {
      currentStep.value = 2;
    } else {
      nameForm?.value?.focus();
      if (!passValidation.value[0])
        notify(['red', t('Wallet does not pass validation')]);
      else if (!form.value.name) notify(['red', t('Missing proposal title')]);
      else if (form.value.body.length > bodyLimit.value)
        notify(['red', t('Proposal too is long')]);
    }
  } else if (currentStep.value === 2) {
    if (stepTwoIsValid.value) {
      currentStep.value = 3;
    } else {
      console.log(choices.value.length);
      if (!dateStart.value || !dateEnd.value)
        notify(['red', t('Missing start or end date')]);
      else if (dateEnd.value < dateStart.value)
        notify(['red', t('End date must be after start date')]);
      else if (choices.value.length < 1)
        notify(['red', t('You must add at least one choice')]);
      else if (choices.value.some(a => a.text === ''))
        notify(['red', t('Missing choice text')]);
    }
  }
}

const stepIsValid = computed(() => {
  if (
    currentStep.value === 1 &&
    form.value.name &&
    form.value.body.length <= bodyLimit.value
  )
    return true;
  else if (stepTwoIsValid.value) return true;
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
      <PageLoading v-if="!space || (validationLoading && web3Account)" />
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
                v-text="form.name || 'Untitled'"
                class="mb-2 w-full break-all"
              />
              <input
                v-if="!preview"
                v-model="form.name"
                maxlength="128"
                class="text-2xl font-bold input mb-2 w-full"
                :placeholder="$t('create.question')"
                ref="nameForm"
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
          <Block :title="$t('Voting')">
            <UiInput class="!mb-4" @click="modalVotingTypeOpen = true">
              <template v-slot:selected>
                <span class="w-full">
                  {{ $t(`voting.${form.type}`) }}
                </span>
              </template>
              <template v-slot:label> {{ $t(`Voting system`) }} </template>
            </UiInput>
            <div v-if="choices.length > 0" class="overflow-hidden mb-2">
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
                      :placeholder="index > 0 ? $t('(optional)') : ''"
                      class="group"
                    >
                      <template v-slot:label>
                        <span>
                          {{ 'Choice ' + (index + 1) }}
                        </span>
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
                      @click="addChoice(1)"
                      v-if="!disableChoiceEdit && choices.length === index + 1"
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

          <Block title="Proposal duration">
            <div class="flex items-center space-x-2 pr-2 mb-2">
              <Checkbox v-model="chooseStartDate" />
              <span>{{ $t('Pick a start date') }}</span>
            </div>
            <UiInput
              v-if="chooseStartDate"
              class="mb-3"
              @click="selectStartDate"
              :disabled="!!space.voting?.delay"
              v-tippy="{
                content: !!space.voting?.delay
                  ? $t('Delay is enforced by the space')
                  : null
              }"
            >
              <template v-slot:selected>
                <span v-text="$d(dateStart * 1e3, 'short', 'en-US')" />
              </template>
              <template v-slot:label> {{ $t(`Start`) }} </template>
            </UiInput>

            {{ $t(`Voting period`) }}
            <div class="flex space-x-3 mt-1">
              <UiInput>
                <template v-slot:selected>
                  <BaseNumberSelector
                    v-model="durationSelectorDays"
                    :dropdownRange="8"
                  />
                </template>
                <template v-slot:label>days</template>
              </UiInput>
              <UiInput>
                <template v-slot:selected>
                  <BaseNumberSelector
                    v-model="durationSelectorHours"
                    :dropdownRange="24"
                  />
                </template>
                <template v-slot:label>hours</template>
              </UiInput>
              <UiInput>
                <template v-slot:selected>
                  <BaseNumberSelector
                    v-model="durationSelectorMinutes"
                    :dropdownRange="60"
                  />
                </template>
                <template v-slot:label>Minutes</template>
              </UiInput>
            </div>
          </Block>

          <Block v-if="$route.query.snapshot" title="Snapshot">
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
      <Block class="lg:fixed lg:w-[320px]">
        <UiButton
          v-if="currentStep === 1"
          @click="preview = !preview"
          :loading="clientLoading || queryLoading"
          class="block w-full mb-3"
          no-focus
        >
          {{ preview ? $t('Edit') : $t('Preview') }}
        </UiButton>
        <UiButton
          v-else
          @click="currentStep -= 1"
          class="block w-full mb-3"
          no-focus
        >
          {{ $t('Back') }}
        </UiButton>
        <UiButton
          v-if="currentStep === 3"
          @click="clickSubmit"
          :disabled="!isValid"
          :loading="clientLoading || queryLoading"
          class="block w-full"
          primary
        >
          {{ $t('Publish proposal') }}
        </UiButton>
        <UiButton
          v-else
          @click="nextStep"
          class="block w-full"
          :disabled="!stepIsValid"
          primary
        >
          {{ web3Account ? $t('Next') : $t('Connect wallet') }}
        </UiButton>
      </Block>
      <PluginCreateSidebar
        v-if="space?.plugins && (!from || sourceProposalLoaded)"
        :proposal="proposal"
        :space="space"
        :preview="preview"
        v-model="form.metadata.plugins"
      />
    </template>
  </Layout>
  <teleport to="#modal" v-if="space">
    <ModalSelectDate
      :value="form[selectedDate]"
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
