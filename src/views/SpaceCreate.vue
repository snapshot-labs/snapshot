<script setup lang="ts">
import { ref, watchEffect, computed, onMounted, inject, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
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
const { store } = useStore();
const { pluginIndex } = usePlugins();
const { form, resetForm } = useSpaceCreateForm();

const notify: any = inject('notify');

const blockNumber = ref(-1);
const bodyLimit = ref(14400);
const passValidation = ref([false, '']);
const validationLoading = ref(false);
const loadingSnapshot = ref(true);
const userSelectedDateEnd = ref(false);

const proposal = computed(() =>
  Object.assign(form.value, { choices: form.value.choices })
);

const sourceProposal = computed(() => route.params.sourceProposal);

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
    form.value.choices.length >= 1 &&
    !form.value.choices.some((a, i) => a.text === '' && i === 0) &&
    passValidation.value[0] &&
    isSafeSnapPluginValid &&
    !web3.value.authLoading
  );
});

async function handleSubmit() {
  const clonedForm = clone(form.value);
  clonedForm.snapshot = Number(form.value.snapshot);
  clonedForm.choices = form.value.choices
    .map(choice => choice.text)
    .filter(choiceText => choiceText.length > 0);
  clonedForm.metadata.network = props.space.network;
  clonedForm.metadata.strategies = props.space.strategies;
  clonedForm.start = props.space.voting?.delay
    ? parseInt((Date.now() / 1e3).toFixed()) + props.space.voting.delay
    : dateStart.value;
  clonedForm.end = props.space.voting?.period
    ? form.value.start + props.space.voting.period
    : dateEnd.value;
  const result = await send(props.space, 'proposal', clonedForm);
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

  sourceProposalLoaded.value = true;
}

onMounted(async () => {
  if (sourceProposal.value) await loadProposal();
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

const currentStep = computed(() => Number(route.params.step || 1));

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
    !form.value.choices.some((a, i) => a.text === '' && i === 0)
  )
    return true;
  else return false;
});

const preview = ref(false);

watch(preview, () => {
  window.scrollTo(0, 0);
});

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

// Check if account passes space validation
// (catch errors to show confiuration error message)
const executingValidationFailed = ref(false);
watch(
  () => web3Account.value,
  async () => {
    if (passValidation.value[0] === true) return;
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

      <SpaceCreateWarnings
        v-if="!validationLoading"
        :space="space"
        :executingValidationFailed="executingValidationFailed"
        :passValidation="passValidation"
      />

      <!-- Step 1 -->
      <SpaceCreateContent
        v-if="currentStep === 1"
        :preview="preview"
        :bodyLimit="bodyLimit"
      />

      <!-- Step 2 -->
      <SpaceCreateVoting
        v-else-if="currentStep === 2"
        :space="space"
        :dateStart="dateStart"
        :dateEnd="dateEnd"
        @userSelectedDate="userSelectedDateEnd = true"
      />

      <!-- Step 3 (only when plugins) -->
      <div
        v-else-if="space?.plugins && (!sourceProposal || sourceProposalLoaded)"
        class="space-y-3"
      >
        <PluginCreate
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
        <BaseButton v-else @click="$router.go(-1)" class="block w-full mb-2">
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
          @click="
            web3Account
              ? $router.push({ params: { step: currentStep + 1 } })
              : (modalAccountOpen = true)
          "
          class="block w-full"
          :loading="validationLoading"
          :disabled="
            (!stepIsValid && !!web3Account) ||
            web3.authLoading ||
            executingValidationFailed ||
            validationLoading
          "
          primary
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
