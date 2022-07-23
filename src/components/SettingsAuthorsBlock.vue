<script setup lang="ts">
import { useSpaceForm } from '@/composables';

const props = defineProps<{
  context: 'setup' | 'settings';
}>();

const { form, getErrorMessage } = useSpaceForm(props.context);
</script>

<template>
  <BaseBlock
    :title="$t('settings.authors.label')"
    :information="$t('settings.authors.information')"
  >
    <BaseBlock
      v-if="getErrorMessage('members').message"
      class="mb-2 !border-red"
    >
      <BaseIcon name="warning" class="mr-2 !text-red" />
      <span class="!text-red">
        {{ getErrorMessage('members').message }}&nbsp;</span
      >
    </BaseBlock>
    <TextareaArray
      v-model="form.members"
      :placeholder="`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`"
      class="input w-full text-left"
      style="font-size: 18px"
    />
  </BaseBlock>
</template>
