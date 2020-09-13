<template>
  <UiModal :open="open" @close="$emit('close')">
    <h3 class="m-4 text-center">Plugins</h3>
    <div
      v-for="(plugin, i) in plugins"
      :key="i"
      class="m-4 mt-0 p-4 border rounded-2 text-white"
    >
      <div v-if="selected === false" class="text-center">
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
          <UiButton @click="selected = i">Activate</UiButton>
        </div>
      </div>
      <div v-else>
        <div class="mb-3 text-center">
          <h4 class="mb-3">Choice 1</h4>
          <UiButton class="width-full mb-3">
            <input class="input width-full text-center" placeholder="To" />
          </UiButton>
          <div class="mb-2">
            <UiButton class="width-full mb-2">
              <input class="input width-full text-center" placeholder="Data" />
            </UiButton>
          </div>
          <UiButton class="width-full">
            Add data
          </UiButton>
        </div>
        <UiButton class="button--submit width-full">
          Next
        </UiButton>
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
      plugins: [],
      selected: false
    };
  },
  created() {
    this.plugins = Object.values(plugins).map(plugin => new plugin());
  }
};
</script>
