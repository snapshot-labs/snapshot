<script setup>
import { ref } from 'vue';
import { useSkin } from '@/composables/useSkin';
const { toggleUserTheme, getThemeIcon } = useSkin();

const modalAboutOpen = ref(false);
const yearNow = new Date().getFullYear();

const socials = [
  {
    icon: 'twitter',
    link: 'https://twitter.com/SnapshotLabs'
  },
  {
    icon: 'discord',
    link: 'https://discord.gg/snapshot'
  },
  {
    icon: 'telegram',
    link: 'https://t.me/snapshotlabs'
  },
  {
    icon: 'github',
    link: `https://github.com/snapshot-labs`
  },
  {
    icon: 'gitbook',
    link: 'https://docs.snapshot.org/'
  }
];
</script>

<template>
  <BaseContainer
    class="flex flex-col items-center space-y-3 py-4 md:flex-row md:space-y-0 md:space-x-3"
  >
    <div class="space-x-3 md:ml-auto">
      <span v-for="social in socials" :key="social">
        <BaseLink :link="social.link" hide-external-icon>
          <BaseIcon
            size="30"
            class="text-skin-text opacity-40 transition-opacity hover:opacity-80"
            :name="social.icon"
          />
        </BaseLink>
      </span>
    </div>
    <div class="flex space-x-2">
      <ButtonSidebar @click="modalAboutOpen = true">
        <span class="text-skin-link">?</span>
      </ButtonSidebar>
      <ButtonSidebar @click="toggleUserTheme" :aria-label="$t('toggleSkin')">
        <BaseIcon size="20" class="text-skin-link" :name="getThemeIcon()" />
      </ButtonSidebar>

      <ButtonLanguage />
    </div>
    <div
      class="whitespace-nowrap pt-3 opacity-40 md:order-first md:pt-0 md:pr-2"
    >
      © {{ yearNow }} Snapshot Labs.
    </div>
  </BaseContainer>
  <teleport to="#modal">
    <ModalAbout
      :open="modalAboutOpen"
      @close="modalAboutOpen = false"
      @openLang="modalLangOpen = true"
    />
  </teleport>
</template>
