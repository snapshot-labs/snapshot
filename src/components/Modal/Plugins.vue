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
        <UiButton @click="selected = i">
          {{ !form[i] ? 'Add' : 'Edit' }}
        </UiButton>
      </div>
      <PluginAragon
        :value="form[i]"
        :proposal="proposal"
        v-model="form[i]"
        @close="selected = false"
        v-else
      />
    </div>
    <div v-if="!selected" class="p-4 overflow-hidden text-center border-top">
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
  </UiModal>
</template>

<script>
import plugins from '@/helpers/plugins';
import { clone } from '@/helpers/utils';

export default {
  props: ['open', 'value', 'proposal'],
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
    this.plugins = Object.fromEntries(
      Object.entries(plugins).map(plugin => {
        const instance = new plugin[1]();
        return [instance.key, instance];
      })
    );
  }
};
</script>
