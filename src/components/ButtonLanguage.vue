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
    <ButtonSidebar v-if="small">
      <BaseIcon size="20" name="earth" class="text-skin-link" />
    </ButtonSidebar>
    <BaseButton
      v-else
      class="flex !h-[44px] items-center"
      @click="modalLangOpen = true"
    >
      <BaseIcon size="24" name="earth" class="mr-2" />
      {{ languages[$i18n.locale]?.nativeName ?? languages[$i18n.locale]?.name }}
    </BaseButton>
  </DropdownLanguages>
</template>
