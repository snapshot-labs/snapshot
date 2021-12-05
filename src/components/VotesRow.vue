<script setup>
import { getChoiceString } from '@/helpers/utils';

defineProps({
  votes: {
    type: Array,
    required: true
  },
  proposal: {
    type: Object,
    required: true
  },
  space: {
    type: Object,
    required: true
  },
  titles: {
    type: Array,
    required: true
  },
  profiles: {
    type: Object,
    required: true
  }
});

defineEmits(['receipt']);

const format = getChoiceString;
</script>

<template>
  <div
    v-for="(vote, i) in votes"
    :key="i"
    :style="i === 0 && 'border: 0 !important;'"
    class="px-4 py-3 border-t flex"
  >
    <User
      :profile="profiles[vote.voter]"
      :address="vote.voter"
      :space="space"
      :proposal="proposal"
      class="column"
    />
    <div class="flex-auto text-center link-color">
      <span
        class="text-center link-color"
        v-tippy="{
          content:
            format(proposal, vote.choice).length > 24
              ? format(proposal, vote.choice)
              : null
        }"
      >
        {{ _shorten(format(proposal, vote.choice), 24) }}
      </span>
    </div>

    <div class="column text-right link-color">
      <span
        v-tippy="{
          content: vote.scores
            .map((score, index) => `${_n(score)} ${titles[index]}`)
            .join(' + ')
        }"
      >
        {{ `${_n(vote.balance)} ${_shorten(space.symbol, 'symbol')}` }}
      </span>
      <a
        @click="$emit('receipt', vote)"
        target="_blank"
        class="ml-2 text-color"
        title="Receipt"
      >
        <Icon name="signature" />
      </a>
    </div>
  </div>
</template>
