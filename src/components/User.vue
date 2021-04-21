<template>
  <span>
    <a @click="modalOpen = true" class="no-wrap">
      <Avatar :profile="profile" :address="address" size="16" class="mr-1" />
      {{ name }}
      <Badges :address="address" :space="space" />
    </a>
    <teleport to="#modal">
      <ModalUser
        :profile="profile"
        :open="modalOpen"
        @close="modalOpen = false"
        :space="space"
        :address="address"
        :vname="vname"
      />
    </teleport>
  </span>
</template>

<script>
import { HarmonyAddress } from '@harmony-js/crypto';

export default {
  props: ['address', 'space', 'profile', 'vname'],
  data() {
    return {
      modalOpen: false
    };
  },
  computed: {
    name() {
      if (
        this.web3.account &&
        new HarmonyAddress(this.address).checksum ===
          new HarmonyAddress(this.web3.account).checksum
      ) {
        return 'You';
      }
      if (this.vname) {
        return this._shorten(this.vname, 22);
      } else if (this.profile?.name) {
        return this.profile.name;
      } else if (this.profile?.ens) {
        return this.profile.ens;
      }
      return this._shorten(new HarmonyAddress(this.address).bech32);
    }
  }
};
</script>
