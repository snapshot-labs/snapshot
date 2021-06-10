<template>
  <span
    :class="stateClass"
    v-text="$t(`proposals.states.${state}`)"
    class="State text-normal"
  />
</template>

<script>
export default {
  props: {
    state: String
  },
  computed: {
    stateClass() {
      if (this.state === 'closed') return 'bg-purple';
      if (this.state === 'active') return 'bg-green';
      return '';
    }
  }
};
</script>
