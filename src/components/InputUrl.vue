<script setup lang="ts">
const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
  title?: string;
  error?: string;
  information?: string;
}>();

const emit = defineEmits(['update:modelValue']);

function trimUrlProposal(url: string) {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '');
}

function addUrlProtocol(url: string) {
  if (!url) return '';
  if (url.startsWith('ipfs://')) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}
</script>

<template>
  <div>
    <BaseInput
      v-bind="props"
      :model-value="trimUrlProposal(modelValue as string)"
      :error="error"
      :information="information"
      class="!pl-[70px]"
      @update:model-value="
        input => emit('update:modelValue', addUrlProtocol(input))
      "
    >
      <template #before>
        <span class="text-skin-text"> https:// </span>
      </template>
    </BaseInput>
  </div>
</template>
