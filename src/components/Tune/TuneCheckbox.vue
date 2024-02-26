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
    <label :for="id" class="hover:cursor-pointer">
      <div class="flex gap-[8px]">
        <input
          :id="id"
          :checked="modelValue"
          :name="label || definition?.title"
          type="checkbox"
          class="tune-input-checkbox hover:cursor-pointer my-[2px]"
          @input="
            emit(
              'update:modelValue',
              ($event.target as HTMLInputElement).checked
            )
          "
        />
        <TuneLabelInput
          v-if="hint || definition?.description || $slots.hint"
          class="!mb-0"
        >
          <slot v-if="$slots.hint" name="hint" />
          <template v-else>
            {{ hint || definition.description }}
          </template>
        </TuneLabelInput>
      </div>
    </label>
  </div>
</template>
