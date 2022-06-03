<script setup>
import { ref, watch, toRefs } from 'vue';
import { usePlugins } from '@/composables/usePlugins';

const props = defineProps({ open: Boolean, plugin: Object });
const emit = defineEmits(['add', 'close']);

const { open } = toRefs(props);
const searchInput = ref('');
const input = ref({});
const isValid = ref(true);
const selectedPlugin = ref({});

const {
  filterPlugins,
  pluginIndex,
  loadingPluginsSpacesCount,
  getPluginsSpacesCount
} = usePlugins();

function handleSubmit() {
  const key = selectedPlugin.value.key;
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
    selectedPlugin.value = Object.values(pluginIndex).find(p => p.key === key);
  } else {
    input.value = {};
    selectedPlugin.value = {};
  }
});
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template v-slot:header>
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
    <div class="my-4 mx-0 md:mx-4 min-h-[300px]">
      <BaseBlock
        slim
        v-if="selectedPlugin?.key"
        class="p-4 mb-4 rounded-md text-skin-link"
      >
        <h4 v-text="selectedPlugin.name" class="mb-3 text-center" />
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
          <BlockPlugin
            :plugin="plugin"
            v-for="(plugin, i) in filterPlugins(searchInput)"
            :key="i"
            @click="selectPlugin(plugin)"
          />

          <BaseNoResults
            v-if="Object.keys(filterPlugins(searchInput)).length < 1"
          />
        </div>
      </div>
    </div>
    <template v-if="selectedPlugin?.key" v-slot:footer>
      <BaseButton
        @click="handleSubmit"
        :disabled="!isValid"
        class="w-full"
        primary
      >
        {{ Object.keys(plugin).length ? $t('save') : $t('add') }}
      </BaseButton>
    </template>
  </BaseModal>
</template>
