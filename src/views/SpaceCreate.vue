<script setup>
import { ref, watchEffect, computed, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import draggable from 'vuedraggable';
import { useI18n } from 'vue-i18n';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { getBlockNumber } from '@snapshot-labs/snapshot.js/src/utils/web3';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useModal } from '@/composables/useModal';
import { useTerms } from '@/composables/useTerms';
import { PROPOSAL_QUERY } from '@/helpers/queries';
import validations from '@snapshot-labs/snapshot.js/src/validations';
import { clone } from '@/helpers/utils';
import { useDomain } from '@/composables/useDomain';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { useWeb3 } from '@/composables/useWeb3';
import { useClient } from '@/composables/useClient';
import { useApp } from '@/composables/useApp';
import { useExtendedSpaces } from '@/composables/useExtendedSpaces';

const props = defineProps({
  spaceId: String,
  space: Object,
  from: String
});

const router = useRouter();
const { t } = useI18n();
const auth = getInstance();
const { domain } = useDomain();
const { web3 } = useWeb3();
const { getExplore } = useApp();
const { spaceLoading } = useExtendedSpaces();
const { send, clientLoading } = useClient();
const notify = inject('notify');

const choices = ref([]);
const blockNumber = ref(-1);
const bodyLimit = ref(4800);
const form = ref({
  name: '',
  body: '',
  choices: [],
  start: 0,
  end: 0,
  snapshot: '',
  metadata: { plugins: {} },
  type: 'single-choice'
});
const modalOpen = ref(false);
const modalProposalPluginsOpen = ref(false);
const modalVotingTypeOpen = ref(false);
const selectedDate = ref('');
const counter = ref(0);
const nameForm = ref(null);
const passValidation = ref([true]);
const loadingSnapshot = ref(true);

const web3Account = computed(() => web3.value.account);
const proposal = computed(() =>
  Object.assign(form.value, { choices: choices.value })
);

// Check if account passes space validation
watchEffect(async () => {
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
  }
});

const dateStart = computed(() => {
  return props.space.voting?.delay
    ? parseInt((Date.now() / 1e3).toFixed()) + props.space.voting.delay
    : form.value.start;
});

const dateEnd = computed(() => {
  return props.space.voting?.period && dateStart.value
    ? dateStart.value + props.space.voting.period
    : form.value.end;
});

const isValid = computed(() => {
  // const ts = (Date.now() / 1e3).toFixed();
  const isSafeSnapPluginValid = form.value.metadata.plugins?.safeSnap
    ? form.value.metadata.plugins.safeSnap.valid
    : true;

  return (
    !clientLoading.value &&
    form.value.name &&
    form.value.body.length <= bodyLimit.value &&
    dateStart.value &&
    // form.value.start >= ts &&
    dateEnd.value &&
    dateEnd.value > dateStart.value &&
    form.value.snapshot &&
    form.value.snapshot > blockNumber.value / 2 &&
    choices.value.length >= 2 &&
    !choices.value.some(a => a.text === '') &&
    passValidation.value[0] &&
    isSafeSnapPluginValid &&
    !web3.value.authLoading
  );
});

const disableChoiceEdit = computed(() => form.value.type === 'basic');

function addChoice(num) {
  for (let i = 1; i <= num; i++) {
    counter.value++;
    choices.value.push({ key: counter.value, text: '' });
  }
}

function removeChoice(i) {
  choices.value.splice(i, 1);
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
    getExplore();
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
}

onMounted(async () => {
  nameForm.value.focus();
  addChoice(2);

  if (props.from) loadProposal();
});

