<script setup>
import { useI18n } from 'vue-i18n';

const props = defineProps({
  block: Boolean,
  text: {
    type: String,
    default: 'noResultsFound'
  }
});
</script>

<template>
  <div class="mb-3 text-center">
    <Block v-if="block" class="pt-1">
      <p>{{ $t(props.text) }}</p>
      <div>
        <slot />
      </div>
    </Block>
    <div v-else>{{ $t(props.text) }}</div>
  </div>
</template>
