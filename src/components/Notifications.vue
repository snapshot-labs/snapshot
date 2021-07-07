<template>
  <div
    class="position-fixed left-0 right-0 bottom-0 text-center"
    style="z-index: 99999"
  >
    <div class="mb-4">
      <div v-for="(item, key) in items" :key="key" class="mb-2">
        <UiButton
          class="notification d-inline-block anim-scale-in border-0"
          :class="`bg-${item.type}`"
          v-if="now < item.timestamp + duration && !item.hide"
          @click="item.hide = true"
        >
          {{ item.message }}
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';

const DURATION = 4000;

export default {
  setup() {
    const store = useStore();

    const now = ref(Date.now());
    const duration = ref(DURATION);

    const items = computed(() => store.state.notifications.items);

    setInterval(() => (now.value = Date.now()), 1000);

    return { now, duration, items };
  }
};
</script>
