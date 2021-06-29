<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('plugins') }}</h3>
    </template>
    <div class="m-4 mt-4" v-if="selected === false">
      <div
        v-for="(plugin, i) in plugins"
        :key="i"
        class="mb-3 p-4 border rounded-2 text-white text-center"
      >
        <img
          class="circle border"
          :src="getLogoUrl(i)"
          width="64"
          height="64"
        />
        <h3 v-text="plugin.name" />
        <div class="mb-2">
          <a :href="plugin.website" target="_blank" class="text-white">
            {{ $t('learnMore') }}
            <Icon name="external-link" />
          </a>
        </div>
        <UiButton v-if="showButton(plugin)" @click="selected = i">
          {{ !form[i] ? $t('add') : $t('edit') }}
        </UiButton>
      </div>
    </div>
    <template v-if="selected === false" v-slot:footer>
      <div class="col-6 float-left pr-2">
        <UiButton @click="$emit('close')" type="button" class="width-full">
          {{ $t('cancel') }}
        </UiButton>
      </div>
      <div class="col-6 float-left pl-2">
        <UiButton
          @click="[$emit('update:modelValue', form), $emit('close')]"
          type="submit"
          class="width-full button--submit"
        >
          {{ $t('save') }}
        </UiButton>
      </div>
    </template>
    <div v-if="selected !== false" class="m-4 p-4 border rounded-2 text-white">
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

<script>
import plugins from '@snapshot-labs/snapshot.js/src/plugins';
import { clone } from '@/helpers/utils';

export default {
  props: ['open', 'modelValue', 'space', 'proposal'],
  emits: ['close', 'update:modelValue'],
  data() {
    return {
      plugins: [],
      selected: false,
      form: {}
    };
  },
  watch: {
    open() {
      if (this.modelValue && this.open) this.form = clone(this.modelValue);
      this.selected = false;
    },
    selected(value) {
      if (value === 'safeSnap') {
        this.form.safeSnap = this.form.safeSnap || {};
        this.$emit('update:modelValue', this.form);
        this.$emit('close');
      }
    }
  },
  created() {
    if (!this.space.plugins) return;
    this.plugins = Object.fromEntries(
      Object.keys(this.space.plugins).map(plugin => {
        const instance = new plugins[plugin]();
        return [plugin, instance];
      })
    );
  },
  methods: {
    getLogoUrl(plugin) {
      return `https://raw.githubusercontent.com/snapshot-labs/snapshot.js/master/src/plugins/${plugin}/logo.png`;
    },
    showButton(plugin) {
      return plugin.name !== 'SafeSnap';
    }
  }
};
</script>
