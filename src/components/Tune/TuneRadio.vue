<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
  value: string;
  id?: string;
  label?: string;
  hint?: string;
  definition?: any;
}>();

const emit = defineEmits(['update:modelValue']);

const onChange = (event: Event) => {
  if (event.target && (event.target as HTMLInputElement).checked) {
    emit('update:modelValue', props.value);
  }
};
</script>

<template>
  <div>
    <label :for="id || value">
      <div class="flex items-center gap-[10px]">
        <input
          :id="id || value"
          type="radio"
          :name="label || definition?.title"
          :checked="modelValue === value"
          :value="value"
          class="tune-input-radio"
          @input="onChange"
        />
        <TuneLabelInput v-if="hint || definition?.description" class="!mb-0">
          {{ hint || definition.description }}
        </TuneLabelInput>
      </div>
    </label>
  </div>
</template>
