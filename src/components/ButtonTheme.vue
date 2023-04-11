<script setup lang="ts">
const { toggleUserTheme, getThemeIcon } = useSkin();
</script>

<template>
  <BaseButtonRound
    :aria-label="$t('toggleSkin')"
    class="text-skin-text hover:text-skin-link"
    @click="toggleUserTheme"
  >
    <i-ho-moon v-if="getThemeIcon() === 'moon'" />
    <i-ho-sun v-if="getThemeIcon() === 'sun'" />
  </BaseButtonRound>
</template>
