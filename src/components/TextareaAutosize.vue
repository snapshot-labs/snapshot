<script setup>
import { ref, computed, nextTick, toRefs, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  autosize: {
    type: Boolean,
    default: true
  },
  minHeight: {
    type: [Number],
    default: null
  },
  maxHeight: {
    type: [Number],
    default: null
  },
  important: {
    type: [Boolean, Array],
    default: false
  }
});

const emit = defineEmits(['update:modelValue']);

const { minHeight, maxHeight } = toRefs(props);

const maxHeightScroll = ref(false);
const height = ref('auto');
const textarea = ref(null);

const isResizeImportant = computed(() => {
  const imp = props.important;
  return imp === true || (Array.isArray(imp) && imp.includes('resize'));
});

const isOverflowImportant = computed(() => {
  const imp = props.important;
  return imp === true || (Array.isArray(imp) && imp.includes('overflow'));
});

const isHeightImportant = computed(() => {
  const imp = props.important;
  return imp === true || (Array.isArray(imp) && imp.includes('height'));
});

const computedStyles = computed(() => {
  if (!props.autosize) return {};
  return {
    resize: !isResizeImportant.value ? 'none' : 'none !important',
    height: height.value,
    overflow: maxHeightScroll.value
      ? 'auto'
      : !isOverflowImportant.value
      ? 'hidden'
      : 'hidden !important'
  };
});

function resize() {
  const important = isHeightImportant.value ? 'important' : '';
  height.value = `auto${important ? ' !important' : ''}`;
  nextTick(() => {
    let contentHeight = textarea.value.scrollHeight + 1;
    if (props.minHeight) {
      contentHeight =
        contentHeight < props.minHeight ? props.minHeight : contentHeight;
    }
    if (props.maxHeight) {
      if (contentHeight > props.maxHeight) {
        contentHeight = props.maxHeight;
        maxHeightScroll.value = true;
      } else {
        maxHeightScroll.value = false;
      }
    }
    const heightVal = contentHeight + 'px';
    height.value = `${heightVal}${important ? ' !important' : ''}`;
  });
  return this;
}

const input = computed({
  get: () => (props.modelValue ? props.modelValue : ''),
  set: newVal => {
    nextTick(resize);
    emit('update:modelValue', newVal);
  }
});

watch(
  input,
  () => {
    resize();
  },
  { immediate: true }
);

watch([minHeight, maxHeight], () => {
  nextTick(resize);
});
</script>

<template>
  <textarea
    ref="textarea"
    :style="computedStyles"
    v-model="input"
    @focus="resize"
  ></textarea>
</template>
