<template>
  <span>
    <UiLabel v-if="isCore" class="ml-1">Core</UiLabel>
    <Icon v-if="isVerified" name="check" class="ml-1" title="Verified" />
  </span>
</template>

<script>
export default {
  props: ['address', 'space'],
  computed: {
    isCore() {
      try {
        const { toBech32Address } = window.zilPay.crypto;

        return this.space && this.space.members
          ? this.space.members.includes(toBech32Address(this.address))
          : false;
      } catch {
        return false;
      }
    },
    isVerified() {
      return false;
    }
  }
};
</script>
