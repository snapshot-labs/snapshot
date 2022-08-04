<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '@/composables/useI18n';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const routeQuery = computed(() => route.query.q || '');
const searchOptions = computed(() => [
  {
    text: t('spaces'),
    action: 'home',
    extras: { selected: route.name === 'home' }
  },
  {
    text: t('networks'),
    action: 'networks',
    extras: { selected: route.name === 'networks' }
  },
  {
    text: t('strategiesPage'),
    action: 'strategies',
    extras: { selected: route.name === 'strategies' }
  },
  {
    text: t('plugins'),
    action: 'plugins',
    extras: { selected: route.name === 'plugins' }
  }
]);

const searchSelectedOption = computed(
  () =>
    searchOptions.value.find(option => option.action === route.name)?.text ||
    'home'
);

function redirectSearch(e) {
  router.push({
    name: e,
    query: routeQuery.value ? { q: routeQuery.value } : {}
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
