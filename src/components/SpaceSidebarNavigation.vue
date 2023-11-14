<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import legacySpaces from '@/../snapshot-spaces/spaces/legacy.json';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const hasDelegationStrategy = computed(() => {
  return props.space.strategies?.some(
    strategy =>
      strategy.name.includes('delegation') ||
      JSON.stringify(strategy.params).includes('"delegation"')
  );
});

const hasDelegatesSettings = computed(() => {
  return props.space.delegationPortal?.delegationType;
});

const isLegacySpace = computed(() => {
  return Object.keys(legacySpaces).includes(props.space.id);
});
</script>

<template>
  <div class="no-scrollbar mt-4 flex overflow-y-auto lg:my-3 lg:block">
    <router-link v-slot="{ isExactActive }" :to="{ name: 'spaceProposals' }">
      <BaseSidebarNavigationItem :is-active="isExactActive">
        {{ $t('proposals.header') }}
      </BaseSidebarNavigationItem>
    </router-link>
    <router-link
      v-if="hasDelegationStrategy"
      v-slot="{ isExactActive }"
      :to="{ name: 'delegate', params: { key: space.id } }"
    >
      <BaseSidebarNavigationItem :is-active="isExactActive">
        {{ $t('delegate.header') }}
      </BaseSidebarNavigationItem>
    </router-link>
    <router-link
      v-if="hasDelegatesSettings"
      v-slot="{ isActive }"
      :to="{ name: 'spaceDelegates' }"
    >
      <BaseSidebarNavigationItem :is-active="isActive">
        {{ $t('delegates.header') }}
      </BaseSidebarNavigationItem>
    </router-link>
    <router-link
      v-if="space.treasuries.length"
      v-slot="{ isActive }"
      :to="{ name: 'spaceTreasury' }"
    >
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
      v-if="!isLegacySpace"
      v-slot="{ isExactActive }"
      :to="{ name: 'spaceSettings' }"
    >
      <BaseSidebarNavigationItem :is-active="isExactActive">
        {{ $t('settings.header') }}
      </BaseSidebarNavigationItem>
    </router-link>
  </div>
</template>
