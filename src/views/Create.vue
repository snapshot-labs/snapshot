<script setup>
import { ref, watch, watchEffect, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';
import draggable from 'vuedraggable';
import getProvider from '@snapshot-labs/snapshot.js/src/utils/provider';
import { getBlockNumber } from '@snapshot-labs/snapshot.js/src/utils/web3';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useModal } from '@/composables/useModal';
import { useTerms } from '@/composables/useTerms';
import { useQuery, useResult } from '@vue/apollo-composable';
import { PROPOSAL_QUERY } from '@/helpers/queries';
import validations from '@snapshot-labs/snapshot.js/src/validations';
import { clone } from '@/helpers/utils';
import { useDomain } from '@/composables/useDomain';

const route = useRoute();
const router = useRouter();
const store = useStore();
const auth = getInstance();
const { domain } = useDomain();

const key = route.params.key;
const from = route.params.from;

const loading = ref(false);
const choices = ref([]);
const blockNumber = ref(-1);
const bodyLimit = ref(1e4);
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

const web3Account = computed(() => store.state.web3.account);
const space = computed(() => store.state.app.spaces[key]);

// Check if account passes space validation
watchEffect(async () => {
  if (web3Account.value && auth.isAuthenticated.value) {
    const validationName = space.value.validation?.name ?? 'basic';
    const validationParams = space.value.validation?.params ?? {};
    const isValid = await validations[validationName](
      web3Account.value,
      clone(space.value),
      '',
      clone(validationParams)
    );
    passValidation.value = [isValid, validationName];
  }
});

const isValid = computed(() => {
  // const ts = (Date.now() / 1e3).toFixed();
  const isSafeSnapPluginValid = form.value.metadata.plugins?.safeSnap
    ? form.value.metadata.plugins.safeSnap.valid
    : true;

  return (
    !loading.value &&
    form.value.name &&
    form.value.body.length <= bodyLimit.value &&
    form.value.start &&
    // form.value.start >= ts &&
    form.value.end &&
    form.value.end > form.value.start &&
    form.value.snapshot &&
    form.value.snapshot > blockNumber.value / 2 &&
    choices.value.length >= 2 &&
    !choices.value.some(a => a.text === '') &&
    passValidation.value[0] &&
    isSafeSnapPluginValid &&
    !store.state.app.authLoading
  );
});

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
  loading.value = true;
  form.value.snapshot = parseInt(form.value.snapshot);
  form.value.choices = choices.value.map(choice => choice.text);
  form.value.metadata.network = space.value.network;
  form.value.metadata.strategies = space.value.strategies;
  try {
    const { ipfsHash } = await store.dispatch('send', {
      space: space.value.key,
      type: 'proposal',
      payload: form.value
    });
    router.push({
      name: 'proposal',
      params: {
        key: key,
        id: ipfsHash
      }
    });
  } catch (e) {
    console.error(e);
    loading.value = false;
  }
}

const { modalAccountOpen } = useModal();
const { modalTermsOpen, termsAccepted, acceptTerms } = useTerms(key);

function clickSubmit() {
  !web3Account.value
    ? (modalAccountOpen.value = true)
    : !termsAccepted.value && space.value.terms
    ? (modalTermsOpen.value = true)
    : handleSubmit();
}

onMounted(async () => {
  nameForm.value.focus();
  addChoice(2);
  blockNumber.value = await getBlockNumber(getProvider(space.value.network));
  form.value.snapshot = blockNumber.value;
});

if (from) {
  const { result } = useQuery(PROPOSAL_QUERY, { id: from });
  const proposal = useResult(result, null, data => data.proposal);

  watch(proposal, value => {
    form.value = {
      name: value.title,
      body: value.body,
      choices: value.choices,
      start: value.start,
      end: value.end,
      snapshot: value.snapshot,
      type: value.type
    };
    const { network, strategies, plugins } = value;
    form.value.metadata = { network, strategies, plugins };
    choices.value = value.choices.map((text, key) => ({
      key,
      text
    }));
  });
}

const proposal = computed(() => {
  return { ...form, choices };
});
</script>

<template>
  <Layout v-bind="$attrs">
    <template #content-left>
      <div class="px-4 px-md-0 mb-3">
        <router-link
          :to="{ name: domain ? 'home' : 'proposals' }"
          class="text-color"
        >
          <Icon name="back" size="22" class="v-align-middle" />
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
      <div class="px-4 px-md-0">
        <div class="d-flex flex-column mb-6">
          <input
            v-model="form.name"
            maxlength="128"
            class="h1 mb-2 input"
            :placeholder="$t('create.question')"
            ref="nameForm"
          />
          <TextareaAutosize
            v-model="form.body"
            class="input pt-1"
            :placeholder="$t('create.content')"
          />
          <div class="mb-6">
            <p v-if="form.body.length > bodyLimit" class="text-red mt-4">
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
            item-key="id"
          >
            <template #item="{ element, index }">
              <div class="d-flex mb-2">
                <UiButton class="d-flex width-full">
                  <span class="mr-4">{{ index + 1 }}</span>
                  <input
                    v-model="element.text"
                    class="input height-full flex-auto text-center"
                    maxlength="32"
                  />
                  <span @click="removeChoice(index)" class="ml-4">
                    <Icon name="close" size="12" />
                  </span>
                </UiButton>
              </div>
            </template>
          </draggable>
        </div>
        <UiButton @click="addChoice(1)" class="d-block width-full">
          {{ $t('create.addChoice') }}
        </UiButton>
      </Block>
      <PluginSafeSnapConfig
        v-if="space?.plugins?.safeSnap"
        :create="true"
        :proposal="proposal"
        :moduleAddress="space.plugins?.safeSnap?.address"
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
        @submit="modalProposalPluginsOpen = true"
      >
        <div class="mb-2">
          <UiButton class="width-full mb-2" @click="modalVotingTypeOpen = true">
            <span>{{ $t(`voting.${form.type}`) }}</span>
          </UiButton>
          <UiButton
            @click="(modalOpen = true), (selectedDate = 'start')"
            class="width-full mb-2"
          >
            <span v-if="!form.start">{{ $t('create.startDate') }}</span>
            <span v-else v-text="$d(form.start * 1e3, 'short', 'en-US')" />
          </UiButton>
          <UiButton
            @click="(modalOpen = true), (selectedDate = 'end')"
            class="width-full mb-2"
          >
            <span v-if="!form.end">{{ $t('create.endDate') }}</span>
            <span v-else v-text="$d(form.end * 1e3, 'short', 'en-US')" />
          </UiButton>
          <UiButton class="width-full mb-2">
            <input
              v-model="form.snapshot"
              type="number"
              class="input width-full text-center"
              :placeholder="$t('create.snapshotBlock')"
            />
          </UiButton>
        </div>
        <UiButton
          @click="clickSubmit"
          :disabled="!isValid"
          :loading="loading"
          class="d-block width-full button--submit"
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
