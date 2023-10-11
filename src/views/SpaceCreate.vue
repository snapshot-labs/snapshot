<script setup lang="ts">
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { PROPOSAL_QUERY } from '@/helpers/queries';
import { proposalValidation } from '@/helpers/snapshot';
import { ExtendedSpace } from '@/helpers/interfaces';
import Plugin from '@/plugins/safeSnap';

const safeSnapPlugin = new Plugin();

enum Step {
  CONTENT,
  VOTING,
  PLUGINS
}

const BODY_LIMIT_CHARACTERS = 20000;

const props = defineProps<{
  space: ExtendedSpace;
}>();

useMeta({
  title: {
    key: 'metaInfo.space.create.title',
    params: {
      space: props.space.name
    }
  },
  description: {
    key: 'metaInfo.space.create.description'
  }
});

const { notify } = useFlashNotification();
const router = useRouter();
const { t } = useI18n();
const auth = getInstance();
const { domain } = useApp();
const { web3, web3Account } = useWeb3();
const { send, isSending } = useClient();
const { pluginIndex } = usePlugins();
const { modalAccountOpen } = useModal();
const { modalTermsOpen, termsAccepted, acceptTerms } = useTerms(props.space.id);
const { isGnosisAndNotSpaceNetwork } = useGnosis(props.space);
const { isSnapshotLoading } = useSnapshot();
const { apolloQuery, queryLoading } = useApolloQuery();
const { containsShortUrl } = useShortUrls();

const {
  form,
  formDraft,
  userSelectedDateEnd,
  sourceProposalLoaded,
  sourceProposal,
  validationErrors,
  resetForm
} = useFormSpaceProposal();

const isValidAuthor = ref(false);
const validationLoading = ref(false);
const preview = ref(false);
const hasAuthorValidationFailed = ref(false);
const timeSeconds = ref(Number((Date.now() / 1e3).toFixed()));
const currentStep = ref(Step.CONTENT);

const proposal = computed(() =>
  Object.assign(form.value, { choices: form.value.choices })
);

type DateRange = {
  dateStart: number;
  dateEnd?: number;
};
function sanitizeDateRange({ dateStart, dateEnd }: DateRange): DateRange {
  const { delay = 0, period = 0 } = props.space?.voting ?? {};
  console.log('sanitizeDateRange', { dateStart, dateEnd, delay, period });
  const threeDays = 259200;
  const currentTimestamp = Math.floor(Date.now() / 1000);

  const sanitizedDateStart = delay
    ? timeSeconds.value + delay
    : Math.max(dateStart, currentTimestamp);

  if (typeof dateEnd === 'undefined') {
    return { dateStart: sanitizedDateStart };
  }

  if (period) {
    const sanitizedDateEnd = sanitizedDateStart + period;
    return { dateStart: sanitizedDateStart, dateEnd: sanitizedDateEnd };
  }

  if (userSelectedDateEnd.value || sourceProposalLoaded.value) {
    return { dateStart: sanitizedDateStart, dateEnd };
  }

  return {
    dateStart: sanitizedDateStart,
    dateEnd: sanitizedDateStart + threeDays
  };
}

const dateStart = computed(() => {
  const { dateStart } = sanitizeDateRange({ dateStart: form.value.start });
  return dateStart;
});

const dateEnd = computed(() => {
  const { dateEnd } = sanitizeDateRange({
    dateStart: form.value.start,
    dateEnd: form.value.end
  });
  return dateEnd;
});

const isFormValid = computed(() => {
  const isSafeSnapPluginValid = form.value.metadata.plugins?.safeSnap
    ? form.value.metadata.plugins.safeSnap.valid
    : true;

  return (
    !isSending.value &&
    form.value.body.length <= BODY_LIMIT_CHARACTERS &&
    dateEnd.value &&
    dateEnd.value > dateStart.value &&
    form.value.snapshot &&
    form.value.choices.length >= 1 &&
    !form.value.choices.some((a, i) => a.text === '' && i === 0) &&
    isValidAuthor.value &&
    isSafeSnapPluginValid &&
    !web3.value.authLoading
  );
});

const formContainsShortUrl = computed(() => {
  const { body, name, discussion } = form.value;

  return (
    containsShortUrl(body) ||
    containsShortUrl(name) ||
    containsShortUrl(discussion)
  );
});

