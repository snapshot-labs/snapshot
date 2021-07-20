<script setup>
import { ref, computed, defineProps, defineEmits } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({ modelValue: String });

const emit = defineEmits(['update:modelValue']);

const { locale } = useI18n();

const [
  yearNow = new Date().getFullYear(),
  monthNow = new Date().getMonth() + 1,
  // dayNow = new Date().getDate()
] = props.modelValue ? props.modelValue.split('-') : [];

const input = ref(props.modelValue);
const year = ref(yearNow);
const month = ref(monthNow - 1);
// const day = ref(dayNow);

const today = computed(() => {
  return formatDate(
    new Date().getFullYear(),
    new Date().getMonth(),
    new Date().getDate()
  );
});
const daysOfWeek = computed(() => {
  const sunday = new Date(2017, 0, 0);
  return [...Array(7)].map(() => {
    sunday.setDate(sunday.getDate() + 1);
    return sunday.toLocaleDateString(locale, {
      weekday: 'short'
    });
  });
});
const monthName = computed(() => {
  const name = new Date(year.value, month.value).toLocaleString(locale, {
    month: 'long'
  });
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
});
const fullYear = computed(() => {
  return new Date(year.value, month.value).getFullYear();
});
const days = computed(() => {
  return new Date(year.value, month.value + 1, 0).getDate();
});
const emptyDays = computed(() => {
  return new Date(year.value, month.value, 1).getDay();
});

function formatDate(year, month, day) {
  let date = new Date(year, month, day);
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - offset * 60 * 1000);
  return date.toISOString().split('T')[0];
}
function toggleDay(year, month, day) {
  input.value = formatDate(year, month, day);
  emit('update:modelValue', input.value);
}
function isSelectable() {
  return true;
  /*
      const in30Days = new Date();
      in30Days.setDate(in30Days.getDate() + 30);
      return (
        new Date(year, month, day) > new Date() &&
        new Date(year, month, day) < in30Days
      );
      */
}
</script>

<template>
  <div class="calendar">
    <div class="mb-2 d-flex">
      <a
        class="col-3 iconfont iconback text-left h3 text-gray"
        @click="month--"
      />
      <h4 class="mb-3 flex-auto text-center">{{ monthName }} {{ fullYear }}</h4>
      <a
        class="col-3 iconfont icongo text-right h3 text-gray"
        @click="month++"
      />
    </div>
    <div class="border-left border-top overflow-hidden">
      <div
        class="day border-bottom border-right text-white"
        v-for="dayOfWeek in daysOfWeek"
        v-text="dayOfWeek"
        :key="dayOfWeek"
      />
      <div
        class="day border-bottom border-right"
        v-for="emptyDay in emptyDays"
        :key="`empty-${emptyDay}`"
      />
      <div v-for="day in days" :key="day">
        <a
          class="day border-bottom border-right selectable"
          :class="{
            'header-bg': formatDate(year, month, day) === today,
            selected: input.includes(formatDate(year, month, day))
          }"
          v-if="isSelectable(year, month, day)"
          v-text="day"
          @click="toggleDay(year, month, day)"
        />
        <div class="day border-bottom border-right" v-text="day" v-else />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.calendar {
  width: 309px;
  margin: 0 auto;

  .day {
    color: var(--text-color);
    text-decoration: none;
    font-size: 17px !important;
    float: left;
    text-align: center;
    line-height: 44px;
    width: 44px;
    height: 44px;

    &.selectable {
      color: var(--link-color);
      background-color: transparent;

      &:hover {
        background-color: var(--link-color) !important;
        color: var(--bg-color) !important;
      }
    }

    &.selected {
      background-color: var(--link-color) !important;
      color: var(--bg-color) !important;
    }
  }
}
</style>
