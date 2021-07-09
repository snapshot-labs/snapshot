<template>
  <UiLabel v-if="isCore" class="ml-1">
    {{ $t('isCore') }}
  </UiLabel>
</template>

<script>
import { computed } from 'vue';

export default {
  props: { address: String, members: Object },
  setup(props) {
    const isCore = computed(() => {
      if (!props.members) return false;
      const members = props.members.map(address => address.toLowerCase());
      return members.includes(props.address.toLowerCase());
    });
    const isVerified = computed(() => false);

    return { isCore, isVerified };
  }
};
</script>
