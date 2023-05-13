<script setup lang="ts">
import debounce from 'lodash/debounce';

const props = defineProps<{
  modelValue: string;
  placeholder?: string;
  modal?: boolean;
  focusOnMount?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const router = useRouter();

const input = ref(props.modelValue || '');
const BaseInputEL = ref<HTMLDivElement | undefined>(undefined);

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
  input.value = '';
  emit('update:modelValue', '');
}

onMounted(() => {
  if (props.focusOnMount) {
    BaseInputEL?.value?.focus();
  }
});

watch(
  () => props.modelValue,
  () => {
    input.value = props.modelValue;
  }
);
</script>

<template>
  <div
    class="flex items-center"
    :class="{ 'border-b bg-skin-bg px-4 py-3': modal }"
  >
    <i-ho-search class="mr-2 text-[19px]" />
    <input
      ref="BaseInputEL"
      :value="input"
      :placeholder="placeholder"
      type="text"
      autocorrect="off"
      autocapitalize="none"
      class="input w-full flex-auto border-none"
      @input="handleInput"
    />
    <slot name="after" :clearInput="clearInput" />
    <i-ho-x-mark
      v-if="!$slots.after && modelValue"
      class="cursor-pointer text-[12px]"
      @click="clearInput"
    />
  </div>
</template>
