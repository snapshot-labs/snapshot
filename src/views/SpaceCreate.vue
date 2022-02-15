<script setup>
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
import { useDomain } from '@/composables/useDomain';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { useWeb3 } from '@/composables/useWeb3';
import { useClient } from '@/composables/useClient';
import { useStore } from '@/composables/useStore';
import { useIntl } from '@/composables/useIntl';
import { useSpaceCreateForm } from '@/composables/useSpaceCreateForm';

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
const notify = inject('notify');
const {
  preview,
  form,
  bodyLimit,
  choices,
  userSelectedDateStart,
  userSelectedDateEnd,
  sourceProposal,
  sourceProposalLoaded,
  updateDateStart,
  updateDateEnd
} = useSpaceCreateForm();

const passValidation = ref([true]);
const validationLoading = ref(false);

// Check if account passes space validation
watch(
  () => web3Account.value,
  async () => {
    validationLoading.value = true;
    if (web3Account.value && auth.isAuthenticated.value) {
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

const isValid = computed(() => {
  const isSafeSnapPluginValid = form.value.metadata.plugins?.safeSnap
    ? form.value.metadata.plugins.safeSnap.valid
    : true;

  return (
    !clientLoading.value &&
    form.value.body.length <= bodyLimit &&
    form.value.end &&
    form.value.end > form.value.start &&
    form.value.snapshot &&
    choices.value.length >= 1 &&
    !choices.value.some((a, i) => a.text === '' && i === 0) &&
    passValidation.value[0] &&
    isSafeSnapPluginValid &&
    !web3.value.authLoading
  );
});

async function handleSubmit() {
  form.value.snapshot = parseInt(form.value.snapshot);
  form.value.choices = choices.value
    .map(choice => choice.text)
    .filter(choiceText => choiceText.length > 0);
  updateDateStart(props.space);
  updateDateEnd(props.space);

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

  userSelectedDateStart.value = true;
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

onMounted(async () => {
  if (sourceProposal.value) loadProposal();
});

onMounted(() =>
  setPageTitle('page.title.space.create', { space: props.space.name })
);

onMounted(async () => {
  form.value.snapshot = await getBlockNumber(getProvider(props.space.network));

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

const stepIsValid = computed(() => {
  if (
    route.name === 'spaceCreateStepOne' &&
    form.value.name &&
    form.value.body.length <= bodyLimit &&
    passValidation.value[0] === true
  )
    return true;
  else if (
    route.name === 'spaceCreateStepTwo' &&
    form.value.end &&
    form.value.end > form.value.start &&
    form.value.snapshot &&
    !choices.value.some((a, i) => a.text === '' && i === 0)
  )
    return true;
  else return false;
});

watch(preview, () => {
  window.scrollTo(0, 0);
});

import { usePlugins } from '@/composables/usePlugins';
const { pluginIndex } = usePlugins();

// Check if has plugins that can be confirgured on proposal creation
const needsPluginConfigs = computed(() =>
  Object.keys(props.space?.plugins ?? {}).some(
    pluginKey => pluginIndex[pluginKey]?.defaults?.proposal
  )
);

function nextStep() {
  if (route.name === 'spaceCreateStepOne' && stepIsValid.value)
    router.push({ name: 'spaceCreateStepTwo' });
  else if (route.name === 'spaceCreateStepTwo' && stepIsValid.value)
    router.push({ name: 'spaceCreateStepThree' });
}

function prevStep() {
  if (route.name === 'spaceCreateStepTwo')
    router.push({ name: 'spaceCreateStepOne' });
  else if (route.name === 'spaceCreateStepThree')
    router.push({ name: 'spaceCreateStepTwo' });
}
</script>

<template>
  <Layout v-bind="$attrs">
    <template #content-left>
      <div
        v-if="$route.name === 'spaceCreateStepOne'"
        class="px-4 md:px-0 overflow-hidden mb-3"
      >
        <router-link
          :to="domain ? { path: '/' } : { name: 'spaceProposals' }"
          class="text-color"
        >
          <Icon name="back" size="22" class="!align-middle" />
          {{ $t('back') }}
        </router-link>
      </div>

      <!-- Shows when no wallet is connected and the space has any sort 
      of validation set -->
      <BaseWarningBlock
        v-if="
          !web3Account &&
          !web3.authLoading &&
          (space?.validation?.params.minScore ||
            space?.filters.minScore ||
            space?.filters.onlyMembers)
        "
        :routeObject="{ name: 'spaceAbout', params: { key: space.id } }"
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
      </BaseWarningBlock>

      <!-- Shows when wallet is connected and doesn't pass validaion -->
      <BaseWarningBlock
        v-else-if="passValidation[0] === false"
        :routeObject="{ name: 'spaceAbout', params: { key: space.id } }"
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
      </BaseWarningBlock>
      <router-view :space="space" />
    </template>
    <template #sidebar-right>
      <Block class="lg:fixed lg:w-[320px]">
        <UiButton
          v-if="$route.name === 'spaceCreateStepOne'"
          @click="preview = !preview"
          :loading="clientLoading || queryLoading"
          class="block w-full mb-3"
          no-focus
        >
          {{ preview ? $t('create.edit') : $t('create.preview') }}
        </UiButton>
        <UiButton v-else @click="prevStep" class="block w-full mb-3" no-focus>
          {{ $t('back') }}
        </UiButton>

        <UiButton
          v-if="
            $route.name === 'spaceCreateStepThree' ||
            (!needsPluginConfigs && $route.name === 'spaceCreateStepTwo')
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
          @click="web3Account ? nextStep() : (modalAccountOpen = true)"
          class="block w-full"
          :disabled="(!stepIsValid && !!web3Account) || web3.authLoading"
          primary
        >
          {{ web3Account ? $t('create.continue') : $t('connectWallet') }}
        </UiButton>
      </Block>
    </template>
  </Layout>

  <teleport to="#modal">
    <ModalTerms
      :open="modalTermsOpen"
      :space="space"
      @close="modalTermsOpen = false"
      @accept="acceptTerms(), handleSubmit()"
    />
  </teleport>
</template>
