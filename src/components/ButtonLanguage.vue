<script setup lang="ts">
import { ref } from 'vue';
import languages from '@/locales/languages.json';

const modalLangOpen = ref(false);
</script>

<template>
  <DropdownLanguages>
    <BaseButton
      class="flex !h-[44px] w-full items-center !text-skin-text hover:!text-skin-link"
      @click="modalLangOpen = true"
    >
      <i-ho-globe class="mr-2" />
      {{ languages[$i18n.locale]?.nativeName ?? languages[$i18n.locale]?.name }}
    </BaseButton>
  </DropdownLanguages>
</template>
