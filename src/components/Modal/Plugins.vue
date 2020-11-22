<template>
  <UiModal :open="open" @close="$emit('close')">
    <h3 class="m-4 text-center">Plugins</h3>
    <div v-if="selected === false">
      <div
        v-for="(plugin, i) in plugins"
        :key="i"
        class="m-4 mt-0 p-4 border rounded-2 text-white text-center"
      >
        <img
          class="circle border"
          :src="getLogoUrl(i)"
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
        <UiButton @click="selected = i">
          {{ !form[i] ? 'Add' : 'Edit' }}
        </UiButton>
      </div>
      <div class="p-4 overflow-hidden text-center border-top">
        <div class="col-6 float-left pr-2">
          <UiButton @click="$emit('close')" type="button" class="width-full">
            Cancel
          </UiButton>
        </div>
        <div class="col-6 float-left pl-2">
          <UiButton
            @click="[$emit('input', form), $emit('close')]"
            type="submit"
            class="width-full button--submit"
          >
            Save
          </UiButton>
        </div>
      </div>
    </div>
    <div v-else class="m-4 mt-0 p-4 border rounded-2 text-white">
      <PluginAragonConfig
        :value="form.aragon"
        :proposal="proposal"
        v-model="form.aragon"
        @close="selected = false"
        v-if="selected === 'aragon'"
      />
      <PluginGnosisConfig
        :value="form.gnosis"
        :proposal="proposal"
        v-model="form.gnosis"
        @close="selected = false"
        v-if="selected === 'gnosis'"
      />
    </div>
  </UiModal>
</template>

<script>
import plugins from '@snapshot-labs/snapshot.js/src/plugins';
import { clone } from '@/helpers/utils';

export default {
  props: ['open', 'value', 'space', 'proposal'],
  data() {
    return {
      plugins: [],
      selected: false,
      form: {}
    };
  },
  watch: {
    open() {
      if (this.value && this.open) this.form = clone(this.value);
      this.selected = false;
    }
  },
  created() {
    if (!this.space.plugins) return;
    this.plugins = Object.fromEntries(
      Object.keys(this.space.plugins).map(plugin => {
        const instance = new plugins[plugin]();
        return [plugin, instance];
      })
    );
  },
  methods: {
    getLogoUrl(plugin) {
      return `https://raw.githubusercontent.com/snapshot-labs/snapshot.js/master/src/plugins/${plugin}/logo.png`;
    }
  }
};
</script>
