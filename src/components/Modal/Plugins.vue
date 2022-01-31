<script setup>
import { ref, watch, toRefs } from 'vue';
import { usePluginsFilter } from '@/composables/usePluginsFilter';

const props = defineProps({ open: Boolean, plugin: Object });
const emit = defineEmits(['add', 'close']);

const { open } = toRefs(props);
const searchInput = ref('');
const input = ref({});
const isValid = ref(true);
const selectedPlugin = ref({});

const { filterPlugins, pluginsArray, loadingPlugins, getPluginsSpacesCount } =
  usePluginsFilter();

function handleSubmit() {
  const key = selectedPlugin.value.key;
  emit('add', { input: input.value, key });
  emit('close');
}

function selectPlugin(plugin) {
  selectedPlugin.value = plugin;
  input.value = selectedPlugin.value?.defaultParams ?? {};
}

watch(open, () => {
  if (props.open) getPluginsSpacesCount();
  if (Object.keys(props.plugin).length > 0) {
    const key = Object.keys(props.plugin)[0];
    input.value = props.plugin[key];
    selectedPlugin.value = pluginsArray.value.find(p => p.key === key);
  } else {
    input.value = {};
    selectedPlugin.value = {};
  }
});
</script>

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
    <div class="mt-4 mx-0 md:mx-4 min-h-[339px]">
      <div
        v-if="selectedPlugin?.key"
        class="p-4 mb-4 border rounded-md link-color"
      >
        <h4 v-text="selectedPlugin.name" class="mb-3 text-center" />
        <UiButton
          class="block w-full mb-3 overflow-x-auto"
          style="height: auto"
        >
          <TextareaJson
            v-model="input"
            v-model:is-valid="isValid"
            :placeholder="$t('settings.pluginParameters')"
            class="input text-left"
            style="width: 560px"
          />
        </UiButton>
        <UiButton
          @click="handleSubmit"
          :disabled="!isValid"
          class="w-full"
          primary
        >
          {{ plugin.name ? $t('save') : $t('add') }}
        </UiButton>
      </div>
      <div v-if="!selectedPlugin?.key">
        <RowLoadingBlock v-if="loadingPlugins" />
        <div v-else>
          <a
            v-for="(plugin, i) in filterPlugins(searchInput)"
            :key="i"
            @click="selectPlugin(plugin)"
          >
            <BlockPlugin :plugin="plugin" />
          </a>
          <NoResults
            v-if="Object.keys(filterPlugins(searchInput)).length < 1"
          />
        </div>
      </div>
    </div>
  </UiModal>
</template>
