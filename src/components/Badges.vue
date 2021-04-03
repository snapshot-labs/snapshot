<template>
  <span v-if="space">
    <UiLabel v-if="isCore" class="ml-1">{{ $t('isCore') }}</UiLabel>
    <Icon v-if="isVerified" name="check" class="ml-1" title="Verified" />
  </span>
</template>

<script>
export default {
  props: ['address', 'space'],
  computed: {
    isCore() {
      if (!this.space || !this.space.members) return false;
      const members = this.space.members.map(address => address.toLowerCase());
      return members.includes(this.address.toLowerCase());
    },
    isVerified() {
      return false;
    }
  }
};
</script>
