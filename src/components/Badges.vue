<template>
  <span>
    <UiLabel v-if="isCore" class="ml-1">Core</UiLabel>
    <Icon v-if="isVerified" name="check" class="ml-1" title="Verified" />
  </span>
</template>

<script>
export default {
  props: ['address', 'namespace'],
  computed: {
    isCore() {
      return this.namespace && this.namespace.core
        ? this.namespace.core.includes(this.address)
        : false;
    },
    isVerified() {
      return false;
    }
  }
};
</script>
