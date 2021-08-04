<script setup>
import { computed, defineProps } from 'vue';

import { getInstance } from '@snapshot-labs/lock/plugins/vue3';
import { useWeb3 } from '@/composables/useWeb3';

const props = defineProps({
  space: Object
});

const auth = getInstance();
const { web3 } = useWeb3();

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
      <div class="text-center border-bottom header-bg">
        <Token :space="space" symbolIndex="space" size="80" class="mt-3 mb-2" />
        <h3 class="mb-3 px-4">{{ space.name }}</h3>
      </div>
      <div class="py-3">
        <router-link
          :to="{ name: 'proposals', params: { key: space.key } }"
          v-text="$t('proposals.header')"
          :class="$route.name === 'proposals' && 'router-link-exact-active'"
          class="d-block px-4 py-2 sidenav-item"
        />
        <router-link
          :to="{ name: 'create', params: { key: space.key } }"
          v-text="$t('proposals.new')"
          class="d-block px-4 py-2 sidenav-item"
        />
        <router-link
          v-if="
            space.strategies.find(strategy => strategy.name === 'delegation')
          "
          :to="{ name: 'delegate', params: { key: space.key } }"
          v-text="$t('delegate.header')"
          class="d-block px-4 py-2 sidenav-item"
        />
        <router-link
          :to="{ name: 'about', params: { key: space.key } }"
          v-text="$t('about')"
          :class="$route.name === 'about' && 'router-link-exact-active'"
          class="d-block px-4 py-2 sidenav-item"
        />
        <router-link
          v-if="isAdmin"
          :to="{ name: 'settings' }"
          v-text="$t('settings.header')"
          class="d-block px-4 py-2 sidenav-item"
        />
      </div>
    </Block>
  </div>
</template>
