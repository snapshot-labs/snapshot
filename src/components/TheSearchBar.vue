<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from '@/composables/useI18n';

defineEmits(['update:modelValue']);

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const routeQuery = computed(() => route.query.q || '');
const searchOptions = computed(() => [
  {
    text: t('spaces'),
    action: 'home',
    selected: route.name === 'home'
  },
  {
    text: t('networks'),
    action: 'networks',
    selected: route.name === 'networks'
  },
  {
    text: t('strategiesPage'),
    action: 'strategies',
    selected: route.name === 'strategies'
  },
  {
    text: t('plugins'),
    action: 'plugins',
    selected: route.name === 'plugins'
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
      :modelValue="routeQuery"
      @update:modelValue="input => $emit('update:modelValue', input)"
      :placeholder="$t('searchPlaceholder')"
      class="flex-auto pr-2"
    />
    <div class="flex items-center border-l" style="height: 44px">
      <BaseDropdown @select="redirectSearch" :items="searchOptions">
        <template v-slot:button>
          <span v-text="searchSelectedOption" class="ml-3" />
          <BaseIcon name="arrow-down" class="ml-1 mr-2 pr-1" />
        </template>
      </BaseDropdown>
    </div>
  </div>
</template>
