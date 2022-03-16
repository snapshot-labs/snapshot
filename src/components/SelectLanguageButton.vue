<script setup>
import { ref } from 'vue';
import languages from '@/locales/languages.json';

const modalLangOpen = ref(false);
</script>

<template>
  <UiButton
    v-bind="$attrs"
    class="flex items-center"
    @click="modalLangOpen = true"
  >
    <BaseIcon size="24" name="earth" class="mr-2" />
    {{ languages[$i18n.locale]?.nativeName ?? languages[$i18n.locale]?.name }}
  </UiButton>
  <teleport to="#modal">
    <ModalSelectLanguage :open="modalLangOpen" @close="modalLangOpen = false" />
  </teleport>
</template>
