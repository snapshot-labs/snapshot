<script setup>
import { computed } from 'vue';
import languages from '@/locales/languages.json';
import { useI18n } from '@/composables/useI18n';

defineProps({
  open: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close']);

const { setLocale } = useI18n();

const locales = computed(() => Object.keys(languages));

function selectLang(locale) {
  setLocale(locale);
  emit('close');
}
</script>

<template>
  <BaseModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('language') }}</h3>
    </template>
    <div class="text-center mt-4 mb-3 px-4 w-full">
      <BaseButton
        v-for="locale in locales"
        :key="locale"
        @click="selectLang(locale)"
        class="w-full mb-2"
      >
        {{
          locale === 'en-US'
            ? languages[locale].name
            : languages[locale].nativeName
        }}
        {{}}
      </BaseButton>
    </div>
  </BaseModal>
</template>
