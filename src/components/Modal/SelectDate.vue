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
    <div v-else class="d-flex m-4 mx-auto" style="max-width: 160px;">
      <UiButton class="px-0 width-fit">
        <input v-model="form.h" max="24" class="input text-center col-5" />
        <span class="col-2">:</span>
        <input v-model="form.m" max="60" class="input text-center col-5" />
      </UiButton>
    </div>
    <template v-slot:footer>
      <div class="col-6 float-left pr-2">
        <UiButton @click="$emit('close')" type="button" class="width-full">
          {{ $t('cancel') }}
        </UiButton>
      </div>
      <div class="col-6 float-left pl-2">
        <UiButton
          @click="handleSubmit"
          type="submit"
          class="width-full button--submit"
        >
          <span v-if="step === 0">{{ $t('next') }}</span>
          <span v-else>{{ $t('select') }}</span>
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>

<script>
export default {
  props: ['open', 'value', 'selectedDate'],
  emits: ['input', 'close'],
  data() {
    return {
      input: '',
      step: 0,
      form: {
        h: '12',
        m: '00'
      }
    };
  },
  watch: {
    open() {
      this.step = 0;
      this.form = { h: '12', m: '00' };
      this.input = this.value;
    }
  },
  methods: {
    handleSubmit() {
      if (this.step === 0) return (this.step = 1);
      const [year, month, day] = this.input.split('-');
      let input = new Date(year, month - 1, day, this.form.h, this.form.m, 0);
      input = new Date(input).getTime() / (1e3).toFixed();
      this.$emit('input', input);
      this.$emit('close');
    }
  }
};
</script>
