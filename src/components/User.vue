<template>
  <span>
    <a @click="modalOpen = true" class="no-wrap">
      <Avatar :address="address" size="16" class="mr-1" />
      {{ name }}
      <Badges :address="address" :space="space" />
    </a>
    <portal to="modal">
      <ModalUser
        :open="modalOpen"
        @close="modalOpen = false"
        :space="space"
        :address="address"
      />
    </portal>
  </span>
</template>

<script>
export default {
  props: ['address', 'space'],
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
