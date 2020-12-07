<template>
  <UiModal :open="open" @close="$emit('close')">
    <template slot="header">
      <h3>Plugins</h3>
    </template>
    <div class="m-4 mt-4" v-if="selected === false">
      <div
        v-for="(plugin, i) in plugins"
        :key="i"
        class="mb-3 p-4 border rounded-2 text-white text-center"
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
    </div>
    <template v-if="selected === false" slot="footer">
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
    </template>
    <div v-else class="m-4 p-4 border rounded-2 text-white">
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
        :network="space.network"
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
