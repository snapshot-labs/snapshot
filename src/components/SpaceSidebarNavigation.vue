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

const mainSpace = computed(() => {
  return props.space?.parent?.children?.find(
    child => child.id === props.space?.id
  )
    ? props.space?.parent
    : null;
});

const subSpaces = computed(() => {
  return props.space?.children?.filter(
    space => space.parent?.id === props.space?.id
  );
});
</script>

<template>
  <div>
    <div v-if="mainSpace" class="mb-3">
      <h5 class="px-4 text-skin-text">{{ $t('mainspace') }}</h5>
      <router-link
        :to="{ name: 'spaceProposals', params: { key: mainSpace.id } }"
      >
        <BaseSidebarNavigationItem class="flex items-center">
          <AvatarSpace :space="mainSpace" size="22" />
          <span class="mx-2 truncate">
            {{ mainSpace.name }}
          </span>
          <BaseCounter
            :counter="mainSpace.followersCount"
            class="ml-auto inline-block"
          />
        </BaseSidebarNavigationItem>
      </router-link>
    </div>
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
      v-if="
        space &&
        space.strategies?.find(strategy => strategy.name === 'delegation')
      "
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
    <div v-if="subSpaces?.length">
      <h5 class="mt-3 px-4 text-skin-text">{{ $t('subspaces') }}</h5>
      <router-link
        v-for="subSpace in subSpaces"
        :key="subSpace.id"
        :to="{ name: 'spaceProposals', params: { key: subSpace.id } }"
      >
        <BaseSidebarNavigationItem class="flex items-center">
          <AvatarSpace :space="subSpace" size="22" />
          <span class="mx-2 truncate">
            {{ subSpace.name }}
          </span>
          <BaseCounter
            :counter="subSpace.followersCount"
            class="ml-auto inline-block"
          />
        </BaseSidebarNavigationItem>
      </router-link>
    </div>
  </div>
</template>
