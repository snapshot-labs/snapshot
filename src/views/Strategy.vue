<template>
  <Layout>
    <template #content-left>
      <div class="px-4 px-md-0 mb-3">
        <router-link :to="{ path: '/strategies' }" class="text-gray">
          <Icon name="back" size="22" class="v-align-middle" />
          {{ $t('strategiesPage') }}
        </router-link>
      </div>
      <div class="px-4 px-md-0">
        <h1 class="mb-2">
          {{ strategy.key }}
        </h1>
        <span
          v-text="`In ${strategy.spaces.length} space(s)`"
          class="text-gray"
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
              :href="`https://github.com/snapshot-labs/snapshot.js/tree/master/src/strategies/${strategy.key}`"
            >
              {{ strategy.version }}
              <Icon name="external-link" class="ml-1" />
            </a>
          </div>
        </div>
        <router-link :to="`/playground/${$route.params.name}`">
          <UiButton class="width-full mt-2">{{ $t('playground') }}</UiButton>
        </router-link>
      </Block>
    </template>
  </Layout>
</template>

<script>
import strategies from '@/helpers/strategies';
import { getStrategy } from '@/helpers/utils';

export default {
  computed: {
    strategy() {
      return getStrategy(strategies[this.$route.params.name], this.app.spaces);
    }
  }
};
</script>
