<script setup>
import { ref } from 'vue';

defineProps({
  proposal: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['selectChoice']);

const selectedChoices = ref([]);

function selectChoice(i) {
  if (selectedChoices.value.includes(i))
    selectedChoices.value.splice(selectedChoices.value.indexOf(i), 1);
  else selectedChoices.value.push(i);

  emit('selectChoice', selectedChoices.value);
}
</script>

<template>
  <div class="mb-3">
    <UiButton
      v-for="(choice, i) in proposal.choices"
      :key="i"
      @click="selectChoice(i + 1)"
      class="d-block width-full mb-2"
      :class="selectedChoices.includes(i + 1) && 'button--active'"
    >
      {{ _shorten(choice, 32) }}

      <PluginAragonGovern :proposal="proposal" />
    </UiButton>
  </div>
</template>
