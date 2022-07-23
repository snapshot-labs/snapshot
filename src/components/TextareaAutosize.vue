<script setup lang="ts">
import { ref, computed, nextTick, toRefs, watch, onMounted } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    autosize?: boolean;
    minHeight?: number;
    maxHeight?: number;
    maxLength?: number;
    placeholder?: string;
  }>(),
  {
    modelValue: '',
    autosize: true,
    placeholder: ''
  }
);

const emit = defineEmits(['update:modelValue']);

const { modelValue, minHeight, maxHeight } = toRefs(props);

// data property for v-model binding with real textarea tag
const val = ref(props.modelValue);
// works when content height becomes more then value of the maxHeight property
const maxHeightScroll = ref(false);
const height = ref('auto');
const textarea = ref<HTMLTextAreaElement | null>(null);

const computedStyles = computed(() => {
  if (!props.autosize) return '';
  return `resize: none; height: ${height.value}; overflow: ${
    maxHeightScroll.value ? 'auto' : 'hidden'
  }`;
});

function resize() {
  height.value = 'auto';
  nextTick(() => {
    if (!textarea.value) return;
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
    height.value = heightVal;
  });
  return;
}

watch(modelValue, v => {
  val.value = v;
});

watch(val, v => {
  nextTick(resize);
  emit('update:modelValue', v);
  if (v) resize();
});

watch([minHeight, maxHeight], () => {
  nextTick(resize);
});

onMounted(() => resize());
</script>

<template>
  <textarea
    ref="textarea"
    v-model.lazy="val"
    class="!mt-1 h-auto w-full rounded-3xl border border-skin-border py-3 px-4 focus-within:!border-skin-text hover:border-skin-text"
    :style="computedStyles"
    :maxlength="maxLength"
    :placeholder="placeholder"
    @focus="resize"
  />
</template>
