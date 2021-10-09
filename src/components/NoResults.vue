<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  block: Boolean,
  text: {
    type: String,
    default: 'noResultsFound'
  }
});

const text = computed(() => t(props.text));
</script>

<template>
  <div class="mb-3 text-center">
    <Block v-if="block" class="pt-1">
      <p>{{ text }}</p>
      <slot />
    </Block>
    <div v-else>{{ text }}</div>
  </div>
</template>
