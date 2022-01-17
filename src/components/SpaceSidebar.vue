<script setup>
import { computed } from 'vue';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useWeb3 } from '@/composables/useWeb3';

const props = defineProps({
  space: Object,
  spaceId: String
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
  <div style="position: fixed; width: 240px">
    <Block :slim="true" class="overflow-hidden">
      <SpaceSidebarHeader :space="space" :spaceId="spaceId" />
      <div class="py-3">
        <router-link
          :to="{ name: 'spaceProposals', params: { key: spaceId } }"
          v-text="$t('proposals.header')"
          :class="
            $route.name === 'spaceProposals' && 'router-link-exact-active'
          "
          class="block px-4 py-2 sidenav-item"
        />
        <router-link
          :to="{ name: 'spaceCreate', params: { key: spaceId } }"
          v-text="$t('proposals.new')"
          class="block px-4 py-2 sidenav-item"
        />
        <router-link
          v-if="
            space &&
            space.strategies?.find(strategy => strategy.name === 'delegation')
          "
          :to="{ name: 'delegate', params: { key: spaceId } }"
          v-text="$t('delegate.header')"
          class="block px-4 py-2 sidenav-item"
        />
        <router-link
          :to="{ name: 'spaceAbout', params: { key: spaceId } }"
          v-text="$t('about')"
          :class="$route.name === 'spaceAbout' && 'router-link-exact-active'"
          class="block px-4 py-2 sidenav-item"
        />
        <router-link
          v-if="isAdmin"
          :to="{ name: 'spaceSettings' }"
          v-text="$t('settings.header')"
          class="block px-4 py-2 sidenav-item"
        />
      </div>
    </Block>
  </div>
</template>
