<template>
  <span
    :class="stateClass"
    v-text="$t(`proposals.states.${state}`)"
    class="State text-normal"
  />
</template>

<script>
import { computed } from 'vue';
export default {
  props: {
    state: String
  },
  setup(props) {
    const stateClass = computed(() => {
      if (props.state === 'closed') return 'bg-purple';
      if (props.state === 'active') return 'bg-green';
      return '';
    });

    return { stateClass };
  }
};
</script>
