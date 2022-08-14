<script setup lang="ts">
import { computed } from 'vue';
import { ExtendedSpace } from '@/helpers/interfaces';

import { useApp } from '@/composables';

const { domain } = useApp();

const props = defineProps<{
  space: ExtendedSpace;
}>();

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
  <div v-if="mainSpace || subSpaces.length" class="my-3">
    <div v-if="mainSpace">
      <h5 class="px-4 font-normal text-skin-text">{{ $t('mainspace') }}</h5>
      <BaseLink
        :link="
          domain
            ? `https://snapshot.org/#/${mainSpace.id}`
            : { name: 'spaceProposals', params: { key: mainSpace.id } }
        "
        hide-external-icon
      >
        <BaseSidebarNavigationItem class="flex items-center">
          <AvatarSpace :space="mainSpace" size="22" />
          <span class="mx-2 truncate">
            {{ mainSpace.name }}
          </span>
        </BaseSidebarNavigationItem>
      </BaseLink>
    </div>
    <div v-if="subSpaces?.length">
      <h5 class="px-4 font-normal text-skin-text">{{ $t('subspaces') }}</h5>
      <BaseLink
        v-for="subSpace in subSpaces"
        :key="subSpace.id"
        :link="
          domain
            ? `https://snapshot.org/#/${subSpace.id}`
            : { name: 'spaceProposals', params: { key: subSpace.id } }
        "
        hide-external-icon
      >
        <BaseSidebarNavigationItem class="flex items-center">
          <AvatarSpace :space="subSpace" size="22" />
          <span class="mx-2 truncate">
            {{ subSpace.name }}
          </span>
        </BaseSidebarNavigationItem>
      </BaseLink>
    </div>
  </div>
</template>
