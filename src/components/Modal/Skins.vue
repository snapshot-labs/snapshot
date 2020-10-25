<template>
  <UiModal :open="open" @close="$emit('close')">
    <h3 class="m-4 text-center">Skins</h3>
    <div class="mx-0 mx-md-4">
      <a v-for="skin in skins" :key="skin.key" @click="select(skin.key)">
        <BlockSkin :skin="skin" />
      </a>
    </div>
  </UiModal>
</template>

<script>
import skins from '@/helpers/skins';
import { filterSkins } from '@/helpers/utils';

export default {
  props: ['open'],
  computed: {
    skins() {
      return filterSkins(skins, this.app.spaces, '');
    }
  },
  methods: {
    select(key) {
      this.$emit('input', key);
      this.$emit('close');
    }
  }
};
</script>
