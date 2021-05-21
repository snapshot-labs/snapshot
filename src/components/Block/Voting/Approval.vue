<template>
  <Block class="mb-4" :title="$t('proposal.castVote')">
    <div class="mb-3">
      <UiButton
        v-for="(choice, i) in proposal.choices"
        :key="i"
        @click="selectChoice(i + 1)"
        class="d-block width-full mb-2"
        :class="selectedChoices.includes(i + 1) && 'button--active'"
      >
        {{ _shorten(choice, 32) }}
        <!-- Will these plugins work here? -->

        <!-- <a
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
        </a> -->
      </UiButton>
    </div>
    <UiButton
      :disabled="loading || app.authLoading || selectedChoices.length < 1"
      :loading="loading"
      @click="$emit('clickVote')"
      class="d-block width-full button--submit"
    >
      {{ $t('proposal.vote') }}
    </UiButton>
  </Block>
</template>

<script>
import { ref } from 'vue';
export default {
  props: {
    proposal: {
      type: Object,
      required: true
    },
    loading: Boolean
  },
  emits: ['update:modelValue', 'open', 'clickVote'],
  setup(_, { emit }) {
    const selectedChoices = ref([]);

    function selectChoice(i) {
      if (selectedChoices.value.includes(i))
        selectedChoices.value.splice(selectedChoices.value.indexOf(i), 1);
      else selectedChoices.value.push(i);

      emit('update:modelValue', selectedChoices.value);
    }

    return { selectChoice, selectedChoices };
  }
};
</script>
