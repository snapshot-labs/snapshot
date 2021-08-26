<script setup>
import { computed } from 'vue';

const props = defineProps({
  onName: String,
  offName: String,
  on: { type: Boolean, default: true }
});

const emit = defineEmits(['favorite']);

const name = computed(() => (props.on ? 'favorite-on' : 'favorite-off'));

const buttonClasses = computed(() => {
  return {
    'extra-icon': true,
    'extra-icon-off': !props.on,
    'primary-color': props.on,
    'text-color': !props.on
  };
});

function handleClick(e) {
  e.preventDefault();
  emit('favorite');
}
</script>

<template>
  <button :class="buttonClasses" @click="handleClick($event)">
    <Icon :name="name" size="22" />
  </button>
</template>

<style scoped lang="scss">
.extra-icon {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 8px;
  line-height: 16px;
  border: none;
  background-color: transparent;
}
</style>
