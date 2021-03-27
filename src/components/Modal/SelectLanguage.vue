<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('language') }}</h3>
    </template>
    <div class="text-center mt-4 mb-3 px-4 width-full">
      <UiButton
        v-for="lang in langs"
        :key="lang"
        @click="($i18n.locale = lang), $emit('close')"
        class="width-full mb-2"
      >
        {{ $t(`nativeLocales.${lang}`) }}
      </UiButton>
    </div>
  </UiModal>
</template>

<script>
export default {
  emits: ['close'],
  data() {
    return {
      langs: ['en-US', 'es-ES', 'fr-FR', 'te-IN']
    };
  }
};
</script>
