<script setup lang="ts">
defineProps<{
  members: string[];
  error?: { message: string; push: boolean };
}>();

const emit = defineEmits(['update:members']);
</script>

<template>
  <BaseBlock
    :title="$t('settings.authors.label')"
    :information="$t('settings.authors.information')"
  >
    <BaseBlock v-if="error?.message" class="mb-2 !border-red">
      <BaseIcon name="warning" class="mr-2 !text-red" />
      <span class="!text-red"> {{ error.message }}&nbsp;</span>
    </BaseBlock>
    <TextareaArray
      :model-value="members"
      :placeholder="`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`"
      class="input w-full text-left"
      style="font-size: 18px"
      @update:model-value="emit('update:members', $event)"
    />
  </BaseBlock>
</template>
