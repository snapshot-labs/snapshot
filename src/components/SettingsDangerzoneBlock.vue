<script setup lang="ts">
import { shorten } from '@/helpers/utils';

const props = defineProps<{
  isController: boolean;
  ensOwner: string | null;
  isOwner: boolean;
  isSettingEnsRecord: boolean;
  isDeleting: boolean;
}>();

const emit = defineEmits(['changeController', 'deleteSpace']);

const { t } = useI18n();

const items = computed(() => [
  {
    title: t('settings.dangerZone.changeController.title'),
    description: t('settings.dangerZone.changeController.information'),
    button: t('settings.dangerZone.changeController.button'),
    disabled: !props.isOwner,
    disabledInformation: t(
      'settings.dangerZone.changeController.disabledInformation',
      { owner: shorten(props.ensOwner || '') }
    ),
    action: () => emit('changeController'),
    loading: props.isSettingEnsRecord
  },
  {
    title: t('settings.dangerZone.deleteSpace.title'),
    description: t('settings.dangerZone.deleteSpace.information'),
    button: t('settings.dangerZone.deleteSpace.button'),
    disabled: !props.isController,
    disabledInformation: t(
      'settings.dangerZone.deleteSpace.disabledInformation'
    ),
    action: () => emit('deleteSpace'),
    loading: props.isDeleting
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
          <div class="font-semibold text-skin-heading">
            {{ item.title }}
          </div>
          <div>
            {{ item.description }}
          </div>
        </div>
        <div
          v-tippy="{ content: item.disabled ? item.disabledInformation : '' }"
        >
          <BaseButton
            variant="danger"
            class="ml-4 whitespace-nowrap"
            :disabled="item.disabled"
            :loading="item.loading"
            @click="item.disabled ? null : item.action()"
          >
            {{ item.button }}
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseBlock>
</template>
