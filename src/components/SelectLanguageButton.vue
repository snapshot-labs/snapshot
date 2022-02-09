<script setup>
import { ref } from 'vue';
import { useWeb3 } from '@/composables/useWeb3';
import languages from '@/locales/languages.json';

const props = defineProps({ space: Object, spaceId: String });

const { web3 } = useWeb3();
const modalLangOpen = ref(false);
</script>

<template>
  <UiButton
    v-bind="$attrs"
    class="flex items-center"
    @click="modalLangOpen = true"
  >
    <Icon size="24" name="earth" class="hover:opacity-80 mr-2" />
    {{ languages[$i18n.locale]?.name }}
  </UiButton>
  <teleport to="#modal">
    <ModalSelectLanguage :open="modalLangOpen" @close="modalLangOpen = false" />
  </teleport>
</template>
