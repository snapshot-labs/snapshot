<script setup lang="ts">
withDefaults(
  defineProps<{
    admins: string[];
    isSpaceController?: boolean;
    error?: { message: string; push: boolean };
  }>(),
  {
    isSpaceController: true,
    error: () => ({
      message: '',
      push: false
    })
  }
);

const emit = defineEmits(['update:admins']);
</script>

<template>
  <BaseBlock
    v-if="isSpaceController"
    :title="$t('settings.admins.label')"
    :information="$t('settings.admins.information')"
  >
    <BaseBlock v-if="error.message" class="mb-2 !border-red">
      <BaseIcon name="warning" class="mr-2 !text-red" />
      <span class="!text-red"> {{ error.message }}&nbsp;</span>
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
