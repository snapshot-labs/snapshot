<template>
  <div class="calendar">
    <div class="mb-2 d-flex">
      <a
        class="col-3 iconfont iconback text-left h3 text-gray"
        @click="month--"
      />
      <h4 class="mb-3 flex-auto text-center">{{ monthName }} {{ year }}</h4>
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
            'bg-gray-dark': formatDate(year, month, day) === today,
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

<script>
export default {
  props: ['value'],
  data() {
    return {
      input: '',
      month: new Date().getMonth(),
      year: new Date().getFullYear(),
      day: new Date().getDate()
    };
  },
  computed: {
    today() {
      return this.formatDate(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate()
      );
    },
    daysOfWeek() {
      const sunday = new Date(2017, 0, 0);
      return [...Array(7)].map(() => {
        sunday.setDate(sunday.getDate() + 1);
        return sunday.toLocaleDateString(this.$i18n.locale, {
          weekday: 'short'
        });
      });
    },
    monthName() {
      const name = new Date(this.year, this.month).toLocaleString(
        this.$i18n.locale,
        {
          month: 'long'
        }
      );
      return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
    },
    days() {
      return new Date(this.year, this.month + 1, 0).getDate();
    },
    emptyDays() {
      return new Date(this.year, this.month, 1).getDay();
    }
  },
  methods: {
    formatDate(year, month, day) {
      return new Date(year, month, day).toISOString().split('T')[0];
    },
    toggleDay(year, month, day) {
      this.input = this.formatDate(year, month, day);
      this.$emit('input', this.input);
    },
    isSelectable() {
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
  }
};
</script>

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
