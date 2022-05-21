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
  <div>
    <router-link :to="{ name: 'spaceProposals' }" v-slot="{ isExactActive }">
      <BaseSidebarNavigationItem :isActive="isExactActive">
        {{ $t('proposals.header') }}
      </BaseSidebarNavigationItem>
    </router-link>
    <router-link :to="{ name: 'spaceCreate' }" v-slot="{ isExactActive }">
      <BaseSidebarNavigationItem :isActive="isExactActive">
        {{ $t('proposals.new') }}
      </BaseSidebarNavigationItem>
    </router-link>
    <router-link
      v-if="
        space &&
        space.strategies?.find(strategy => strategy.name === 'delegation')
      "
      :to="{ name: 'delegate', params: { key: space.id } }"
      v-slot="{ isExactActive }"
    >
      <BaseSidebarNavigationItem :isActive="isExactActive">
        {{ $t('delegate.header') }}
      </BaseSidebarNavigationItem>
    </router-link>
    <router-link :to="{ name: 'spaceAbout' }" v-slot="{ isExactActive }">
      <BaseSidebarNavigationItem :isActive="isExactActive">
        {{ $t('about') }}
      </BaseSidebarNavigationItem>
    </router-link>
    <router-link
      v-if="isAdmin"
      :to="{ name: 'spaceSettings' }"
      v-slot="{ isExactActive }"
    >
      <BaseSidebarNavigationItem :isActive="isExactActive">
        {{ $t('settings.header') }}
      </BaseSidebarNavigationItem>
    </router-link>
  </div>
</template>
