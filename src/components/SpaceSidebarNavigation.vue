<script setup lang="ts">
import { computed } from 'vue';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useWeb3 } from '@/composables';
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const auth = getInstance();
const { web3Account } = useWeb3();

const isAdmin = computed(() => {
  const admins = props.space.admins?.map(address => address.toLowerCase());

  return (
    auth.isAuthenticated.value &&
    web3Account.value &&
    admins?.includes(web3Account.value.toLowerCase())
  );
});
</script>

<template>
  <div class="no-scrollbar flex overflow-y-auto lg:block">
    <router-link v-slot="{ isExactActive }" :to="{ name: 'spaceProposals' }">
      <BaseSidebarNavigationItem :is-active="isExactActive">
        {{ $t('proposals.header') }}
      </BaseSidebarNavigationItem>
    </router-link>
    <router-link
      v-slot="{ isExactActive }"
      :to="{ name: 'spaceCreate', params: { step: 1 } }"
      data-testid="create-proposal-button"
    >
      <BaseSidebarNavigationItem :is-active="isExactActive">
        {{ $t('proposals.new') }}
      </BaseSidebarNavigationItem>
    </router-link>
    <router-link
      v-if="space.strategies?.find(strategy => strategy.name === 'delegation')"
      v-slot="{ isExactActive }"
      :to="{ name: 'delegate', params: { key: space.id } }"
    >
      <BaseSidebarNavigationItem :is-active="isExactActive">
        {{ $t('delegate.header') }}
      </BaseSidebarNavigationItem>
    </router-link>
    <router-link v-slot="{ isActive }" :to="{ name: 'spaceTreasury' }">
      <BaseSidebarNavigationItem :is-active="isActive">
        {{ $t('treasury.title') }}
      </BaseSidebarNavigationItem>
    </router-link>
    <router-link v-slot="{ isExactActive }" :to="{ name: 'spaceAbout' }">
      <BaseSidebarNavigationItem :is-active="isExactActive">
        {{ $t('about') }}
      </BaseSidebarNavigationItem>
    </router-link>
    <router-link
      v-if="isAdmin"
      v-slot="{ isExactActive }"
      :to="{ name: 'spaceSettings' }"
    >
      <BaseSidebarNavigationItem :is-active="isExactActive">
        {{ $t('settings.header') }}
      </BaseSidebarNavigationItem>
    </router-link>
  </div>
</template>
