<script setup lang="ts">
import { useModalNotification } from '@/composables';
import defaults from '@/locales/default.json';

const { items } = useModalNotification();
</script>

<template>
  <teleport to="#modal">
    <template v-for="item in items" :key="item.id">
      <ModalMessage
        v-if="defaults.modalNotifications?.[item.description]"
        :open="items.length > 0"
        :title="$t(`modalNotifications.${item.description}.title`)"
        :message="$t(`modalNotifications.${item.description}.message`)"
        :level="item.type"
        @close="item.remove()"
      >
      </ModalMessage>
    </template>
  </teleport>
</template>
