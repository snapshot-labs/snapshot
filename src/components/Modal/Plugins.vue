<script setup>
import { ref, computed, watch, toRefs, defineProps, defineEmits } from 'vue';
import { useSearchFilters } from '@/composables/useSearchFilters';
import { clone } from '@/helpers/utils';

const props = defineProps({ open: Boolean, plugin: Object });
const emit = defineEmits(['add', 'close']);

const { open } = toRefs(props);
const searchInput = ref('');
const input = ref('');
const selectedPlugin = ref({});

const { filteredPlugins } = useSearchFilters();
const plugins = computed(() => filteredPlugins());

const isValid = computed(() => {
  try {
    const params = JSON.parse(input.value);
    return !!params;
  } catch (e) {
    return false;
  }
});

function handleSubmit() {
  let inputClone = clone(input.value);
  inputClone = JSON.parse(inputClone);
  const key = selectedPlugin.value.key;
  emit('add', { inputClone, key });
  emit('close');
}

watch(open, () => {
  if (Object.keys(props.plugin).length > 0) {
    const key = Object.keys(props.plugin)[0];
    input.value = JSON.stringify(props.plugin[key], null, 2);
    selectedPlugin.value = plugins.value.find(obj => {
      return obj.key === key;
    });
  } else {
    input.value = JSON.stringify({}, null, 2);
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
        <a
          v-for="(plugin, i) in filteredPlugins(searchInput)"
          :key="i"
          @click="selectedPlugin = plugin"
        >
          <BlockPlugin :plugin="plugin" />
        </a>
        <NoResults
          v-if="Object.keys(filteredPlugins(searchInput)).length < 1"
        />
      </div>
    </div>
  </UiModal>
</template>
