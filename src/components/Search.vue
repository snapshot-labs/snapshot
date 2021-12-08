<script setup>
import { useRouter } from 'vue-router';
import debounce from 'lodash/debounce';

const props = defineProps({
  modelValue: String,
  placeholder: String,
  modal: Boolean
});
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
    :class="{ 'bg-skin-bg border-b py-3 px-4': modal }"
  >
    <Icon name="search" size="22" class="mb-1 mr-2 text-color" />
    <input
      :value="modelValue"
      :placeholder="placeholder"
      @input="handleInputDebounce"
      type="text"
      autocorrect="off"
      autocapitalize="none"
      class="border-none input flex-auto w-full"
    />
    <a @click="clearInput">
      <Icon v-if="modelValue" name="close" size="12" class="mb-1" />
    </a>
  </div>
</template>
