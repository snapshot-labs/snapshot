<script setup lang="ts">
import { ref, watch, toRefs } from 'vue';
import { PluginIndex } from '@/helpers/interfaces';
import { usePlugins } from '@/composables';

const props = defineProps<{ open: boolean; plugin: PluginIndex }>();
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

function selectPlugin(plugin) {
  selectedPlugin.value = plugin;
  input.value = selectedPlugin.value?.defaults?.space ?? {};
}

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
          selectedPlugin?.key
            ? $t('settings.editPlugin')
            : $t('settings.addPlugin')
        }}
      </h3>
    </template>
    <BaseSearch
      v-if="!selectedPlugin?.key"
      v-model="searchInput"
      :placeholder="$t('searchPlaceholder')"
      modal
    />
    <div class="my-4 mx-0 min-h-[300px] md:mx-4">
      <BaseBlock
        v-if="selectedPlugin?.key"
        slim
        class="mb-4 rounded-md p-4 text-skin-link"
      >
        <h4 class="mb-3 text-center" v-text="selectedPlugin.name" />
        <TextareaJson
          v-model="input"
          v-model:is-valid="isValid"
          :placeholder="$t('settings.pluginParameters')"
          class="input text-left"
        />
      </BaseBlock>
      <div v-if="!selectedPlugin?.key">
        <LoadingRow v-if="loadingPluginsSpacesCount" block />
        <div v-else class="space-y-3">
          <BasePluginItem
            v-for="(pluginItem, i) in filterPlugins(searchInput)"
            :key="i"
            :plugin="pluginItem"
            @click="selectPlugin(pluginItem)"
          />

          <BaseNoResults
            v-if="Object.keys(filterPlugins(searchInput)).length < 1"
          />
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
        {{ Object.keys(plugin).length ? $t('save') : $t('add') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
