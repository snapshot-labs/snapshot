<script setup>
import { ref, watch, toRefs } from 'vue';
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import { usePlugins } from '@/composables/usePlugins';

const props = defineProps({
  open: Boolean,
  modelValue: Object,
  space: Object,
  proposal: Object
});

const emit = defineEmits(['close', 'update:modelValue']);

const { pluginIndex } = usePlugins();
const { open } = toRefs(props);
const selected = ref(false);
const form = ref({});

const showButton = key => !!pluginIndex[key]?.defaults?.proposal;

watch(open, () => {
  if (props.modelValue && props.open) form.value = clone(props.modelValue);
  selected.value = false;
});

watch(selected, value => {
  if (value === 'safeSnap') {
    form.value.safeSnap = form.value.safeSnap || {};
    emit('update:modelValue', form.value);
    emit('close');
  }
});
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('plugins') }}</h3>
    </template>
    <div class="m-4 mt-4" v-if="selected === false">
      <div
        v-for="(plugin, key) in props.space.plugins"
        :key="key"
        class="mb-3 p-4 border rounded-md link-color text-center"
      >
        <img
          class="rounded-full border mx-auto mb-1"
          :src="pluginIndex[key].icon"
          :alt="pluginIndex[key].name"
          width="64"
          height="64"
        />
        <h3 v-text="pluginIndex[key].name" />
        <div v-if="pluginIndex[key].website" class="mb-2">
          <a
            :href="pluginIndex[key].website"
            target="_blank"
            class="link-color"
          >
            {{ $t('learnMore') }}
            <Icon name="external-link" />
          </a>
        </div>
        <UiButton v-if="showButton(key)" @click="selected = key">
          {{ !form[key] ? $t('add') : $t('edit') }}
        </UiButton>
      </div>
    </div>
    <template v-if="selected === false" v-slot:footer>
      <div class="w-2/4 float-left pr-2">
        <UiButton @click="$emit('close')" type="button" class="w-full">
          {{ $t('cancel') }}
        </UiButton>
      </div>
      <div class="w-2/4 float-left pl-2">
        <UiButton
          @click="$emit('update:modelValue', form), $emit('close')"
          type="submit"
          class="w-full"
          primary
        >
          {{ $t('save') }}
        </UiButton>
      </div>
    </template>
    <div v-if="selected !== false" class="m-4 p-4 border rounded-md link-color">
      <PluginAragonConfig
        :proposal="proposal"
        v-model="form.aragon"
        @close="selected = false"
        v-if="selected === 'aragon'"
      />
      <PluginGnosisConfig
        :proposal="proposal"
        :network="space.network"
        v-model="form.gnosis"
        @close="selected = false"
        v-if="selected === 'gnosis'"
      />
    </div>
  </UiModal>
</template>
