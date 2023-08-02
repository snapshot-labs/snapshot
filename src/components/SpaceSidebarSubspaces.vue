<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const mainSpace = computed(() => {
  return props.space?.parent?.children?.some(
    child => child.id === props.space?.id
  )
    ? props.space?.parent
    : null;
});

const subSpaces = computed(() => {
  return props.space?.children || [];
});
</script>

<template>
  <div v-if="mainSpace || subSpaces.length" class="my-3">
    <div v-if="mainSpace">
      <h5 class="px-4 font-normal text-skin-text">{{ $t('mainspace') }}</h5>
      <LinkSpace :space-id="mainSpace.id">
        <BaseSidebarNavigationItem class="flex items-center">
          <AvatarSpace :space="mainSpace" size="22" />
          <span class="mx-2 truncate">
            {{ mainSpace.name }}
          </span>
        </BaseSidebarNavigationItem>
      </LinkSpace>
    </div>
    <div v-if="subSpaces?.length">
      <h5 class="px-4 font-normal text-skin-text">{{ $t('subspaces') }}</h5>
      <LinkSpace
        v-for="subSpace in subSpaces"
        :key="subSpace.id"
        :space-id="subSpace.id"
      >
        <BaseSidebarNavigationItem class="flex items-center">
          <AvatarSpace :space="subSpace" size="22" />
          <span class="mx-2 truncate">
            {{ subSpace.name }}
          </span>
        </BaseSidebarNavigationItem>
      </LinkSpace>
    </div>
  </div>
</template>
