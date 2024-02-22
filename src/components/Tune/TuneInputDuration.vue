<script setup lang="ts">
interface DurationInputProps {
  modelValue: number;
  label?: string;
  hint?: string;
  error?: string;
  definition?: any;
  hideDay?: boolean;
  hideMinutes?: boolean;
  disabled?: boolean;
  block?: boolean;
}

const props = defineProps<DurationInputProps>();
const emit = defineEmits(['update:modelValue']);

const duration = computed<any>({
  get() {
    if (props.hideDay) {
      return {
        hours: Math.floor(props.modelValue / 3600),
        minutes: Math.floor((props.modelValue % 3600) / 60)
      };
    }
    if (props.hideMinutes) {
      return {
        days: Math.floor(props.modelValue / 86400),
        hours: Math.floor((props.modelValue % 86400) / 3600)
      };
    }
    return {
      days: Math.floor(props.modelValue / 86400),
      hours: Math.floor((props.modelValue % 86400) / 3600),
      minutes: Math.floor((props.modelValue % 3600) / 60)
    };
  },
  set(newDuration) {
    const minutes = newDuration.minutes || 0;
    const hours = newDuration.hours || 0;
    const days = newDuration.days || 0;
    const totalSeconds = days * 86400 + hours * 3600 + minutes * 60;
    emit('update:modelValue', totalSeconds);
  }
});

const inputItems = computed(() => {
  return [
    {
      key: 'days',
      label: 'Days',
      hidden: props.hideDay || false,
      max: 365
    },
    {
      key: 'hours',
      label: 'Hours',
      hidden: false,
      max: 24
    },
    {
      key: 'minutes',
      label: 'Minutes',
      hidden: props.hideMinutes || false,
      max: 60
    }
  ];
});

const updateDuration = (key: string, value: number) => {
  if (isNaN(value) || value === undefined) return;
  duration.value = { ...duration.value, [key]: value };
};

const inputRef = ref<any[]>([]);

function addRef(ref: any) {
  inputRef.value.push(ref);
}

const showErrorMessage = ref(false);

function forceShowError() {
  showErrorMessage.value = true;
}

defineExpose({
  forceShowError
});
</script>

<template>
  <div>
    <TuneLabelInput :hint="hint || definition?.description">
      {{ label || definition?.title }}
    </TuneLabelInput>
    <div
      :class="[
        'tune-input-duration inline-flex overflow-hidden',
        { 'w-full': block },
        { 'tune-error-border': error && showErrorMessage },
        { disabled: disabled }
      ]"
      @click="inputRef?.[0].focus()"
    >
      <template v-for="item in inputItems" :key="item.label">
        <div v-if="!item.hidden" class="flex items-center first:-ml-3">
          <input
            :ref="addRef"
            :value="duration[item.key]"
            type="number"
            min="0"
            :max="item.max"
            placeholder="0"
            :disabled="disabled"
            :class="[
              'bg-transparent py-2 pl-4 pr-1 outline-none',
              { 'cursor-not-allowed bg-transparent': disabled }
            ]"
            @click.stop
            @input="
              updateDuration(
                item.key,
                ($event.target as HTMLInputElement)?.valueAsNumber
              )
            "
            @blur="error ? (showErrorMessage = true) : null"
            @focus="error ? null : (showErrorMessage = false)"
          />
          <span class="tune-input-duration-label">
            {{ item.label }}
          </span>
        </div>
      </template>
    </div>
    <TuneErrorInput v-if="error && showErrorMessage" :error="error" />
  </div>
</template>

<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