const stepIsValid = computed(() => {
  if (
    currentStep.value === Step.CONTENT &&
    form.value.name &&
    form.value.body.length <= BODY_LIMIT_CHARACTERS &&
    isValidAuthor.value &&
    !validationErrors.value.name &&
    !validationErrors.value.body &&
    !validationErrors.value.discussion &&
    !formContainsShortUrl.value
  )
    return true;
  else if (
    currentStep.value === Step.VOTING &&
    dateEnd.value &&
    dateEnd.value > dateStart.value &&
    form.value.snapshot &&
    !form.value.choices.some((a, i) => a.text === '' && i === 0)
  )
    return true;
  else return false;
});

const isMember = computed(() => {
  function findAccount(object: string[], account: string) {
    return object.map(a => a.toLowerCase()).includes(account.toLowerCase());
  }
  return (
    findAccount(props.space.members, web3Account.value) ||
    findAccount(props.space.admins, web3Account.value) ||
    findAccount(props.space.moderators, web3Account.value) ||
    false
  );
});

const needsPluginConfigs = computed(() =>
  Object.keys(props.space?.plugins ?? {}).some(
    pluginKey => pluginIndex[pluginKey]?.defaults?.proposal
  )
);

const validationName = computed(() => props.space.validation?.name ?? 'basic');

function getFormattedForm() {
  const clonedForm = clone(form.value);
  clonedForm.snapshot = Number(form.value.snapshot);
  clonedForm.choices = form.value.choices
    .map(choice => choice.text)
    .filter(choiceText => choiceText.length > 0);
  updateTime();
  const { dateStart: sanitizedDateStart, dateEnd: sanitizedDateEnd } =
    sanitizeDateRange({
      dateStart: dateStart.value,
      dateEnd: dateEnd.value
    });
  clonedForm.start = sanitizedDateStart;
  clonedForm.end = sanitizedDateEnd;
  return clonedForm;
}

const { resetSpaceProposals } = useProposals();
async function handleSubmit() {
  const formattedForm = getFormattedForm();
  const result = await send(props.space, 'proposal', formattedForm);
  if (result.id) {
    resetSpaceProposals();
    if (!result.ipfs) notify(['green', t('notify.waitingForOtherSigners')]);
    else notify(['green', t('notify.proposalCreated')]);
    resetForm();
    router.push({
      name: 'spaceProposal',
      params: {
        key: props.space.id,
        id: result.id
      }
    });
  }
}

function setSourceProposal(proposal) {
  const { plugins } = proposal;

  form.value = {
    name: proposal.title,
    body: proposal.body,
    discussion: proposal.discussion,
    choices: proposal.choices,
    start: proposal.start,
    end: proposal.end,
    snapshot: proposal.snapshot,
    type: proposal.type,
    metadata: { plugins }
  };

  form.value.choices = proposal.choices.map((text, key) => ({
    key,
    text
  }));
}

async function loadSourceProposal() {
  const proposal = await apolloQuery(
    {
      query: PROPOSAL_QUERY,
      variables: {
        id: sourceProposal.value
      }
    },
    'proposal'
  );

  setSourceProposal(proposal);
  sourceProposalLoaded.value = true;
}

function nextStep() {
  if (formContainsShortUrl.value) return;
  // skip transaction page if user has osnap, but chosen not to use it for this vote
  if (shouldSkipTransactions()) return;
  currentStep.value++;
}

function previousStep() {
  currentStep.value--;
}

function updateTime() {
  timeSeconds.value = Number((Date.now() / 1e3).toFixed());
}

async function validateAuthor() {
  isValidAuthor.value = false;
  if (web3Account.value && auth.isAuthenticated.value) {
    if (isMember.value) {
      isValidAuthor.value = true;
      return;
    }

    if (props.space.filters.onlyMembers) {
      isValidAuthor.value = false;
      return;
    }

    if (
      props.space.validation.name === 'any' ||
      (props.space.validation.name === 'basic' &&
        !props.space.filters.minScore &&
        !props.space.validation.params?.minScore)
    ) {
      isValidAuthor.value = true;
      return;
    }

    try {
      validationLoading.value = true;
      const validationRes = await proposalValidation(
        props.space,
        web3Account.value
      );

      isValidAuthor.value = validationRes;
    } catch (e) {
      hasAuthorValidationFailed.value = true;
      console.warn(e);
    } finally {
      validationLoading.value = false;
    }
  }
}

watch(
  () => web3Account.value,
  () => {
    validateAuthor();
  },
  { immediate: true }
);

// We need to know if the space is using osnap, this will change what types of voting we can do
// We also need to know if the user plans to use osnap
const osnap = ref<{
  enabled: boolean;
  selection: boolean;
}>({
  selection: false,
  enabled: false
});

