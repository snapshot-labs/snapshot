<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>Skins</h3>
    </template>
    <Search v-model="searchInput" placeholder="Search" :modal="true" />
    <div class="mt-4 mx-0 mx-md-4">
      <a v-for="skin in skins" :key="skin.key" @click="select(skin.key)">
        <BlockSkin :skin="skin" />
      </a>
      <NoResults :length="Object.keys(skins).length" />
    </div>
  </UiModal>
</template>

<script>
import skins from '@/helpers/skins';
import { filterSkins } from '@/helpers/utils';

export default {
  props: ['open'],
  emits: ['update:modelValue', 'close'],
  data() {
    return {
      searchInput: ''
    };
  },
  computed: {
    skins() {
      return filterSkins(skins, this.app.spaces, this.searchInput);
    }
  },
  methods: {
    select(key) {
      this.$emit('update:modelValue', key);
      this.$emit('close');
    }
  }
};
</script>
