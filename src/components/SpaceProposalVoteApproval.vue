<script setup>
import { ref } from 'vue';
import { shorten } from '@/helpers/utils';

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
    <BaseButton
      v-for="(choice, i) in proposal.choices"
      :key="i"
      @click="selectChoice(i + 1)"
      class="block w-full mb-2"
      :class="{
        '!border-skin-link': selectedChoices.includes(i + 1),
        'hover:border-skin-link border-skin-border': !selectedChoices.includes(
          i + 1
        )
      }"
    >
      {{ shorten(choice, 32) }}
    </BaseButton>
  </div>
</template>
