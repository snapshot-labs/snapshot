<template>
  <Block class="mb-4" :title="$t('proposal.castVote')">
    <div class="mb-3">
      <UiButton
        v-for="(choice, i) in proposal.choices"
        :key="i"
        @click="$emit('update:modelValue', i + 1)"
        class="d-block width-full mb-2"
        :class="modelValue === i + 1 && 'button--active'"
      >
        {{ _shorten(choice, 32) }}
        <a
          v-if="proposal.plugins?.aragon?.[`choice${[i + 1]}`]"
          @click="$emit('open')"
          :aria-label="`Target address: ${
            proposal.plugins.aragon[`choice${i + 1}`].actions[0].to
          }\nValue: ${
            proposal.plugins.aragon[`choice${i + 1}`].actions[0].value
          }\nData: ${
            proposal.plugins.aragon[`choice${i + 1}`].actions[0].data
          }`"
          class="tooltipped tooltipped-n break-word"
        >
          <Icon name="warning" class="v-align-middle ml-1" />
        </a>
      </UiButton>
    </div>
    <UiButton
      :disabled="loading || app.authLoading || !modelValue"
      :loading="loading"
      @click="$emit('clickVote')"
      class="d-block width-full button--submit"
    >
      {{ $t('proposal.vote') }}
    </UiButton>
  </Block>
</template>

<script>
export default {
  props: {
    modelValue: {
      type: Number,
      required: true
    },
    proposal: {
      type: Object,
      required: true
    },
    loading: Boolean
  },
  emits: ['update:modelValue', 'open', 'clickVote']
};
</script>
