<script setup lang="ts">
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
        :level="item.type"
        @close="item.remove()"
      >
        <template #message>
          <i18n-t
            :keypath="`modalNotifications.${item.description}.message`"
            tag="span"
            scope="global"
          >
            <template #discord>
              <BaseLink link="https://discord.snapshot.org">Discord</BaseLink>
            </template>
          </i18n-t>
        </template>
      </ModalMessage>
    </template>
  </teleport>
</template>
