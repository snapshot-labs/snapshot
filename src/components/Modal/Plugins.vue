<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>
        {{
          selectedPlugin?.key
            ? $t('settings.editPlugin')
            : $t('settings.addPlugin')
        }}
      </h3>
    </template>
    <Search
      v-if="!selectedPlugin?.key"
      v-model="searchInput"
      :placeholder="$t('searchPlaceholder')"
      :modal="true"
    />
    <div class="mt-4 mx-0 mx-md-4">
      <div
        v-if="selectedPlugin?.key"
        class="p-4 mb-4 border rounded-2 text-white"
      >
        <h4 v-text="selectedPlugin.name" class="mb-3 text-center" />
        <UiButton
          class="d-block width-full mb-3 overflow-x-auto"
          style="height: auto;"
        >
          <TextareaAutosize
            v-model="input"
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
      <div v-if="!selectedPlugin?.key">
        <a
          v-for="(plugin, i) in filteredPlugins"
          :key="i"
          @click="select(plugin)"
        >
          <BlockPlugin :plugin="plugin" />
        </a>
        <NoResults :length="Object.keys(filteredPlugins).length" />
      </div>
    </div>
  </UiModal>
</template>

<script>
import { clone, filterPlugins } from '@/helpers/utils';
import plugins from '@snapshot-labs/snapshot.js/src/plugins';

export default {
  props: ['open', 'plugin'],
  emits: ['add', 'close'],
  data() {
    return {
      input: '',
      selectedPlugin: {},
      searchInput: ''
    };
  },
  watch: {
    open() {
      if (Object.keys(this.plugin).length > 0) {
        const key = Object.keys(this.plugin)[0];
        this.input = JSON.stringify(this.plugin[key], null, 2);
        this.selectedPlugin = this.plugins.find(obj => {
          return obj.key === key;
        });
      } else {
        this.input = JSON.stringify({}, null, 2);
        this.selectedPlugin = {};
      }
    }
  },
  computed: {
    filteredPlugins() {
      return filterPlugins(plugins, this.app.spaces, this.searchInput);
    },
    plugins() {
      return filterPlugins(plugins, this.app.spaces, '');
    },
    isValid() {
      try {
        const params = JSON.parse(this.input);
        return !!params;
      } catch (e) {
        return false;
      }
    }
  },
  methods: {
    select(plugin) {
      this.selectedPlugin = plugin;
    },
    handleSubmit() {
      let input = clone(this.input);
      input = JSON.parse(input);
      const key = this.selectedPlugin.key;
      this.$emit('add', { input, key });
      this.$emit('close');
    }
  }
};
</script>
