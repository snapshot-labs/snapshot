<script setup lang="ts">
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const props = defineProps<{
  context: 'setup' | 'settings';
  isViewOnly?: boolean;
}>();

const { form } = useFormSpaceSettings(props.context);

const { pluginIndex } = usePlugins();
const currentPlugin = ref({});
const modalPluginsOpen = ref(false);

function handleEditPlugins(name: string) {
  if (props.isViewOnly) return;
  currentPlugin.value = {};
  currentPlugin.value[name] = clone(form.value.plugins[name]);
  modalPluginsOpen.value = true;
}

function handleRemovePlugins(name: string) {
  const pluginsObj = clone(form.value.plugins);
  delete pluginsObj[name];
  form.value.plugins = pluginsObj;
}

function handleAddPlugins() {
  currentPlugin.value = {};
  modalPluginsOpen.value = true;
}

function handleSubmitPlugins(payload) {
  const pluginsObj = clone(form.value.plugins);
  pluginsObj[payload.key] = payload.input;
  form.value.plugins = pluginsObj;
}
</script>

<template>
  <BaseBlock :title="$t('plugins')">
    <div v-if="form.plugins">
      <div
        v-for="(name, index) in Object.keys(form.plugins).filter(
          key => pluginIndex[key]
        )"
        :key="index"
        class="mb-3"
      >
        <button
          v-if="pluginIndex[name].name"
          class="flex w-full items-center justify-between rounded-md border p-4"
          :class="{ ' cursor-default': isViewOnly }"
          @click="handleEditPlugins(name)"
        >
          <div class="flex items-center gap-2 truncate pr-[20px] text-left">
            <h4 class="truncate">{{ pluginIndex[name].name }}</h4>
          </div>
          <BaseButtonIcon
            v-show="!isViewOnly"
            class="-mr-2"
            @click.stop="handleRemovePlugins(name)"
          >
            <BaseIcon name="close" size="14" />
          </BaseButtonIcon>
        </button>
      </div>
    </div>

    <BaseButton
      :disabled="isViewOnly"
      class="block w-full"
      @click="handleAddPlugins"
    >
      {{ $t('settings.addPlugin') }}
    </BaseButton>
    <teleport to="#modal">
      <ModalPlugins
        :open="modalPluginsOpen"
        :plugin="currentPlugin"
        :used-plugins="Object.keys(form.plugins)"
        @close="modalPluginsOpen = false"
        @add="handleSubmitPlugins"
      />
    </teleport>
  </BaseBlock>
</template>
