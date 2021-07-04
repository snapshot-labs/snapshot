<template>
  <Block>
    <div v-if="space.about" class="mb-3">
      <h4 class="text-white mb-2">{{ $t('settings.about') }}</h4>
      <UiText :text="space.about" />
      <div class="my-3" v-if="space.github || space.twitter">
        <a
          v-if="space.twitter"
          :href="`https://twitter.com/${space.twitter}`"
          target="_blank"
        >
          <Icon size="20" name="twitter" class="mt-1 mr-1" /> @{{
            space.twitter
          }}
        </a>
        <a
          v-if="space.github"
          :href="`https://github.com/${space.github}`"
          target="_blank"
        >
          <Icon size="20" name="github" class="ml-4 mr-1" /> {{ space.github }}
        </a>
      </div>
    </div>

    <div class="mb-3">
      <h4 class="text-white mb-2">{{ $t('settings.network') }}</h4>
      <div>{{ network.name }}</div>
    </div>

    <div class="mb-3">
      <h4 class="text-white mb-2">
        {{ $t('settings.proposalValidation') }}
      </h4>
      {{ space.validation?.name || 'basic' }}
    </div>

    <div
      v-if="
        (!space.validation || space.validation?.name === 'basic') &&
        space.filters?.minScore
      "
      class="mb-3"
    >
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

<script>
import networks from '@snapshot-labs/snapshot.js/src/networks.json';

export default {
  props: ['space'],
  computed: {
    network() {
      return networks[this.space.network];
    }
  }
};
</script>
