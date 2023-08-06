<script setup lang="ts">
import { PluginIndex } from '@/helpers/interfaces';

const props = defineProps<{
  open: boolean;
  plugin: Record<string, any>;
  usedPlugins: string[];
}>();
const emit = defineEmits(['add', 'close']);

const { open } = toRefs(props);
const searchInput = ref('');
const input = ref({});
const isValid = ref(true);
const selectedPlugin = ref<PluginIndex | null>(null);

const {
  filterPlugins,
  pluginIndex,
  loadingPluginsSpacesCount,
  getPluginsSpacesCount
} = usePlugins();

function handleSubmit() {
  const key = selectedPlugin.value?.key;
  emit('add', { input: input.value, key });
  emit('close');
}

function selectPlugin(plugin: PluginIndex) {
  selectedPlugin.value = plugin;
  if (!plugin?.defaults?.space) return handleSubmit();
  input.value = selectedPlugin.value?.defaults?.space ?? {};
}

const availablePlugins = computed(() => {
  const filteredPlugins = filterPlugins(searchInput.value);
  const availablePlugins = filteredPlugins.filter(
    p => !props.usedPlugins.includes(p.key)
  );
  return availablePlugins;
});

watch(open, () => {
  if (props.open) getPluginsSpacesCount();
  if (Object.keys(props.plugin).length > 0) {
    const key = Object.keys(props.plugin)[0];
    input.value = props.plugin[key];
    selectedPlugin.value =
      Object.values(pluginIndex).find(p => p.key === key) ?? null;
  } else {
    input.value = {};
    selectedPlugin.value = null;
  }
});
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>
        {{
          usedPlugins.includes(selectedPlugin?.key || '')
            ? $t('settings.editPlugin')
            : $t('settings.addPlugin')
        }}
      </h3>
    </template>
    <BaseSearch
      v-if="!selectedPlugin?.key"
      v-model="searchInput"
      :placeholder="$t('searchPlaceholder')"
      focus-on-mount
      modal
    />
    <div class="mx-4 my-4 min-h-[300px]">
      <div v-if="selectedPlugin?.key">
        <TextareaJson
          v-model="input"
          v-model:is-valid="isValid"
          :placeholder="$t('settings.pluginParameters')"
          class="input text-left"
        />
      </div>
      <div v-if="!selectedPlugin?.key">
        <LoadingRow v-if="loadingPluginsSpacesCount" block />
        <div v-else class="space-y-3">
          <BasePluginItem
            v-for="(pluginItem, i) in availablePlugins"
            :key="i"
            :plugin="pluginItem"
            @click="selectPlugin(pluginItem)"
          />

          <BaseNoResults v-if="Object.keys(availablePlugins).length < 1" />
        </div>
      </div>
    </div>
    <template v-if="selectedPlugin?.key" #footer>
      <BaseButton
        :disabled="!isValid"
        class="w-full"
        primary
        @click="handleSubmit"
      >
        {{ Object.keys(plugin).length ? $t('applyChanges') : $t('add') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
