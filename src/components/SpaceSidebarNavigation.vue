<script setup>
import { computed } from 'vue';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useWeb3 } from '@/composables/useWeb3';

const props = defineProps({
  space: {
    type: Object,
    default: null
  }
});

const auth = getInstance();
const { web3Account } = useWeb3();

const isAdmin = computed(() => {
  const admins = props.space?.admins?.map(address => address.toLowerCase());

  return (
    auth.isAuthenticated.value &&
    web3Account.value &&
    admins?.includes(web3Account.value.toLowerCase())
  );
});
</script>

<template>
  <div class="py-3">
    <router-link
      :to="{ name: 'spaceProposals' }"
      v-text="$t('proposals.header')"
      :class="$route.name === 'spaceProposals' && 'router-link-exact-active'"
      class="block px-4 py-2 sidenav-item hover:bg-skin-bg"
    />
    <router-link
      :to="{ name: 'spaceCreate' }"
      v-text="$t('proposals.new')"
      class="block px-4 py-2 sidenav-item hover:bg-skin-bg"
    />
    <router-link
      v-if="
        space &&
        space.strategies?.find(strategy => strategy.name === 'delegation')
      "
      :to="{ name: 'delegate', params: { key: space.id } }"
      v-text="$t('delegate.header')"
      class="block px-4 py-2 sidenav-item hover:bg-skin-bg"
    />
    <router-link
      :to="{ name: 'spaceAbout' }"
      v-text="$t('about')"
      :class="$route.name === 'spaceAbout' && 'router-link-exact-active'"
      class="block px-4 py-2 sidenav-item hover:bg-skin-bg"
    />
    <router-link
      v-if="isAdmin"
      :to="{ name: 'spaceSettings' }"
      v-text="$t('settings.header')"
      class="block px-4 py-2 sidenav-item hover:bg-skin-bg"
    />
  </div>
</template>
