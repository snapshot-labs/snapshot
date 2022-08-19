<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { isAddress } from '@ethersproject/address';
import { useI18n } from '@/composables';

const props = defineProps<{
  modelValue: string;
  inputProps: Record<string, any>;
  label: string;
}>();

const emit = defineEmits(['update:modelValue', 'validAddress']);

const { t } = useI18n();

const input = ref('');
const isValid = ref(false);
const error = computed(() =>
  input.value !== '' && !isValid.value
    ? t('safeSnap.invalidAddress')
    : undefined
);

watch(
  () => props.modelValue,
  value => {
    input.value = value;
  }
);

onMounted(() => {
  if (props.modelValue) {
    input.value = props.modelValue;
  }
});

const handleInput = () => {
  emit('update:modelValue', input.value);
  isValid.value = isAddress(input.value);
  if (isValid.value) {
    emit('validAddress', input.value);
  }
};
</script>

<template>
  <UiInput
    v-model="input"
    v-bind="inputProps"
    :error="error"
    @input="handleInput()"
  >
    <template v-if="label" #label>{{ label }}</template>
  </UiInput>
</template>
