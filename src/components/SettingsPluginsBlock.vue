<script setup lang="ts">
import { ref } from 'vue';
import { usePlugins } from '@/composables/usePlugins';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  plugins: {
    [key: string]: any;
  };
}>();

const emit = defineEmits(['update:plugins']);

const { pluginIndex } = usePlugins();
const currentPlugin = ref({});
const modalPluginsOpen = ref(false);

function handleEditPlugins(name) {
  currentPlugin.value = {};
  currentPlugin.value[name] = clone(props.plugins[name]);
  modalPluginsOpen.value = true;
}

function handleRemovePlugins(plugin) {
  const pluginsObj = clone(props.plugins);
  delete pluginsObj[plugin];
  emit('update:plugins', pluginsObj);
}

function handleAddPlugins() {
  currentPlugin.value = {};
  modalPluginsOpen.value = true;
}

function handleSubmitPlugins(payload) {
  const pluginsObj = clone(props.plugins);
  pluginsObj[payload.key] = payload.input;
  emit('update:plugins', pluginsObj);
}
</script>

<template>
  <BaseBlock :title="$t('plugins')">
    <div v-if="plugins">
      <div
        v-for="(name, index) in Object.keys(plugins).filter(
          key => pluginIndex[key]
        )"
        :key="index"
        class="relative mb-3"
      >
        <div v-if="pluginIndex[name].name">
          <a class="absolute right-0 p-4" @click="handleRemovePlugins(name)">
            <BaseIcon name="close" size="12" />
          </a>
          <a
            class="block rounded-md border p-4"
            @click="handleEditPlugins(name)"
          >
            <h4 v-text="pluginIndex[name].name" />
          </a>
        </div>
      </div>
    </div>
    <BaseButton class="block w-full" @click="handleAddPlugins">
      {{ $t('settings.addPlugin') }}
    </BaseButton>
    <teleport to="#modal">
      <ModalPlugins
        :open="modalPluginsOpen"
        :plugin="currentPlugin"
        @close="modalPluginsOpen = false"
        @add="handleSubmitPlugins"
      />
    </teleport>
  </BaseBlock>
</template>
