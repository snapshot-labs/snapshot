<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { PROPOSAL_QUERY } from '@/helpers/queries';
import { proposalValidation } from '@/helpers/snapshot';
import { ExtendedSpace } from '@/helpers/interfaces';

import {
  useFlashNotification,
  useFormSpaceProposal,
  useProposals,
  usePlugins,
  useI18n,
  useModal,
  useTerms,
  useApp,
  useApolloQuery,
  useWeb3,
  useClient,
  useGnosis,
  useSnapshot,
  useMeta
} from '@/composables';

enum Step {
  CONTENT,
  VOTING,
  PLUGINS
}

const BODY_LIMIT_CHARACTERS = 14400;

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
const route = useRoute();
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

const {
  form,
  formDraft,
  userSelectedDateEnd,
  sourceProposalLoaded,
  sourceProposal,
  resetForm,
  getValidation
} = useFormSpaceProposal();

const isValidAuthor = ref(false);
const validationLoading = ref(false);
const preview = ref(false);
const hasAuthorValidationFailed = ref(false);
const timeSeconds = ref(Number((Date.now() / 1e3).toFixed()));

const proposal = computed(() =>
  Object.assign(form.value, { choices: form.value.choices })
);

const dateStart = computed(() => {
  return props.space?.voting?.delay
    ? timeSeconds.value + props.space.voting.delay
    : form.value.start;
});

const dateEnd = computed(() => {
  const threeDays = 259200;
  return props.space?.voting?.period
    ? dateStart.value + props.space.voting.period
    : userSelectedDateEnd.value || sourceProposalLoaded.value
    ? form.value.end
    : dateStart.value + threeDays;
});

const isSafeFormValid = computed(() => {
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

const currentStep = computed(() => Number(route.params.step));

const stepIsValid = computed(() => {
  if (
    currentStep.value === Step.CONTENT &&
    form.value.name &&
    form.value.body.length <= BODY_LIMIT_CHARACTERS &&
    isValidAuthor.value &&
    !getValidation('name').message &&
    !getValidation('discussion').message
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
  return (
    props.space.members?.includes(web3Account.value) ||
    props.space.admins?.includes(web3Account.value) ||
    props.space.moderators?.includes(web3Account.value) ||
    false
  );
});

// Check if has plugins that can be confirgured on proposal creation
const needsPluginConfigs = computed(() =>
  Object.keys(props.space?.plugins ?? {}).some(
    pluginKey => pluginIndex[pluginKey]?.defaults?.proposal
  )
);

const queries = computed(() => {
  let q: { snapshot?: string; app?: string } = {};
  if (route.query.snapshot) q.snapshot = route.query.snapshot as string;
  if (route.query.app) q.app = route.query.app as string;
  return q;
});

const validationName = computed(() => props.space.validation?.name ?? 'basic');

function getFormattedForm() {
  const clonedForm = clone(form.value);
  clonedForm.snapshot = Number(form.value.snapshot);
  clonedForm.choices = form.value.choices
    .map(choice => choice.text)
    .filter(choiceText => choiceText.length > 0);
  updateTime();
  clonedForm.start = dateStart.value;
  clonedForm.end = dateEnd.value;
  return clonedForm;
}

const { resetSpaceProposals } = useProposals();
async function handleSubmit() {
  const formattedForm = getFormattedForm();
  const result = await send(props.space, 'proposal', formattedForm);
  console.log('Result', result);
  if (result.id) {
    resetSpaceProposals();
    notify(['green', t('notify.proposalCreated')]);
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
  router.push({
    params: { step: currentStep.value + 1 },
    query: queries.value
  });
}

function previousStep() {
  router.push({
    params: { step: currentStep.value - 1 },
    query: queries.value
  });
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
      (props.space.validation.name === 'basic' && !props.space.filters.minScore)
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
      console.log('Pass validation?', validationRes, validationName.value);
    } catch (e) {
      hasAuthorValidationFailed.value = true;
      console.log(e);
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

watch(preview, () => {
  window.scrollTo(0, 0);
});

onMounted(async () => {
  if (sourceProposal.value && !sourceProposalLoaded.value)
    await loadSourceProposal();

  if (!sourceProposal.value) {
    form.value.name = formDraft.value.name;
    form.value.body = formDraft.value.body;
    form.value.choices = formDraft.value.choices;
  }

  if (!!props.space?.template && !sourceProposal.value && !form.value.body) {
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
        <router-link :to="domain ? { path: '/' } : { name: 'spaceProposals' }">
          <ButtonBack />
        </router-link>
      </div>

      <SpaceCreateWarnings
        v-if="!validationLoading"
        :space="space"
        :validation-failed="hasAuthorValidationFailed"
        :is-valid-author="isValidAuthor"
        :validation-name="validationName"
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
      />

      <!-- Step 3 (only when plugins) -->
      <SpaceCreatePlugins
        v-else-if="space?.plugins && (!sourceProposal || sourceProposalLoaded)"
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
            (!needsPluginConfigs && currentStep === Step.VOTING)
          "
          :disabled="!isSafeFormValid"
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
