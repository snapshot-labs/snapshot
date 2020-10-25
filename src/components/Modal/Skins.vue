<template>
  <UiModal :open="open" @close="$emit('close')">
    <h3 class="m-4 text-center">Skins</h3>
    <div class="mx-0 mx-md-4">
      <BlockSkin v-for="skin in skins" :key="skin.key" :skin="skin" />
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
  }
};
</script>
