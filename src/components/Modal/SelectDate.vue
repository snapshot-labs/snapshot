<script setup>
import { ref, toRefs, watch } from 'vue';
import { getDateOutput, getTimestamp } from '@/helpers/utils';

const props = defineProps({
  open: Boolean,
  value: Number,
  selectedDate: String
});

const emit = defineEmits(['input', 'close']);

const { open } = toRefs(props);
const input = ref('');
const step = ref(0);
const form = ref({
  h: '12',
  m: '00'
});

function formatDate(date) {
  const output = getDateOutput(date);

  return output;
}

function handleSubmit() {
  if (step.value === 0) return (step.value = 1);

  const timestamp = getTimestamp(input.value, form.value.h, form.value.m);

  emit('input', timestamp);
  emit('close');
}

watch(open, () => {
  const { dateString, h, m } = formatDate(props.value);
  step.value = 0;
  form.value = { h, m };
  input.value = dateString;
});
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3 v-if="step === 0">
        {{
          selectedDate === 'start'
            ? $t('create.startDate')
            : $t('create.endDate')
        }}
      </h3>
      <h3 v-else>
        {{
          selectedDate === 'start'
            ? $t('create.startTime')
            : $t('create.endTime')
        }}
      </h3>
    </template>
    <div v-if="step === 0">
      <div class="m-4">
        <UiCalendar v-model="input" class="mx-auto mb-2" />
      </div>
    </div>
    <div v-else class="flex m-4 mx-auto" style="max-width: 160px">
      <UiButton class="!px-0 w-max">
        <input v-model="form.h" max="24" class="input text-center w-5/12" />
        <span class="w-2/12">:</span>
        <input v-model="form.m" max="60" class="input text-center w-5/12" />
      </UiButton>
    </div>
    <template v-slot:footer>
      <div class="w-2/4 float-left pr-2">
        <UiButton @click="$emit('close')" type="button" class="w-full">
          {{ $t('cancel') }}
        </UiButton>
      </div>
      <div class="w-2/4 float-left pl-2">
        <UiButton
          @click="handleSubmit"
          type="submit"
          :disabled="!input"
          class="w-full"
          primary
        >
          <span v-if="step === 0">{{ $t('next') }}</span>
          <span v-else>{{ $t('select') }}</span>
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>
