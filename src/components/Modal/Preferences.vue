<script setup>
import {} from 'vue';
import languages from '@/locales/languages.json';
import { useUserSkin } from '@/composables/useUserSkin';
import { useDomain } from '@/composables/useDomain';

const { toggleSkin, getSkinIcon } = useUserSkin();
const { domain } = useDomain();

defineProps(['open']);
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>
        {{ $t('preferences') }}
      </h3>
    </template>
    <div class="m-4 p-4 mt-3 border rounded-md link-color">
      <div class="flex">
        <span v-text="$t('language')" class="flex-auto text-color mr-1" />
        <a @click="$emit('lang'), $emit('close')">
          {{ languages[$i18n.locale]?.name }}
          <Icon size="14" name="arrow-down" class="mt-1" />
        </a>
      </div>
      <div v-if="!domain" class="flex mt-3">
        <span v-text="$t('theme')" class="flex-auto text-color mr-1" />
        <a @click="toggleSkin">
          <Icon size="20" class="link-color" :name="getSkinIcon()" />
        </a>
      </div>
    </div>
  </UiModal>
</template>
