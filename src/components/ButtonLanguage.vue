<script setup lang="ts">
import { ref } from 'vue';
import languages from '@/locales/languages.json';

const modalLangOpen = ref(false);
</script>

<template>
  <DropdownLanguages class="w-full">
    <BaseButton
      class="flex !h-[44px] w-full items-center"
      @click="modalLangOpen = true"
    >
      <i-ho-globe class="mr-2" />
      {{ languages[$i18n.locale]?.nativeName ?? languages[$i18n.locale]?.name }}
      - {{ $i18n.locale.slice(3, 5) }}
      <i-ho-chevron-down class="mr-0 ml-auto text-skin-text" />
    </BaseButton>
  </DropdownLanguages>
</template>
