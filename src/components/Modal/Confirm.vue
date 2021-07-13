<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import client from '@/helpers/clientEIP712';
import { getChoiceString } from '@/helpers/utils';

export default {
  props: {
    open: Boolean,
    space: Object,
    proposal: Object,
    selectedChoices: [Object, Number],
    snapshot: String,
    totalScore: Number,
    scores: Object,
    strategies: Object
  },
  emits: ['reload', 'close'],
  setup(props, { emit }) {
    const auth = getInstance();
    const store = useStore();
    const { t } = useI18n();

    const loading = ref(false);

    const symbols = computed(() =>
      props.strategies.map(strategy => strategy.params.symbol)
    );
    const web3Account = computed(() => store.state.web3.account);

    async function handleSubmit() {
      loading.value = true;
      try {
        const result = await client.vote(auth.web3, web3Account.value, {
          from: web3Account.value,
          space: props.space.key,
          timestamp: ~~(Date.now() / 1e3),
          proposal: props.proposal.id,
          type: props.proposal.type,
          choice: props.selectedChoices,
          metadata: JSON.stringify({})
        });
        console.log('Result', result);
        store.dispatch('notify', t('notify.yourIsIn', ['vote']));
      } catch (e) {
        if (!e.code || e.code !== 4001) {
          console.log('Oops!', e);
          const errorMessage = e?.error_description
            ? `Oops, ${e.error_description}`
            : t('notify.somethingWentWrong');
          store.dispatch('notify', ['red', errorMessage]);
        }
      }
      emit('reload');
      emit('close');
      loading.value = false;
    }

    return { loading, symbols, handleSubmit, format: getChoiceString };
  }
};
</script>

<template>
  <UiModal :open="open" @close="$emit('close')" class="d-flex">
    <template v-slot:header>
      <h3>{{ $t('confirmVote') }}</h3>
    </template>
    <div class="d-flex flex-column flex-auto">
      <h4 class="m-4 mb-0 text-center">
        {{
          $tc('sureToVote', [
            _shorten(format(proposal, selectedChoices), 'choice')
          ])
        }}
        <br />
        {{ $t('cannotBeUndone') }}
      </h4>
      <div class="m-4 p-4 border rounded-2 text-white">
        <div class="d-flex">
          <span v-text="$t('options')" class="flex-auto text-gray mr-1" />
          <span class="text-right ml-4">
            {{ format(proposal, selectedChoices) }}
          </span>
        </div>
        <div class="d-flex">
          <span v-text="$t('snapshot')" class="flex-auto text-gray mr-1" />
          <a
            :href="_explorer(space.network, proposal.snapshot, 'block')"
            target="_blank"
            class="float-right"
          >
            {{ _n(proposal.snapshot, '0,0') }}
            <Icon name="external-link" class="ml-1" />
          </a>
        </div>
        <div class="d-flex">
          <span v-text="$t('votingPower')" class="flex-auto text-gray mr-1" />
          <span
            class="tooltipped tooltipped-nw"
            :aria-label="
              scores
                .map((score, index) => `${_n(score)} ${symbols[index]}`)
                .join(' + ')
            "
          >
            {{ _n(totalScore) }}
            {{ _shorten(space.symbol, 'symbol') }}
          </span>
          <a
            v-if="totalScore === 0"
            target="_blank"
            href="https://docs.snapshot.org/faq#why-i-cant-vote"
            class="d-inline-block mt-n1 ml-1"
          >
            <Icon name="info" size="24" class="text-gray" />
          </a>
        </div>
      </div>
    </div>
    <template v-slot:footer>
      <div class="col-6 float-left pr-2">
        <UiButton @click="$emit('close')" type="button" class="width-full">
          {{ $t('cancel') }}
        </UiButton>
      </div>
      <div class="col-6 float-left pl-2">
        <UiButton
          :disabled="totalScore === 0 || loading"
          :loading="loading"
          @click="handleSubmit"
          type="submit"
          class="width-full button--submit"
        >
          {{ $t('proposal.vote') }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
