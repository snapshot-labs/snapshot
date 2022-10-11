<script setup lang="ts">
import { ref } from 'vue';

withDefaults(
  defineProps<{
    privacy?: string;
    information?: string;
    allowAny?: boolean;
    disabled?: boolean;
  }>(),
  {
    privacy: '',
    information: '',
    allowAny: false,
    disabled: false
  }
);

const emit = defineEmits(['update:privacy']);

const modalVotingPrivacyOpen = ref(false);
</script>

<template>
  <div>
    <InputSelect
      :title="$t(`privacy.label`)"
      :information="information"
      :model-value="
        privacy ? $t(`privacy.${privacy}.label`) : $t('privacy.any')
      "
      :disabled="disabled"
      :tooltip="
        disabled
          ? $t('create.privacyEnforced', {
              type: $t(`privacy.${privacy}.label`)
            })
          : null
      "
      @select="modalVotingPrivacyOpen = true"
    />
    <teleport to="#modal">
      <ModalVotingPrivacy
        :selected="privacy"
        :open="modalVotingPrivacyOpen"
        :allow-any="allowAny"
        @update:selected="emit('update:privacy', $event)"
        @close="modalVotingPrivacyOpen = false"
      />
    </teleport>
  </div>
</template>
