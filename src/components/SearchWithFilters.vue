<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

defineEmits(['update:modelValue']);

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const searchOptions = computed(() => [
  {
    text: t('spaces'),
    action: 'home'
  },
  {
    text: t('networks'),
    action: 'networks'
  },
  {
    text: t('strategiesPage'),
    action: 'strategies'
  },
  {
    text: t('plugins'),
    action: 'plugins'
  },
  {
    text: t('skins'),
    action: 'skins'
  }
]);

const searchSelectedOption = computed(
  () =>
    searchOptions.value.find(option => option.action === route.name)?.text ||
    'home'
);

const routeQuery = computed(() => route.query.q);

function redirectSearch(e) {
  router.push({
    name: e,
    query: routeQuery.value ? { q: routeQuery.value } : {}
  });
}
</script>

<template>
  <div class="d-flex">
    <Search
      :modelValue="routeQuery"
      @update:modelValue="input => $emit('update:modelValue', input)"
      :placeholder="$t('searchPlaceholder')"
      class="flex-auto pr-2"
    />
    <div class="border-left" style="height: 44px">
      <UiDropdown
        top="3.5rem"
        right="1.0rem"
        class="text-left"
        style="z-index: 1"
        @select="redirectSearch"
        :items="searchOptions"
      >
        <span v-text="searchSelectedOption" class="ml-3" />
        <Icon name="arrow-down" class="ml-1 mr-2 pr-1" />
      </UiDropdown>
    </div>
  </div>
</template>
