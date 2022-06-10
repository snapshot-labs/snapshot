<script setup lang="ts">
import { ref, computed, onMounted, inject, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from '@/composables/useI18n';
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
import { usePlugins } from '@/composables/usePlugins';
import { ExtendedSpace } from '@/helpers/interfaces';
import { useSpaceCreateForm } from '@/composables/useSpaceCreateForm';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const router = useRouter();
const route = useRoute();
const { t, setPageTitle } = useI18n();
const auth = getInstance();
const { domain } = useApp();
const { web3, web3Account } = useWeb3();
const { send, clientLoading } = useClient();
const { pluginIndex } = usePlugins();
const {
  form,
  userSelectedDateEnd,
  sourceProposalLoaded,
  sourceProposal,
  resetForm
} = useSpaceCreateForm();
const { modalAccountOpen } = useModal();
const { modalTermsOpen, termsAccepted, acceptTerms } = useTerms(props.space.id);

const notify: any = inject('notify');

const passValidation = ref([false, '']);
const validationLoading = ref(false);
const timeSeconds = ref(Number((Date.now() / 1e3).toFixed()));

const BODY_LIMIT_CHARACTERS = 14400;

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

const isValid = computed(() => {
  const isSafeSnapPluginValid = form.value.metadata.plugins?.safeSnap
    ? form.value.metadata.plugins.safeSnap.valid
    : true;

  return (
    !clientLoading.value &&
    form.value.body.length <= BODY_LIMIT_CHARACTERS &&
    dateEnd.value &&
    dateEnd.value > dateStart.value &&
    form.value.snapshot &&
    form.value.choices.length >= 1 &&
    !form.value.choices.some((a, i) => a.text === '' && i === 0) &&
    passValidation.value[0] &&
    isSafeSnapPluginValid &&
    !web3.value.authLoading
  );
});

const currentStep = computed(() => Number(route.params.step));

const stepIsValid = computed(() => {
  if (
    currentStep.value === 1 &&
    form.value.name &&
    form.value.body.length <= BODY_LIMIT_CHARACTERS &&
    passValidation.value[0] === true
  )
    return true;
  else if (
    currentStep.value === 2 &&
    dateEnd.value &&
    dateEnd.value > dateStart.value &&
    form.value.snapshot &&
    !form.value.choices.some((a, i) => a.text === '' && i === 0)
  )
    return true;
  else return false;
});

// Check if has plugins that can be confirgured on proposal creation
const needsPluginConfigs = computed(() =>
  Object.keys(props.space?.plugins ?? {}).some(
    pluginKey => pluginIndex[pluginKey]?.defaults?.proposal
  )
);

function getFormattedForm() {
  const clonedForm = clone(form.value);
  clonedForm.snapshot = Number(form.value.snapshot);
  clonedForm.choices = form.value.choices
    .map(choice => choice.text)
    .filter(choiceText => choiceText.length > 0);
  clonedForm.metadata.network = props.space.network;
  clonedForm.metadata.strategies = props.space.strategies;
  updateTime();
  clonedForm.start = dateStart.value;
  clonedForm.end = dateEnd.value;
  return clonedForm;
}

const { store } = useStore();
async function handleSubmit() {
  const formattedForm = getFormattedForm();
  const result = await send(props.space, 'proposal', formattedForm);
  console.log('Result', result);
  if (result.id) {
    store.space.proposals = [];
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
  const { network, strategies, plugins } = proposal;

  form.value = {
    name: proposal.title,
    body: proposal.body,
    discussion: proposal.discussion,
    choices: proposal.choices,
    start: proposal.start,
    end: proposal.end,
    snapshot: proposal.snapshot,
    type: proposal.type,
    metadata: { network, strategies, plugins }
  };

  form.value.choices = proposal.choices.map((text, key) => ({
    key,
    text
  }));
}

const { apolloQuery, queryLoading } = useApolloQuery();
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
    query: route.query.snapshot ? { snapshot: route.query.snapshot } : {}
  });
}

function previosStep() {
  router.push({
    params: { step: currentStep.value - 1 },
    query: route.query.snapshot ? { snapshot: route.query.snapshot } : {}
  });
}

function updateTime() {
  timeSeconds.value = Number((Date.now() / 1e3).toFixed());
}

// Check if account passes space validation
// (catch errors to show confiuration error message)
const executingValidationFailed = ref(false);
watch(
  () => web3Account.value,
  async () => {
    if (passValidation.value[0] === true) return;
    if (web3Account.value && auth.isAuthenticated.value) {
      validationLoading.value = true;
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

const preview = ref(false);

watch(preview, () => {
  window.scrollTo(0, 0);
});

onMounted(async () => {
  if (sourceProposal.value && !sourceProposalLoaded.value)
    await loadSourceProposal();
});

onMounted(() =>
  setPageTitle('page.title.space.create', { space: props.space.name })
);
</script>

<template>
  <TheLayout v-bind="$attrs">
    <template #content-left>
      <div v-if="currentStep === 1" class="mb-3 overflow-hidden px-4 md:px-0">
        <router-link
          :to="domain ? { path: '/' } : { name: 'spaceProposals' }"
          class="text-skin-text"
        >
          <BaseIcon name="back" size="22" class="!align-middle" />
          {{ $t('back') }}
        </router-link>
      </div>

      <SpaceCreateWarnings
        v-if="!validationLoading"
        :space="space"
        :executing-validation-failed="executingValidationFailed"
        :pass-validation="passValidation"
      />

      <!-- Step 1 -->
      <SpaceCreateContent
        v-if="currentStep === 1"
        :preview="preview"
        :body-limit="BODY_LIMIT_CHARACTERS"
      />

      <!-- Step 2 -->
      <SpaceCreateVoting
        v-else-if="currentStep === 2"
        :space="space"
        :date-start="dateStart"
        :date-end="dateEnd"
        @userSelectedDate="userSelectedDateEnd = true"
      />

      <!-- Step 3 (only when plugins) -->
      <div
        v-else-if="space?.plugins && (!sourceProposal || sourceProposalLoaded)"
        class="space-y-3"
      >
        <PluginCreate
          v-model="form.metadata.plugins"
          :proposal="proposal"
          :space="space"
        />
      </div>
    </template>
    <template #sidebar-right>
      <BaseBlock class="lg:fixed lg:w-[320px]">
        <BaseButton
          v-if="currentStep === 1"
          class="mb-2 block w-full"
          @click="preview = !preview"
        >
          {{ preview ? $t('create.edit') : $t('create.preview') }}
        </BaseButton>
        <BaseButton v-else class="mb-2 block w-full" @click="previosStep">
          {{ $t('back') }}
        </BaseButton>

        <BaseButton
          v-if="currentStep === 3 || (!needsPluginConfigs && currentStep === 2)"
          :disabled="!isValid"
          :loading="clientLoading || queryLoading"
          class="block w-full"
          primary
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
          :loading="validationLoading"
          :disabled="
            (!stepIsValid && !!web3Account) ||
            web3.authLoading ||
            executingValidationFailed ||
            validationLoading
          "
          primary
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
      @close="modalTermsOpen = false"
      @accept="acceptTerms(), handleSubmit()"
    />
  </teleport>
</template>
