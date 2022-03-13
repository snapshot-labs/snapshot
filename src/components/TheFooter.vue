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
  <Container
    class="flex flex-col md:flex-row items-center py-6 space-y-3 md:space-y-0 md:space-x-3 px-0 pb-3"
  >
    <div class="space-x-3 md:ml-auto">
      <span v-for="social in socials" :key="social">
        <BaseLink :link="social.link" hide-external-icon>
          <Icon
            size="30"
            class="opacity-40 hover:opacity-80 text-skin-text transition-opacity"
            :name="social.icon"
          />
        </BaseLink>
      </span>
    </div>
    <div class="flex space-x-2">
      <UiSidebarButton @click="modalAboutOpen = true">
        <span class="text-skin-link">?</span>
      </UiSidebarButton>
      <UiSidebarButton @click="toggleUserTheme" :aria-label="$t('toggleSkin')">
        <Icon size="20" class="text-skin-link" :name="getThemeIcon()" />
      </UiSidebarButton>
      <SelectLanguageButton />
    </div>
    <div
      class="pt-3 md:pt-0 md:pr-2 md:order-first whitespace-nowrap opacity-40"
    >
      © {{ yearNow }} Snapshot Labs.
    </div>
  </Container>
  <teleport to="#modal">
    <ModalAbout
      :open="modalAboutOpen"
      @close="modalAboutOpen = false"
      @openLang="modalLangOpen = true"
    />
  </teleport>
</template>
