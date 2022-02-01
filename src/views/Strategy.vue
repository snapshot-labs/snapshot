<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { setPageTitle } from '@/helpers/utils';
import { useStrategies } from '@/composables/useStrategies';

const route = useRoute();
const { getExtendedStrategy, extendedStrategy: strategy } = useStrategies();

onMounted(async () => {
  setPageTitle('page.title.strategy', { key: route.params.name });
  getExtendedStrategy(route.params.name);
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
      <PageLoading v-if="!strategy" />
      <div class="px-4 md:px-0" v-else>
        <h1 class="mb-2">
          {{ strategy.id }}
        </h1>
        <span
          v-text="`In ${strategy.spacesCount} space(s)`"
          class="text-color"
        />
        <UiMarkdown :body="strategy.about" class="mb-6 mt-4" />
      </div>
    </template>
    <template #sidebar-right>
      <Block :title="$t('information')" v-if="strategy">
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
              :href="`https://github.com/snapshot-labs/snapshot-strategies/tree/master/src/strategies/${strategy.id}`"
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
