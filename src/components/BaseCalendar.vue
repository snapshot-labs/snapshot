<script setup>
import { ref, computed } from 'vue';
import { useI18n } from '@/composables/useI18n';

const props = defineProps({ modelValue: String });

const emit = defineEmits(['update:modelValue']);

const { currentLocale: locale } = useI18n();

const [
  yearNow = new Date().getFullYear(),
  monthNow = new Date().getMonth() + 1
  // dayNow = new Date().getDate()
] = props.modelValue ? props.modelValue.split('-') : [];

const input = ref(props.modelValue);
const year = ref(yearNow);
const month = ref(monthNow - 1);
// const day = ref(dayNow);

const fullYear = computed(() =>
  new Date(year.value, month.value).getFullYear()
);
const days = computed(() => new Date(year.value, month.value + 1, 0).getDate());
const emptyDays = computed(() => new Date(year.value, month.value, 1).getDay());
const isFutureMonth = computed(() => month.value > new Date().getMonth());

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
    return sunday.toLocaleDateString(locale.value, {
      weekday: 'short'
    });
  });
});

const monthName = computed(() => {
  const name = new Date(year.value, month.value).toLocaleString(locale.value, {
    month: 'long'
  });
  return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
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

function isSelectable(year, month, day) {
  const date = new Date(year, month, day);
  const dateNow = new Date().setHours(0, 0, 0, 0);
  return !(dateNow - date > 0);
}
</script>

<template>
  <div class="calendar">
    <div class="mb-2 flex items-center">
      <div class="w-1/4 text-left">
        <a
          v-show="isFutureMonth"
          class="iconfont iconback text-lg font-semibold text-skin-text"
          @click="month--"
        />
      </div>
      <h4 class="h-full w-full text-center">{{ monthName }} {{ fullYear }}</h4>
      <div class="w-1/4 text-right">
        <a
          class="iconfont icongo text-lg font-semibold text-skin-text"
          @click="month++"
        />
      </div>
    </div>
    <div class="overflow-hidden border-l border-t">
      <div
        v-for="dayOfWeek in daysOfWeek"
        :key="dayOfWeek"
        class="day border-b border-r text-skin-link"
        v-text="dayOfWeek"
      />
      <div
        v-for="emptyDay in emptyDays"
        :key="`empty-${emptyDay}`"
        class="day border-b border-r"
      />
      <div v-for="day in days" :key="day">
        <a
          v-if="isSelectable(year, month, day)"
          class="day selectable border-b border-r"
          :class="{
            'bg-skin-header-bg': formatDate(year, month, day) === today,
            selected: input.includes(formatDate(year, month, day))
          }"
          @click="toggleDay(year, month, day)"
          v-text="day"
        />
        <div v-else class="day border-b border-r" v-text="day" />
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
