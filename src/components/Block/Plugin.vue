<template>
  <Block>
    <div class="d-flex flex-items-center mb-1">
      <a
        :href="
          `https://github.com/snapshot-labs/snapshot.js/tree/master/src/plugins/${plugin.key}`
        "
        target="_blank"
        class="d-flex"
      >
        <img
          class="circle border mr-2 mb-1"
          :src="getLogoUrl(plugin.key)"
          width="28"
          height="28"
        />
        <h3 v-text="plugin.name" />
      </a>
      <div class="ml-1">v{{ plugin.version }}</div>
    </div>
    <div class="text-gray">
      <div>
        <a
          :href="`https://github.com/${plugin.author}`"
          target="_blank"
          class="text-gray"
        >
          <Icon name="github" class="mr-1" />
          {{ plugin.author }}
        </a>
      </div>
      In {{ _n(plugin.spaces.length) }} space(s)
    </div>
  </Block>
</template>

<script>
export default {
  props: ['plugin'],
  methods: {
    getLogoUrl() {
      return `https://raw.githubusercontent.com/snapshot-labs/snapshot.js/master/src/plugins/${this.plugin.key}/logo.png`;
    }
  }
};
</script>
