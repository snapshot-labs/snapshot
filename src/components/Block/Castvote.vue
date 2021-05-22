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
        <PluginAragonGovern :proposal="proposal" />
      </UiButton>
    </div>
    <UiButton
      :disabled="app.authLoading || !modelValue"
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
    }
  },
  emits: ['update:modelValue', 'open', 'clickVote']
};
</script>
