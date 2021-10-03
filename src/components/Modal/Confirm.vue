<script setup>
import { ref, computed } from 'vue';
import { getChoiceString } from '@/helpers/utils';
import { useClient } from '@/composables/useClient';
import { useWeb3 } from '@/composables/useWeb3';

const props = defineProps({
  open: Boolean,
  space: Object,
  proposal: Object,
  selectedChoices: [Object, Number],
  snapshot: String,
  totalScore: Number,
  scores: Object,
  strategies: Object
});

const emit = defineEmits(['reload', 'close']);

const { send, sign } = useClient();
const { web3 } = useWeb3();
const format = getChoiceString;

const loading = ref(false);

const symbols = computed(() =>
  props.strategies.map(strategy => strategy.params.symbol)
);
const walletConnectType = computed(() => web3.value.walletConnectType);

async function handleSubmit() {
  loading.value = true;
  const isSafe = walletConnectType.value === 'Gnosis Safe Multisig';
  const fn = isSafe ? sign : send;
  await fn(props.space.id, 'vote', {
    proposal: props.proposal.id,
    choice: props.selectedChoices,
    metadata: {}
  });
  emit('reload');
  emit('close');
  loading.value = false;
}
</script>

<template>
  <UiModal :open="open" @close="$emit('close')" class="flex">
    <template v-slot:header>
      <h3>{{ $t('confirmVote') }}</h3>
    </template>
    <div class="flex flex-col flex-auto">
      <h4 class="m-4 mb-0 text-center">
        {{
          $tc('sureToVote', [
            _shorten(format(proposal, selectedChoices), 'choice')
          ])
        }}
        <br />
        {{ $t('cannotBeUndone') }}
      </h4>
      <div class="m-4 p-4 border rounded-md link-color">
        <div class="flex">
          <span v-text="$t('options')" class="flex-auto text-color mr-1" />
          <span class="text-right ml-4">
            {{ format(proposal, selectedChoices) }}
          </span>
        </div>
        <div class="flex">
          <span v-text="$t('snapshot')" class="flex-auto text-color mr-1" />
          <a
            :href="_explorer(space.network, proposal.snapshot, 'block')"
            target="_blank"
            class="float-right"
          >
            {{ _n(proposal.snapshot, '0,0') }}
            <Icon name="external-link" class="ml-1" />
          </a>
        </div>
        <div class="flex">
          <span v-text="$t('votingPower')" class="flex-auto text-color mr-1" />
          <span
            v-tippy="{
              content: scores
                .map((score, index) => `${_n(score)} ${symbols[index]}`)
                .join(' + ')
            }"
          >
            {{ _n(totalScore) }}
            {{ _shorten(space.symbol, 'symbol') }}
          </span>
          <a
            v-if="totalScore === 0"
            target="_blank"
            href="https://docs.snapshot.org/faq#why-i-cant-vote"
            class="inline-block -mt-1 ml-1"
          >
            <Icon name="info" size="24" class="text-color" />
          </a>
        </div>
      </div>
    </div>
    <template v-slot:footer>
      <div class="w-2/4 float-left pr-2">
        <UiButton @click="$emit('close')" type="button" class="w-full">
          {{ $t('cancel') }}
        </UiButton>
      </div>
      <div class="w-2/4 float-left pl-2">
        <UiButton
          :disabled="totalScore === 0 || loading"
          :loading="loading"
          @click="handleSubmit"
          type="submit"
          class="w-full button--submit"
        >
          {{ $t('proposal.vote') }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
