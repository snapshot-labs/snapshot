<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from '@/composables';

const props = defineProps<{
  isController: boolean;
  isOwner: boolean;
}>();

const { t } = useI18n();

const items = computed(() => [
  {
    title: t('settings.dangerZone.changeController.title'),
    description: t('settings.dangerZone.changeController.information'),
    button: t('settings.dangerZone.changeController.button'),
    disabled: !props.isOwner,
    disabledInformation: t(
      'settings.dangerZone.changeController.disabledInformation'
    )
  },

  {
    title: t('settings.dangerZone.deleteSpace.title'),
    description: t('settings.dangerZone.deleteSpace.information'),
    button: t('settings.dangerZone.deleteSpace.button'),
    disabled: !props.isController,
    disabledInformation: t(
      'settings.dangerZone.deleteSpace.disabledInformation'
    )
  }
]);
</script>

<template>
  <BaseBlock slim :title="$t('settings.dangerZone.title')">
    <div class="">
      <div
        v-for="item in items"
        :key="item.title"
        class="flex items-center justify-between border-b px-4 py-3 last:border-b-0"
      >
        <div>
          <div class="font-semibold">
            {{ item.title }}
          </div>
          <div class="opacity-80">
            {{ item.description }}
          </div>
        </div>
        <div
          v-tippy="{ content: item.disabled ? item.disabledInformation : '' }"
        >
          <BaseButton
            variant="danger"
            class="whitespace-nowrap"
            :disabled="item.disabled"
          >
            {{ item.button }}
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseBlock>
</template>
