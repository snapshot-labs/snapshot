<script>
export default {
  props: { open: Boolean, title: String },
  emits: ['close']
};
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ title }}</h3>
    </template>
    <div class="my-2 p-4 text-center">
      <slot />
    </div>
    <template v-slot:footer>
      <div>
        <BaseButton
          @click="$emit('close')"
          type="submit"
          class="w-full"
          primary
        >
          {{ $t('continue') }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
