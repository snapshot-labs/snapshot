<template>
  <span>
    <a @click="modalOpen = true" class="no-wrap">
      <Avatar :profile="profile" :address="address" size="16" class="mr-1" />
      {{ name }}
      <Badges :address="address" :space="space" />
    </a>
    <portal to="modal">
      <ModalUser
        :profile="profile"
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
  props: ['address', 'space', 'profile'],
  data() {
    return {
      modalOpen: false
    };
  },
  computed: {
    name() {
      if (this.profile?.name) {
        return this.profile.name;
      }
      return this.web3.account &&
        this.address.toLowerCase() === this.web3.account.toLowerCase()
        ? 'You'
        : this._shorten(this.address);
    }
  }
};
</script>
