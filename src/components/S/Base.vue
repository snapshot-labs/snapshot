<script setup>
defineProps({ definition: Object, error: String });
</script>

<template>
  <div>
    <label v-if="definition.title" v-text="definition.title" class="s-label" />
    <div>
      <slot />
      <div
        :class="[
          'bg-pink-100 text-red text-sm relative -z-10 transition-all duration-200 flex items-center px-3 pb-1 pt-4 rounded-b-3xl',
          !!error ? '-mt-[21px] opacity-100' : '-mt-[52px] opacity-0'
        ]"
      >
        <Icon name="warning" class="text-red-500 mr-2" />
        {{ error || 'Not valid' }}
      </div>
    </div>
    <span v-if="definition.description" v-text="definition.description" />
  </div>
</template>
