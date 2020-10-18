<template>
  <UiModal :open="open" @close="$emit('close')">
    <h3 class="m-4 text-center">Skins</h3>
    <div class="px-4">
      <div
        v-for="skin in skins"
        :key="skin"
        :class="skin"
        class="bg-black text-center rounded-0 rounded-md-2"
      >
        <Block>
          <UiButton class="button--submit">{{ skin }}</UiButton>
        </Block>
      </div>
    </div>
  </UiModal>
</template>

<script>
import skins from '@/helpers/skins';

export default {
  props: ['open'],
  data() {
    return {
      skins
    };
  }
};
</script>
