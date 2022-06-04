<script setup lang="ts">
const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
  title?: string;
}>();

function trimUrlProposal(url: string) {
  if (!url) return url;
  return url.replace(/^https?:\/\//, '');
}

function addUrlProtocol(url: string) {
  if (!url) return url;
  return url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `https://${url}`;
}
</script>

<template>
  <div>
    <BaseInput
      v-bind="props"
      :model-value="trimUrlProposal(modelValue as string)"
      @update:model-value="
        input => $emit('update:modelValue', addUrlProtocol(input))
      "
      class="!pl-[66px]"
    >
      <template #before>
        <span class="text-gray-500 sm:text-sm"> https:// </span>
      </template>
    </BaseInput>
  </div>
</template>
