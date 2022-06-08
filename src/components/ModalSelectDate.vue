<script setup>
import { ref, toRefs, watch } from 'vue';

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
  const output = { h: '12', m: '00', dateString: '' };
  if (!date) return output;
  const dateObject = new Date(date * 1000);
  const offset = dateObject.getTimezoneOffset();
  const data = new Date(dateObject.getTime() - offset * 60 * 1000);
  output.dateString = data.toISOString().split('T')[0];
  output.h = ('0' + dateObject.getHours().toString()).slice(-2);
  output.m = ('0' + dateObject.getMinutes().toString()).slice(-2);
  return output;
}

function handleSubmit() {
  if (step.value === 0) return (step.value = 1);
  const [year, month, day] = input.value.split('-');
  let timestamp = new Date(year, month - 1, day, form.value.h, form.value.m, 0);
  timestamp = new Date(timestamp).getTime() / (1e3).toFixed();
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
  <BaseModal :open="open" @close="$emit('close')">
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
        <BaseCalendar v-model="input" class="mx-auto mb-2" />
      </div>
    </div>
    <div v-else class="m-4 mx-auto flex" style="max-width: 160px">
      <BaseButton class="w-max !px-0">
        <input v-model="form.h" max="24" class="input w-5/12 text-center" />
        <span class="w-2/12">:</span>
        <input v-model="form.m" max="60" class="input w-5/12 text-center" />
      </BaseButton>
    </div>
    <template v-slot:footer>
      <div class="float-left w-2/4 pr-2">
        <BaseButton @click="$emit('close')" type="button" class="w-full">
          {{ $t('cancel') }}
        </BaseButton>
      </div>
      <div class="float-left w-2/4 pl-2">
        <BaseButton
          @click="handleSubmit"
          type="submit"
          :disabled="!input"
          class="w-full"
          primary
        >
          <span v-if="step === 0">{{ $t('next') }}</span>
          <span v-else>{{ $t('select') }}</span>
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
