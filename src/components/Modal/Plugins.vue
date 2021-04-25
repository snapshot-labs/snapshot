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
          style="height: auto"
        >
          <TextareaAutosize
            v-model="input"
            :placeholder="$t('settings.pluginParameters')"
            class="input text-left"
            style="width: 560px"
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
        <a v-for="(plugin, i) in plugins" :key="i" @click="select(plugin)">
          <BlockPlugin :plugin="plugin" />
        </a>
        <NoResults v-if="Object.keys(plugins).length < 1" />
      </div>
    </div>
  </UiModal>
</template>

<script>
import { clone } from '@/helpers/utils';
import { usePluginFilter } from '@/composables/useSearchFilters';

import { toRefs, computed, ref, watch } from 'vue';
export default {
  props: {
    open: {
      type: Boolean,
      required: true
    },
    plugin: {
      type: Object,
      required: true
    }
  },
  setup(props, { emit }) {
    const { open, plugin } = toRefs(props);
    const selectedPlugin = ref({});
    const input = ref('');
    const searchInput = ref('');

    const { filteredPlugins } = usePluginFilter();
    const plugins = computed(() => filteredPlugins(searchInput.value));
    const allPlugins = computed(() => filteredPlugins());

    watch(open, () => {
      if (Object.keys(plugin.value).length > 0) {
        const key = Object.keys(plugin.value)[0];
        input.value = JSON.stringify(plugin.value[key], null, 2);
        selectedPlugin.value = allPlugins.value.find(obj => {
          return obj.key === key;
        });
      } else {
        input.value = JSON.stringify({}, null, 2);
        selectedPlugin.value = {};
      }
    });

    const isValid = computed(() => {
      try {
        const params = JSON.parse(input.value);
        return !!params;
      } catch (e) {
        return false;
      }
    });

    function select(plugin) {
      selectedPlugin.value = plugin;
    }
    function handleSubmit() {
      let inputClone = clone(input.value);
      inputClone = JSON.parse(inputClone);
      const key = selectedPlugin.value.key;
      emit('add', { inputClone, key });
      emit('close');
    }

    return {
      selectedPlugin,
      input,
      searchInput,
      plugins,
      isValid,
      select,
      handleSubmit
    };
  }
};
</script>
