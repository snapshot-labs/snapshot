<script setup lang="ts">
import { ref } from 'vue';

withDefaults(
  defineProps<{
    privacy?: string;
  }>(),
  {
    privacy: ''
  }
);

const emit = defineEmits(['update:privacy']);

const modalVotingPrivacyOpen = ref(false);
</script>

<template>
  <div>
    <InputSelect
      :title="$t(`privacy.label`)"
      :information="$t(`privacy.information`)"
      :model-value="
        privacy ? $t(`privacy.${privacy}.label`) : $t('privacy.any')
      "
      @select="modalVotingPrivacyOpen = true"
    />

    <ModalVotingPrivacy
      :selected="privacy"
      :open="modalVotingPrivacyOpen"
      allow-any
      @update:selected="emit('update:privacy', $event)"
      @close="modalVotingPrivacyOpen = false"
    />
  </div>
</template>
