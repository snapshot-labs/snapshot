<script setup>
import { ref, computed, nextTick, toRefs, watch, onMounted } from 'vue';

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
  maxLength: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['update:modelValue']);

const { modelValue, minHeight, maxHeight } = toRefs(props);

// data property for v-model binding with real textarea tag
const val = ref(props.modelValue);
// works when content height becomes more then value of the maxHeight property
const maxHeightScroll = ref(false);
const height = ref('auto');
const textarea = ref(null);

const computedStyles = computed(() => {
  if (!props.autosize) return {};
  return {
    resize: 'none',
    height: height.value,
    overflow: maxHeightScroll.value ? 'auto' : 'hidden'
  };
});

function resize() {
  height.value = 'auto';
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
    height.value = heightVal;
  });
  return this;
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
    :style="computedStyles"
    :maxLength="maxLength"
    v-model="val"
    @focus="resize"
  />
</template>
