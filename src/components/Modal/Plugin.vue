<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>
        {{ plugin.name ? $t('settings.editPlugin') : $t('settings.addPlugin') }}
      </h3>
    </template>
    <Search
      v-if="!plugin.name && !input.name"
      v-model="searchInput"
      :placeholder="$t('searchPlaceholder')"
      :modal="true"
    />
    <div class="mt-4 mx-0 mx-md-4">
      <div v-if="input.name" class="p-4 mb-4 border rounded-2 text-white">
        <h4 v-text="input.name" class="mb-3 text-center" />
        <UiButton
          class="d-block width-full mb-3 overflow-x-auto"
          style="height: auto;"
        >
          <TextareaAutosize
            v-model="input.params"
            :placeholder="$t('settings.pluginParameters')"
            class="input text-left"
            style="width: 560px;"
          />
        </UiButton>
        <UiButton
          @click="handleSubmit"
          :disabled="!isValid"
          class="button--submit width-full"
        >
          {{ plugin.name ? $t('save') : $t('add') }}
        </UiButton>
      </div>
      <div v-if="!input.name">
        <a
          v-for="plugin in plugins"
          :key="plugin.key"
          @click="select(plugin.key)"
        >
          <BlockPlugin :plugin="plugin" />
        </a>
        <NoResults :length="Object.keys(plugins).length" />
      </div>
    </div>
  </UiModal>
</template>

<script>
import { clone, filterPlugins } from '@/helpers/utils';
import plugins from '@snapshot-labs/snapshot.js/src/plugins';

const defaultParams = {};

export default {
  props: ['open', 'plugin'],
  emits: ['add', 'close'],
  data() {
    return {
      input: {
        name: '',
        params: JSON.stringify(defaultParams, null, 2)
      },
      searchInput: ''
    };
  },
  watch: {
    open() {
      if (this.plugin?.name) {
        const plugin = this.plugin;
        plugin.params = JSON.stringify(plugin.params, null, 2);
        this.input = this.plugin;
      } else {
        this.input = {
          name: '',
          params: JSON.stringify(defaultParams, null, 2)
        };
      }
    }
  },
  computed: {
    plugins() {
      return filterPlugins(plugins, this.app.spaces, this.searchInput);
    },
    isValid() {
      try {
        const params = JSON.parse(this.input.params);
        return !!params;
      } catch (e) {
        return false;
      }
    }
  },
  methods: {
    select(plugin) {
      this.input.name = plugin;
    },
    handleSubmit() {
      const plugin = clone(this.input);
      plugin.params = JSON.parse(plugin.params);
      this.$emit('add', plugin);
      this.$emit('close');
    }
  }
};
</script>
