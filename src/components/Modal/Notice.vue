<script>
export default {
  props: { open: Boolean, title: String },
  emits: ['close']
};
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ title }}</h3>
    </template>
    <div class="text-center my-2 p-4">
      <slot />
    </div>
    <template v-slot:footer>
      <div>
        <UiButton @click="$emit('close')" type="submit" class="w-full" primary>
          {{ $t('continue') }}
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
