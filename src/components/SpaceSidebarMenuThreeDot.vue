<script setup lang="ts">
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
  <div>
    <BaseMenu :items="threeDotItems" @select="handleSelect">
      <template #button>
        <div>
          <BaseButtonIcon :loading="false">
            <i-ho-dots-horizontal class="text-[17px]" />
          </BaseButtonIcon>
        </div>
      </template>
      <template #item="{ item }">
        <div class="flex items-center gap-2">
          <i-ho-flag v-if="item.action === 'report'" />
          {{ item.text }}
        </div>
      </template>
    </BaseMenu>
  </div>
</template>
