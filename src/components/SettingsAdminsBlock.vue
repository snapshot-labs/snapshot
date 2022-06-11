<script setup lang="ts">
withDefaults(
  defineProps<{
    admins: string[];
    isSpaceController?: boolean;
    getErrorMessage: (field: string) => string;
  }>(),
  {
    isSpaceController: true
  }
);

const emit = defineEmits(['update:admins']);
</script>

<template>
  <BaseBlock v-if="isSpaceController" :title="$t('settings.admins')">
    <BaseBlock v-if="getErrorMessage('admins')" class="mb-2 !border-red">
      <BaseIcon name="warning" class="mr-2 !text-red" />
      <span class="!text-red"> {{ getErrorMessage('admins') }}&nbsp;</span>
    </BaseBlock>
    <TextareaArray
      :model-value="admins"
      :placeholder="`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`"
      class="input w-full text-left"
      style="font-size: 18px"
      @update:model-value="emit('update:admins', $event)"
    />
  </BaseBlock>
</template>
