<script>
export default {
  props: { open: Boolean, title: String },
  emits: ['close']
};
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>{{ title }}</h3>
    </template>
    <div class="my-2 p-4 text-center">
      <slot />
    </div>
    <template #footer>
      <div>
        <BaseButton
          type="submit"
          class="w-full"
          primary
          @click="$emit('close')"
        >
          {{ $t('continue') }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
