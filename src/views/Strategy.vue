<script setup>
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useApp } from '@/composables/useApp';
import { useSearchFilters } from '@/composables/useSearchFilters';
import { setPageTitle } from '@/helpers/utils';

const route = useRoute();
const { strategies } = useApp();
const { minifiedStrategiesArray } = useSearchFilters();

const strategy = computed(() => strategies.value[route.params.name]);

onMounted(() => {
  setPageTitle('page.title.strategy', { key: strategy.value.key });
});
</script>

<template>
  <Layout>
    <template #content-left>
      <div class="px-4 md:px-0 mb-3">
        <router-link :to="{ path: '/strategies' }" class="text-color">
          <Icon name="back" size="22" class="!align-middle" />
          {{ $t('strategiesPage') }}
        </router-link>
      </div>
      <div class="px-4 md:px-0">
        <h1 class="mb-2">
          {{ strategy.key }}
        </h1>
        <span
          v-text="
            `In ${
              minifiedStrategiesArray.find(st => st.key === route.params.name)
                .spaces
            } space(s)`
          "
          class="text-color"
        />
        <UiMarkdown :body="strategy.about" class="mb-6 mt-4" />
      </div>
    </template>
    <template #sidebar-right>
      <Block :title="$t('information')">
        <div class="mb-1">
          <b>{{ $t('author') }}</b>
          <a
            target="_blank"
            class="float-right"
            :href="`https://github.com/${strategy.author}`"
          >
            <Icon name="github" class="ml-1" />
            {{ strategy.author }}
          </a>
        </div>
        <div>
          <div class="mb-1">
            <b>{{ $t('version') }}</b>
            <a
              target="_blank"
              class="float-right"
              :href="`https://github.com/snapshot-labs/snapshot-strategies/tree/master/src/strategies/${strategy.key}`"
            >
              {{ strategy.version }}
              <Icon name="external-link" class="ml-1" />
            </a>
          </div>
        </div>
        <router-link :to="`/playground/${$route.params.name}`">
          <UiButton class="w-full mt-2">{{ $t('playground') }}</UiButton>
        </router-link>
      </Block>
    </template>
  </Layout>
</template>
