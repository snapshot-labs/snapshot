<script setup lang="ts">
import { ref } from 'vue';

withDefaults(
  defineProps<{
    type?: string;
    information?: string;
    allowAny?: boolean;
  }>(),
  {
    type: '',
    information: '',
    allowAny: false
  }
);

const emit = defineEmits(['update:type']);

const modalVotingTypeOpen = ref(false);
</script>

<template>
  <div>
    <InputSelect
      :title="$t(`settings.type.label`)"
      :information="information"
      :model-value="type ? $t(`voting.${type}`) : $t('settings.anyType')"
      @select="modalVotingTypeOpen = true"
    />
    <teleport to="#modal">
      <ModalVotingType
        :selected="type"
        :open="modalVotingTypeOpen"
        :allow-any="allowAny"
        @update:selected="emit('update:type', $event)"
        @close="modalVotingTypeOpen = false"
      />
    </teleport>
  </div>
</template>
