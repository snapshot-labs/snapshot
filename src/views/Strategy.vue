<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { getStrategy } from '@/helpers/utils';
import { useApp } from '@/composables/useApp';

const route = useRoute();
const { spaces, strategies } = useApp();

const strategy = computed(() =>
  getStrategy(strategies.value[route.params.name], spaces.value)
);
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
          v-text="`In ${strategy.spaces.length} space(s)`"
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
