<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import SpaceSidebarSubspaces from './SpaceSidebarSubspaces.vue';

defineProps<{ space: ExtendedSpace }>();

const { t } = useI18n();

const threeDotItems = computed(() => {
  const items = [{ text: t('report'), action: 'report' }];
  return items;
});

function handleSelect(e) {
  if (e === 'report') window.open('https://tally.so/r/mKzXo7', '_blank');
}
</script>

<template>
  <div class="mb-4 lg:fixed lg:mb-0 lg:w-[240px]">
    <BaseBlock slim class="overflow-hidden">
      <div class="relative lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
        <SpaceSidebarHeader :space="space" />
        <SpaceSidebarNavigation :space="space" class="lg:mt-0" />
        <SpaceSidebarSubspaces :space="space" class="hidden lg:flex" />
        <SpaceSidebarFooter :space="space" class="hidden lg:flex" />
        <div
          class="absolute right-[20px] top-2 md:bottom-2 md:top-auto lg:bottom-auto lg:right-2 lg:top-2"
        >
          <BaseMenu
            class="md:ml-2"
            :items="threeDotItems"
            @select="handleSelect"
          >
            <template #button>
              <div>
                <BaseButtonIcon :loading="false">
                  <i-ho-dots-horizontal />
                </BaseButtonIcon>
              </div>
            </template>
            <template #item="{ item }">
              <div class="flex items-center gap-2">
                <i-ho-document-duplicate v-if="item.action === 'duplicate'" />
                <i-ho-flag v-if="item.action === 'report'" />
                <i-ho-trash v-if="item.action === 'delete'" />
                {{ item.text }}
              </div>
            </template>
          </BaseMenu>
        </div>
      </div>
    </BaseBlock>
  </div>
</template>
