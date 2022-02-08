<script setup>
defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  dropdownRange: {
    type: Array,
    required: true
  }
});
</script>

<template>
  <div class="relative flex ml-2">
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      required
    >
      <option v-for="n in [...Array(dropdownRange).keys()]" :key="n" :value="n">
        {{ n }}
      </option>
    </select>
    <div class="absolute right-0 h-full flex items-center">
      <Icon size="14" name="arrow-down" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
select {
  // A reset of styles, including removing the default dropdown arrow
  appearance: none;
  // Additional resets for further consistency
  background-color: transparent;
  border: none;
  margin: 0;
  width: 93%;
  font-family: inherit;
  font-size: inherit;
  cursor: inherit;
  line-height: inherit;
}
</style>
