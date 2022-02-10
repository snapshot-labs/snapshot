<script setup>
defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  dropdownRange: {
    type: Array,
    required: true
  },
  label: {
    type: String
  }
});
</script>

<template>
  <div class="relative flex h-[64px] w-full group">
    <select
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      class="appearance-none bg-transparent w-full pl-[28px] !pt-[22px] cursor-pointer text-lg border rounded-full text-skin-link group-hover:border-skin-link"
      required
    >
      <option v-for="n in [...Array(dropdownRange).keys()]" :key="n" :value="n">
        {{ n }}
      </option>
    </select>
    <div
      class="absolute h-full left-[28px] top-[6px] pointer-events-none text-sm"
    >
      <span>{{ label }}</span>
    </div>
    <div
      class="absolute right-[22px] h-full flex items-center pointer-events-none"
    >
      <Icon size="18" name="arrow-down text-skin-text" />
    </div>
  </div>
</template>
