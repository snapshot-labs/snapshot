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
import { useDomain } from '@/composables/useDomain';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { useWeb3 } from '@/composables/useWeb3';
import { useClient } from '@/composables/useClient';
import { useStore } from '@/composables/useStore';
import { useIntl } from '@/composables/useIntl';
import { useCreateProposal } from '@/composables/useCreateProposal';
import { usePlugins } from '@/composables/usePlugins';
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const router = useRouter();
const route = useRoute();
const notify: any = inject('notify');
const { t, setPageTitle } = useI18n();
const { formatCompactNumber } = useIntl();
const auth = getInstance();
const { domain } = useDomain();
const { web3, web3Account } = useWeb3();
const { send, clientLoading } = useClient();
const { store } = useStore();
const { pluginIndex } = usePlugins();
const { modalAccountOpen } = useModal();
const { modalTermsOpen, termsAccepted, acceptTerms } = useTerms(props.space.id);

const {
  preview,
  form,
  bodyLimit,
  choices,
  userSelectedDateStart,
  userSelectedDateEnd,
  sourceProposal,
  sourceProposalLoaded,
  defaultForm,
  updateDateStart,
  updateDateEnd
} = useCreateProposal();

const passValidation = ref([true, 'basic']);
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
  // Make sure snapshot is a number
  form.value.snapshot = parseInt(form.value.snapshot);

  // Filter out empty choices
  form.value.choices = choices.value
    .map(choice => choice.text)
    .filter(choiceText => choiceText.length > 0);

  // Update the date start and date end according to settings
  updateDateStart(props.space);
  updateDateEnd(props.space);

  const result = await send(props.space, 'proposal', form.value);
  console.log('Result', result);
  if (result.id) {
    form.value = defaultForm;
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

watch(
  () => form.value.type,
  () => {
    if (form.value.type === 'basic') {
      choices.value = [
        { key: 1, text: t('voting.choices.for') },
        { key: 2, text: t('voting.choices.against') },
        { key: 3, text: t('voting.choices.abstain') }
      ];
    }
  }
);

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
      </BaseMessageBlock>

      <!-- Router view for proposal creation steps -->
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
