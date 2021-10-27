<script setup>
import { useNotifications } from '@/composables/useNotifications';

const { items } = useNotifications();
</script>

<template>
  <div class="fixed left-0 right-0 bottom-0 text-center" style="z-index: 99999">
    <transition-group name="fade" tag="div" class="mb-4">
      <div v-for="item in items" :key="item.id" class="mb-2">
        <UiButton
          class="notification inline-block !border-none !bg-red"
          :class="`!bg-${item.type}`"
          @click="item.remove()"
        >
          {{ item.message }}
        </UiButton>
      </div>
    </transition-group>
  </div>
</template>
