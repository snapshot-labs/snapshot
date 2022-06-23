<script setup lang="ts">
import { useRouter } from 'vue-router';
import debounce from 'lodash/debounce';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  modal?: boolean;
}>();
const emit = defineEmits(['update:modelValue']);

const router = useRouter();

function handleInput(e) {
  const input = e.target.value;
  if (!props.modal) {
    const { query } = router.currentRoute.value;
    router.push({
      query: input ? { ...query, q: input } : { ...query, q: undefined }
    });
  }
  emit('update:modelValue', input);
}

const handleInputDebounce = debounce(handleInput, 100);

function clearInput() {
  if (!props.modal) {
    const { query } = router.currentRoute.value;
    router.push({ query: { ...query, q: undefined } });
  }
  emit('update:modelValue', '');
}
</script>

<template>
  <div
    class="flex items-center"
    :class="{ 'border-b bg-skin-bg py-3 px-4': modal }"
  >
    <i-ho-search class="mr-2 text-[19px]" />
    <input
      :value="modelValue"
      :placeholder="placeholder"
      type="text"
      autocorrect="off"
      autocapitalize="none"
      class="input w-full flex-auto border-none"
      @input="handleInputDebounce"
    />
    <a @click="clearInput">
      <BaseIcon v-if="modelValue" name="close" size="12" class="mb-1" />
    </a>
  </div>
</template>