// Skip transaction page if osnap is enabled, its not selected to be used, and we are on the voting page
function shouldSkipTransactions() {
  return (
    osnap.value.enabled &&
    !osnap.value.selection &&
    currentStep.value === Step.VOTING
  );
}

function handleOsnapToggle() {
  osnap.value.selection = !osnap.value.selection;
}

onMounted(async () => {
  const network = props?.space?.plugins?.safeSnap?.safes?.[0]?.network;
  const umaAddress = props?.space?.plugins?.safeSnap?.safes?.[0]?.umaAddress;
  if (network && umaAddress) {
    // this is how we check if osnap is enabled and valid.
    osnap.value.enabled =
      (await safeSnapPlugin.validateUmaModule(network, umaAddress)) === 'uma';
  }
  if (sourceProposal.value && !sourceProposalLoaded.value)
    await loadSourceProposal();

  if (!sourceProposal.value) {
    form.value.name = formDraft.value.name;
    form.value.body = formDraft.value.body;
  }

  if (
    !!props.space?.template &&
    !sourceProposal.value &&
    !formDraft.value.isBodySet
  ) {
    form.value.body = props.space.template;
  }
});
</script>

<template>
  <TheLayout v-bind="$attrs">
    <template #content-left>
      <div
        v-if="currentStep === Step.CONTENT"
        class="mb-3 overflow-hidden px-4 md:px-0"
      >
        <ButtonBack
          @click="
            router.push(domain ? { path: '/' } : { name: 'spaceProposals' })
          "
        />
      </div>
      <SpaceCreateWarnings
        v-if="!validationLoading"
        :space="space"
        :validation-failed="hasAuthorValidationFailed"
        :is-valid-author="isValidAuthor"
        :validation-name="validationName"
        :contains-short-url="formContainsShortUrl"
        data-testid="create-proposal-connect-wallet-warning"
      />

      <!-- Step 1 -->
      <SpaceCreateContent
        v-if="currentStep === Step.CONTENT"
        :space="space"
        :preview="preview"
        :body-limit="BODY_LIMIT_CHARACTERS"
      />

      <!-- Step 2 -->
      <SpaceCreateVoting
        v-else-if="currentStep === Step.VOTING"
        :space="space"
        :date-start="dateStart"
        :date-end="dateEnd"
        :osnap="osnap"
        @osnapToggle="handleOsnapToggle"
      />

      <!-- Step 3 (only when plugins) -->
      <SpaceCreatePlugins
        v-else
        v-model="form.metadata.plugins"
        :proposal="proposal"
        :space="space"
      />
    </template>
    <template #sidebar-right>
      <BaseBlock class="lg:fixed lg:w-[320px]">
        <BaseButton
          v-if="currentStep === Step.CONTENT"
          class="mb-2 block w-full"
          @click="preview = !preview"
        >
          {{ preview ? $t('create.edit') : $t('create.preview') }}
        </BaseButton>
        <BaseButton v-else class="mb-2 block w-full" @click="previousStep">
          {{ $t('back') }}
        </BaseButton>
        <BaseButton
          v-if="
            currentStep === Step.PLUGINS ||
            (!needsPluginConfigs && currentStep === Step.VOTING) ||
            shouldSkipTransactions()
          "
          :disabled="!isFormValid"
          :loading="isSending || queryLoading || isSnapshotLoading"
          class="block w-full"
          primary
          data-testid="create-proposal-publish-button"
          @click="
            !termsAccepted && space.terms
              ? (modalTermsOpen = true)
              : handleSubmit()
          "
        >
          {{ $t('create.publish') }}
        </BaseButton>
        <BaseButton
          v-else
          class="block w-full"
          :loading="validationLoading || isSnapshotLoading"
          :disabled="
            (!stepIsValid && !!web3Account) ||
            web3.authLoading ||
            hasAuthorValidationFailed ||
            validationLoading ||
            isGnosisAndNotSpaceNetwork
          "
          primary
          :data-testid="
            web3Account
              ? 'create-proposal-continue-button'
              : 'create-proposal-connect-wallet-button'
          "
          @click="web3Account ? nextStep() : (modalAccountOpen = true)"
        >
          {{ web3Account ? $t('create.continue') : $t('connectWallet') }}
        </BaseButton>
      </BaseBlock>
    </template>
  </TheLayout>
  <teleport to="#modal">
    <ModalTerms
      :open="modalTermsOpen"
      :space="space"
      :action="$t('modalTerms.actionCreate')"
      @close="modalTermsOpen = false"
      @accept="acceptTerms(), handleSubmit()"
    />
  </teleport>
</template>
