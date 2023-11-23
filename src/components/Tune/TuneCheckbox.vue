<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  id: string;
  label?: string;
  hint?: string;
  definition?: any;
}>();

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div>
    <label :for="id">
      <div class="flex items-center gap-[10px]">
        <input
          :id="id"
          :checked="modelValue"
          :name="label || definition?.title"
          type="checkbox"
          class="tune-input-checkbox"
          @input="
            emit(
              'update:modelValue',
              ($event.target as HTMLInputElement).checked
            )
          "
        />
        <TuneLabelInput v-if="hint || definition?.description" class="!mb-0">
          {{ hint || definition.description }}
        </TuneLabelInput>
      </div>
    </label>
  </div>
</template>
