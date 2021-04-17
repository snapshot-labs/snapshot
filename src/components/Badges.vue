<template>
  <UiLabel v-if="isCore" class="ml-1">
    {{ $t('isCore') }}
  </UiLabel>
</template>

<script>
export default {
  props: ['address', 'members'],
  computed: {
    isCore() {
      if (!this.members) return false;
      const members = this.members.map(address => address.toLowerCase());
      return members.includes(this.address.toLowerCase());
    },
    isVerified() {
      return false;
    }
  }
};
</script>
