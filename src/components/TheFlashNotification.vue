<script setup>
const { items } = useFlashNotification();
</script>

<template>
  <div
    class="pointer-events-none fixed bottom-0 left-0 right-0 z-[60] mb-4 flex w-full flex-col items-center space-y-2"
  >
    <TransitionGroup name="fade">
      <div
        v-for="item in items"
        :key="item.id"
        class="pointer-events-auto w-full px-4 sm:max-w-[420px]"
      >
        <BaseButton
          class="flex w-full items-center justify-between !border-none bg-red !text-white"
          :class="`!bg-${item.type}`"
        >
          <div class="flex items-center gap-2">
            <i-ho-x v-if="item.type === 'red'" class="text-base" />
            <i-ho-check v-if="item.type === 'green'" class="text-base" />
            <span>{{ item.message }}</span>
          </div>

          <i-ho-x class="text-base" @click="item.remove()" />
        </BaseButton>
      </div>
    </TransitionGroup>
  </div>
</template>
