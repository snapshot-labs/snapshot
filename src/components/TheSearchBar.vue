<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '@/composables';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const routeQuery = computed(() => route.query.q || '');
const searchOptions = computed(() => [
  {
    text: t('spaces'),
    action: 'spaces',
    extras: { selected: route.query.type === 'spaces' }
  },
  {
    text: t('networks'),
    action: 'networks',
    extras: { selected: route.query.type === 'networks' }
  },
  {
    text: t('strategiesPage'),
    action: 'strategies',
    extras: { selected: route.query.type === 'strategies' }
  },
  {
    text: t('plugins'),
    action: 'plugins',
    extras: { selected: route.query.type === 'plugins' }
  }
]);

const searchSelectedOption = computed(
  () =>
    searchOptions.value.find(option => option.action === route.query.type)
      ?.text ?? 'Spaces'
);

function redirectSearch(e) {
  router.push({
    query: { q: routeQuery.value || undefined, type: e }
  });
}
</script>

<template>
  <div class="flex">
    <BaseSearch
      :model-value="routeQuery"
      :placeholder="$t('searchPlaceholder')"
      class="flex-auto pr-2"
    />
    <div class="flex items-center border-l" style="height: 44px">
      <BaseMenu :items="searchOptions" @select="redirectSearch">
        <template #button>
          <div class="flex h-full flex-grow items-center">
            <span class="ml-3" v-text="searchSelectedOption" />
            <i-ho-chevron-down class="ml-1 mr-[12px] text-xs text-skin-text" />
          </div>
        </template>
      </BaseMenu>
    </div>
  </div>
</template>