watchEffect(async () => {
  loadingSnapshot.value = true;
  if (props.space.network) {
    blockNumber.value = await getBlockNumber(getProvider(props.space.network));
    form.value.snapshot = blockNumber.value;
    loadingSnapshot.value = false;
  }
  if (props.space.voting?.type) form.value.type = props.space.voting.type;
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
</script>

<template>
  <Layout v-bind="$attrs">
    <template #content-left>
      <div class="px-4 md:px-0 mb-3">
        <router-link
          :to="domain ? { path: '/' } : { name: 'spaceProposals' }"
          class="text-color"
        >
          <Icon name="back" size="22" class="!align-middle" />
          {{ space.name }}
        </router-link>
      </div>
      <Block v-if="passValidation[0] === false">
        <Icon name="warning" class="mr-1" />
        <span v-if="passValidation[1] === 'basic'">
          {{
            space.validation?.params.minScore || space?.filters.minScore
              ? $tc('create.validationWarning.basic.minScore', [
                  _n(space.filters.minScore),
                  space.symbol
                ])
              : $t('create.validationWarning.basic.member')
          }}
        </span>
        <span v-else>
          {{
            $t(
              space.validation.params.rules ||
                'create.validationWarning.customValidation'
            )
          }}
        </span>
      </Block>
      <div class="px-4 md:px-0">
        <div class="flex flex-col mb-6">
          <input
            v-model="form.name"
            maxlength="128"
            class="text-2xl font-bold mb-2 input"
            :placeholder="$t('create.question')"
            ref="nameForm"
          />
          <TextareaAutosize
            v-model="form.body"
            class="input pt-1"
            :placeholder="$t('create.content')"
          />
          <div class="mb-6">
            <p v-if="form.body.length > bodyLimit" class="!text-red mt-4">
              -{{ _n(-(bodyLimit - form.body.length)) }}
            </p>
          </div>
          <div v-if="form.body">
            <h4 class="mb-4">{{ $t('create.preview') }}</h4>
            <UiMarkdown :body="form.body" />
          </div>
        </div>
      </div>
      <Block :title="$t('create.choices')">
        <div v-if="choices.length > 0" class="overflow-hidden mb-2">
          <draggable
            v-model="choices"
            :component-data="{ name: 'list' }"
            :disabled="disableChoiceEdit"
            item-key="id"
          >
            <template #item="{ element, index }">
              <UiInput
                v-model="element.text"
                maxlength="32"
                additionalInputClass="text-center"
                :disabled="disableChoiceEdit"
              >
                <template v-slot:label>
                  <span v-if="!disableChoiceEdit" class="text-skin-link">
                    {{ index + 1 }}
                  </span>
                </template>
                <template v-slot:info>
                  <span v-if="!disableChoiceEdit" @click="removeChoice(index)">
                    <Icon name="close" size="12" />
                  </span>
                </template>
              </UiInput>
            </template>
          </draggable>
        </div>
        <UiButton
          v-if="!disableChoiceEdit"
          @click="addChoice(1)"
          class="block w-full"
        >
          {{ $t('create.addChoice') }}
        </UiButton>
      </Block>
      <PluginSafeSnapConfig
        v-if="space?.plugins?.safeSnap"
        :proposal="proposal"
        :config="space.plugins?.safeSnap"
        :network="space.network"
        v-model="form.metadata.plugins.safeSnap"
      />
    </template>
    <template #sidebar-right>
      <Block
        :title="$t('actions')"
        :icon="
          space.plugins && Object.keys(space.plugins).length > 0
            ? 'stars'
            : undefined
        "
        :loading="spaceLoading"
        @submit="modalProposalPluginsOpen = true"
      >
        <div class="mb-2">
          <UiButton
            class="w-full mb-2"
            :disabled="props.space.voting?.type"
            @click="modalVotingTypeOpen = true"
          >
            <span>{{
              $t(`voting.${props.space.voting?.type ?? form.type}`)
            }}</span>
          </UiButton>
          <UiButton
            @click="(modalOpen = true), (selectedDate = 'start')"
            :disabled="props.space.voting?.delay"
            class="w-full mb-2"
          >
            <span v-if="!dateStart">{{ $t('create.startDate') }}</span>
            <span v-else v-text="$d(dateStart * 1e3, 'short', 'en-US')" />
          </UiButton>
          <UiButton
            @click="(modalOpen = true), (selectedDate = 'end')"
            :disabled="props.space.voting?.period"
            class="w-full mb-2"
          >
            <span v-if="!dateEnd">{{ $t('create.endDate') }}</span>
            <span v-else v-text="$d(dateEnd * 1e3, 'short', 'en-US')" />
          </UiButton>
          <UiButton :loading="loadingSnapshot" class="w-full mb-2">
            <input
              v-model="form.snapshot"
              type="number"
              class="input w-full text-center"
              :placeholder="$t('create.snapshotBlock')"
            />
          </UiButton>
        </div>
        <UiButton
          @click="clickSubmit"
          :disabled="!isValid"
          :loading="clientLoading || queryLoading"
          class="block w-full"
          primary
        >
          {{ $t('create.publish') }}
        </UiButton>
      </Block>
    </template>
  </Layout>
  <teleport to="#modal">
    <ModalSelectDate
      :value="form[selectedDate]"
      :selectedDate="selectedDate"
      :open="modalOpen"
      @close="modalOpen = false"
      @input="setDate"
    />
    <ModalProposalPlugins
      :space="space"
      :proposal="proposal"
      v-model="form.metadata.plugins"
      :open="modalProposalPluginsOpen"
      @close="modalProposalPluginsOpen = false"
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
      v-model="form.type"
    />
  </teleport>
</template>

<style>
.list-leave-active,
.list-enter-active {
  transition: all 0.3s;
}
.list-move {
  transition: transform 0.3s;
}
.list-enter,
.list-leave-to {
  opacity: 0;
}
</style>
