<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('language') }}</h3>
    </template>
    <div class="text-center mt-4 mb-3 px-4 width-full">
      <UiButton
        v-for="locale in locales"
        :key="locale"
        @click="selectLang(locale)"
        class="width-full mb-2"
      >
        {{ languages[locale] }}
      </UiButton>
    </div>
  </UiModal>
</template>

<script>
import languages from '@/locales/languages.json';
import { mapActions } from 'vuex';

export default {
  emits: ['close'],
  data() {
    return {
      languages
    };
  },
  computed: {
    locales() {
      return Object.keys(languages);
    }
  },
  methods: {
    ...mapActions(['setLocale']),
    selectLang(locale) {
      this.setLocale(locale);
      this.$emit('close');
    }
  }
};
</script>
