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
        class="pointer-events-auto w-full px-4 sm:max-w-[460px]"
      >
        <div
          class="flex w-full items-center justify-between rounded-full bg-red px-[18px] py-[12px] text-white"
          :class="`!bg-${item.type}`"
        >
          <div class="flex items-center gap-2">
            <i-ho-x v-if="item.type === 'red'" class="shrink-0 text-base" />
            <i-ho-check
              v-if="item.type === 'green'"
              class="shrink-0 text-base"
            />
            <span class="text-left">{{ item.message }}</span>
          </div>

          <i-ho-x
            class="shrink-0 cursor-pointer text-base"
            @click="item.remove()"
          />
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>
