<script setup lang="ts">
import { useSkin } from '@/composables';

const { toggleUserTheme, getThemeIcon } = useSkin();
</script>

<template>
  <ButtonSidebar
    :aria-label="$t('toggleSkin')"
    class="text-skin-text hover:text-skin-link"
    @click="toggleUserTheme"
  >
    <i-ho-moon v-if="getThemeIcon() === 'moon'" />
    <i-ho-sun v-if="getThemeIcon() === 'sun'" />
  </ButtonSidebar>
</template>
