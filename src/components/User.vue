<template>
  <span>
    <a @click="modalOpen = true" target="_blank">
      <Avatar :address="address" size="16" class="mr-1" />
      {{ name }}
      <Badges :address="address" :namespace="namespace" />
    </a>
    <ModalUser
      :open="modalOpen"
      @close="modalOpen = false"
      :address="address"
    />
  </span>
</template>

<script>
export default {
  props: ['address', 'namespace'],
  data() {
    return {
      modalOpen: false
    };
  },
  computed: {
    name() {
      return this.web3.account &&
        this.address.toLowerCase() === this.web3.account.toLowerCase()
        ? 'You'
        : this._shorten(this.address);
    }
  }
};
</script>
