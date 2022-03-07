<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  definition: any;
  input?: boolean | number | string | string[];
  error?: string;
}>();

const showError = ref(false);

watch(
  () => props.input,
  () => {
    showError.value = true;
  }
);
</script>

<template>
  <div>
    <label v-if="definition.title" v-text="definition.title" class="s-label" />
    <div>
      <div class="z-10 relative">
        <slot />
      </div>
      <div
        :class="[
          's-error',
          !!error && showError
            ? '-mt-[21px] opacity-100'
            : '-mt-[38px] opacity-0 h-6'
        ]"
      >
        <Icon
          v-if="error && showError"
          name="warning"
          class="text-white mr-2"
        />
        {{ error }}
      </div>
    </div>
    <span v-if="definition.description" v-text="definition.description" />
  </div>
</template>
