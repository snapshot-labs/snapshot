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
  <div class="-mt-[4px] mb-4 md:mt-0 lg:fixed lg:mb-0 lg:w-[240px]">
    <BaseBlock slim class="overflow-hidden !border-t-0 md:!border-t">
      <div class="relative lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
        <SpaceSidebarHeader :space="space" />
        <SpaceSidebarNavigation :space="space" class="lg:mt-0" />
        <SpaceSidebarSubspaces :space="space" class="hidden lg:flex" />
        <SpaceSidebarFooter :space="space" class="hidden lg:flex" />
        <div
          class="absolute -top-1 right-[16px] md:right-[12px] md:top-[10px] lg:right-[10px]"
        >
          <BaseMenu
            class="md:ml-2"
            :items="threeDotItems"
            @select="handleSelect"
          >
            <template #button>
              <div>
                <BaseButtonIcon :loading="false">
                  <i-ho-dots-horizontal class="text-[18px]" />
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
