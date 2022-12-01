<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import debounce from 'lodash/debounce';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  modal?: boolean;
}>();
const emit = defineEmits(['update:modelValue']);

const router = useRouter();

const input = ref(props.modelValue || '');

function updateRouteQuery() {
  if (!props.modal) {
    const { query } = router.currentRoute.value;
    router.push({
      query: input.value
        ? { ...query, q: input.value }
        : { ...query, q: undefined }
    });
  }
}

const debouncedUpdateRouteQuery = debounce(updateRouteQuery, 300);

function handleInput(e) {
  input.value = e.target.value;
  debouncedUpdateRouteQuery();
  emit('update:modelValue', input.value);
}

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
      :value="input"
      :placeholder="placeholder"
      type="text"
      autocorrect="off"
      autocapitalize="none"
      class="input w-full flex-auto border-none"
      @input="handleInput"
    />
    <a @click="clearInput">
      <BaseIcon v-if="modelValue" name="close" size="12" class="mb-1" />
    </a>
  </div>
</template>
