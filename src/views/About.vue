<template>
  <Layout>
    <template #sidebar-left>
      <BlockSpace :space="space" />
    </template>
    <template #content-right>
      <div class="px-4 px-md-0 mb-3 d-flex">
        <h2>{{ space.name }}</h2>
      </div>
      <Block>
        <div v-if="space.about" class="mb-3">
          <h4 class="text-white mb-2">{{ $t('settings.about') }}</h4>
          <UiText :text="space.about" />
        </div>

        <div v-if="space.filters?.minScore" class="mb-3">
          <h4 class="text-white mb-2">
            {{ $t('settings.proposalThreshold') }}
          </h4>
          {{ _n(space.filters.minScore) }} {{ space.symbol }}
        </div>

        <div v-if="space.strategies" class="mb-3">
          <h4 class="text-white mb-2">{{ $t('settings.strategies') }}</h4>
          <div v-for="(strategy, i) in space.strategies" :key="i">
            <div>{{ strategy.name }}</div>
          </div>
        </div>

        <div v-if="Object.keys(space.plugins || {}).length" class="mb-3">
          <h4 class="text-white mb-2">{{ $t('plugins') }}</h4>
          <div v-for="(plugin, i) in space.plugins" :key="i">
            <div>{{ i }}</div>
          </div>
        </div>
      </Block>
      <Block
        :title="$t('settings.admins')"
        v-if="space.admins?.length"
        :slim="true"
        class="mb-3"
      >
        <div
          v-for="(user, i) in space.admins"
          :key="i"
          :style="i === 0 && 'border: 0 !important;'"
          class="px-4 py-3 border-top d-flex"
        >
          <User :address="user" />
        </div>
      </Block>
      <Block
        :title="$t('settings.members')"
        v-if="space.members?.length"
        :slim="true"
        class="mb-3"
      >
        <div
          v-for="(user, i) in space.members"
          :key="i"
          :style="i === 0 && 'border: 0 !important;'"
          class="px-4 py-3 border-top d-flex"
        >
          <User :address="user" />
        </div>
      </Block>
    </template>
  </Layout>
</template>

<script>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();
    const route = useRoute();

    return {
      space: computed(() => store.state.app.spaces[route.params.key])
    };
  }
};
</script>
