<script setup lang="ts">
import { ref } from 'vue';
import languages from '@/locales/languages.json';

defineProps<{
  small?: boolean;
}>();

const modalLangOpen = ref(false);
</script>

<template>
  <DropdownLanguages>
    <UiSidebarButton v-if="small">
      <BaseIcon size="20" name="earth" class="text-skin-link" />
    </UiSidebarButton>
    <BaseButton v-else class="flex items-center" @click="modalLangOpen = true">
      <BaseIcon size="24" name="earth" class="mr-2" />
      {{ languages[$i18n.locale]?.nativeName ?? languages[$i18n.locale]?.name }}
    </BaseButton>
  </DropdownLanguages>
</template>
