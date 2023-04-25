<script setup lang="ts">
withDefaults(
  defineProps<{
    privacy?: string;
    hint?: string;
    allowAny?: boolean;
    disabled?: boolean;
  }>(),
  {
    privacy: '',
    hint: '',
    allowAny: false,
    disabled: false
  }
);

const emit = defineEmits(['update:privacy']);

const modalVotingPrivacyOpen = ref(false);
</script>

<template>
  <div>
    <TuneButtonSelect
      :label="$t(`privacy.label`)"
      :hint="hint"
      :model-value="
        privacy ? $t(`privacy.${privacy}.label`) : $t('privacy.any')
      "
      :disabled="disabled"
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
