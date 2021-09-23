<script setup>
import { computed } from 'vue';
import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useWeb3 } from '@/composables/useWeb3';
import { useApp } from '@/composables/useApp';

const props = defineProps({
  space: Object
});

const auth = getInstance();
const { web3 } = useWeb3();

const { explore } = useApp();

const nbrMembers = explore.value.spaces[props.space.id].followers;

const web3Account = computed(() => web3.value.account);

const isAdmin = computed(() => {
  const admins = props.space.admins.map(address => address.toLowerCase());
  return (
    auth.isAuthenticated.value &&
    web3Account.value &&
    admins.includes(web3Account.value.toLowerCase())
  );
});
</script>

<template>
  <div style="position: fixed; width: 240px">
    <Block :slim="true" class="overflow-hidden">
      <div class="text-center border-b bg-skin-header-bg">
        <Token :space="space" symbolIndex="space" size="80" class="mt-3 mb-2" />
        <h3 class="mb-[2px]">{{ space.name }}</h3>
        <div class="mb-[12px] text-color">
          {{ $tc('members', nbrMembers,{count:_n(nbrMembers)}) }}
        </div>
        <FollowButton :space="space" />
      </div>
      <div class="py-3">
        <router-link
          :to="{ name: 'spaceProposals', params: { key: space.id } }"
          v-text="$t('proposals.header')"
          :class="
            $route.name === 'spaceProposals' && 'router-link-exact-active'
          "
          class="block px-4 py-2 sidenav-item"
        />
        <router-link
          :to="{ name: 'spaceCreate', params: { key: space.id } }"
          v-text="$t('proposals.new')"
          class="block px-4 py-2 sidenav-item"
        />
        <router-link
          v-if="
            space.strategies.find(strategy => strategy.name === 'delegation')
          "
          :to="{ name: 'delegate', params: { key: space.id } }"
          v-text="$t('delegate.header')"
          class="block px-4 py-2 sidenav-item"
        />
        <router-link
          :to="{ name: 'spaceAbout', params: { key: space.id } }"
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
