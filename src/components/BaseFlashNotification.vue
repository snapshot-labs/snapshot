<script setup>
import { useFlashNotification } from '@/composables/useFlashNotification';

const { items } = useFlashNotification();
</script>

<template>
  <div
    class="pointer-events-none fixed left-0 right-0 bottom-0 z-[60] mb-4 flex flex-col items-center space-y-2"
  >
    <TransitionGroup name="fade">
      <div v-for="item in items" :key="item.id" class="pointer-events-auto">
        <BaseButton
          class="flex items-center space-x-2 !border-none !bg-red !text-white"
          :class="`!bg-${item.type}`"
          @click="item.remove()"
        >
          <BaseIcon
            v-if="item.type === 'red'"
            name="close1"
            size="20"
            class="align-middle"
          />
          <BaseIcon
            v-if="item.type === 'green'"
            name="check1"
            size="20"
            class="align-middle"
          />
          <span>{{ item.message }}</span>
        </BaseButton>
      </div>
    </TransitionGroup>
  </div>
</template>
