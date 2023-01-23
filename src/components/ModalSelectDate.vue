<script setup lang="ts">
import { ref, toRefs, watch } from 'vue';

const props = defineProps<{
  open: boolean;
  value?: number;
  type?: string;
}>();

const emit = defineEmits(['input', 'close']);

const { open } = toRefs(props);
const step = ref(0);
const input = ref('');
const time = ref('12:00');

function formatDate(date) {
  const output = { h: '12', m: '00', dateString: '' };
  if (!date) return output;
  const dateObject = new Date(date * 1000);
  const offset = dateObject.getTimezoneOffset();
  const data = new Date(dateObject.getTime() - offset * 60 * 1000);
  output.dateString = data.toISOString().split('T')[0];
  output.h = `0${dateObject.getHours().toString()}`.slice(-2);
  output.m = `0${dateObject.getMinutes().toString()}`.slice(-2);
  return output;
}

function handleSubmit() {
  if (step.value === 0) return (step.value = 1);
  const dateString = `${input.value} ${time.value}:00`;
  const timestamp = new Date(dateString).getTime() / 1000;
  emit('input', timestamp);
  emit('close');
}

watch(open, () => {
  step.value = 0;
  if (!props.value) return;
  const { dateString, h, m } = formatDate(props.value);
  time.value = `${h}:${m}`;
  input.value = dateString;
});
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3 v-if="step === 0">
        {{ type === 'start' ? $t('create.startDate') : $t('create.endDate') }}
      </h3>
      <h3 v-else>
        {{ type === 'start' ? $t('create.startTime') : $t('create.endTime') }}
      </h3>
    </template>
    <div v-if="step === 0">
      <div class="m-4">
        <BaseCalendar v-model="input" class="mx-auto mb-2" />
      </div>
    </div>
    <div v-else class="m-4 mx-auto max-w-[140px]">
      <input
        v-model="time"
        type="time"
        class="s-input form-input text-center text-lg"
      />
    </div>
    <template #footer>
      <div class="float-left w-2/4 pr-2">
        <BaseButton type="button" class="w-full" @click="$emit('close')">
          {{ $t('cancel') }}
        </BaseButton>
      </div>
      <div class="float-left w-2/4 pl-2">
        <BaseButton
          type="submit"
          :disabled="!input"
          class="w-full"
          primary
          @click="handleSubmit"
        >
          <span v-if="step === 0">{{ $t('next') }}</span>
          <span v-else>{{ $t('select') }}</span>
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
