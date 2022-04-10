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

// a space is a parent space if it has children and at least one of them has this space as parent
const isParent = computed(() => {
  return (
    props.space?.children?.length > 0 &&
    props.space?.children?.some(child => child.parent?.id === props.space.id)
  );
});

// a space is a child if it is not a parent itself but has a parent and the parent has this space as child
const isChild = computed(() => {
  return (
    !isParent.value &&
    props.space?.parent?.id &&
    props.space?.parent?.children?.some(child => child.id === props.space.id)
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
  <div v-if="isChild">
    <div class="px-4 text-skin-text opacity-80">
      {{ $t('subSpaces.mainSpace') }}
    </div>
    <router-link
      :to="{ name: 'spaceProposals', params: { key: space.parent.id } }"
      class="flex items-center px-4 py-2 sidenav-item hover:bg-skin-bg"
    >
      <AvatarSpace :space="space.parent" size="28" />
      <span class="truncate mx-2">
        {{ space.parent.name }}
      </span>
      <BaseCounter
        :counter="space.parent.followersCount"
        class="ml-auto inline-block"
      />
    </router-link>
  </div>
  <div v-if="isParent">
    <div class="px-4 text-skin-text opacity-80">
      {{ $t('subSpaces.subSpaces') }}
    </div>
    <router-link
      v-for="child in space.children.filter(child => child.parent?.id === space.id).sort((a, b) => b.followersCount - a.followersCount)"
      :key="child.id"
      :to="{ name: 'spaceProposals', params: { key: child.id } }"
      class="flex items-center px-4 py-2 sidenav-item hover:bg-skin-bg"
    >
      <AvatarSpace :space="child" size="28" />
      <span class="truncate mx-2">
        {{ child.name }}
      </span>
      <BaseCounter
        :counter="child.followersCount"
        class="ml-auto inline-block"
      />
    </router-link>
  </div>
</template>
