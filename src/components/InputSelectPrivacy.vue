<script setup lang="ts">
withDefaults(
  defineProps<{
    privacy?: string;
    information?: string;
    allowAny?: boolean;
    isDisabled?: boolean;
  }>(),
  {
    privacy: '',
    information: '',
    allowAny: false,
    isDisabled: false
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
      :is-disabled="isDisabled"
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
