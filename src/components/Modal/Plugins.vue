<template>
  <UiModal :open="open" @close="$emit('close')">
    <h3 class="m-4 text-center">Plugins</h3>
    <div
      v-for="(plugin, i) in plugins"
      :key="i"
      class="m-4 mt-0 p-4 border rounded-2 text-white"
    >
      <div class="text-center">
        <img
          class="circle"
          :src="plugin.image"
          style="background-color: #6a6de4;"
          width="64"
          height="64"
        />
        <h3 v-text="plugin.name" />
        <div class="mb-2">
          <a :href="plugin.website" target="_blank" class="text-white">
            Learn more
            <Icon name="external-link" />
          </a>
        </div>
        <div>
          <UiButton>Activate</UiButton>
        </div>
      </div>
    </div>
  </UiModal>
</template>

<script>
import plugins from '@/helpers/plugins';

export default {
  props: ['open'],
  data() {
    return {
      plugins: []
    };
  },
  created() {
    this.plugins = Object.values(plugins).map(plugin => new plugin());
  }
};
</script>
