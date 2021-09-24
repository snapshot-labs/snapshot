<script setup>
import { useNotifications } from '@/composables/useNotifications';

const duration = 4000;

const { items } = useNotifications();

let now = $ref(Date.now());

setInterval(() => (now = Date.now()), 1000);
</script>

<template>
  <div
    v-if="items.some(i => now < i.timestamp + duration && !i.hide)"
    class="fixed left-0 right-0 bottom-0 text-center"
    style="z-index: 99999"
  >
    <div class="mb-4">
      <div v-for="(item, key) in items" :key="key" class="mb-2">
        <UiButton
          class="notification inline-block anim-scale-in border-none bg-red"
          :class="`!bg-${item.type}`"
          v-if="now < item.timestamp + duration && !item.hide"
          @click="item.hide = true"
        >
          {{ item.message }}
        </UiButton>
      </div>
    </div>
  </div>
</template>
