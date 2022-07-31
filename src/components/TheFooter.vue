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
  <div class="-mt-3 space-y-4 border-t py-6">
    <BaseContainer
      class="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0 md:space-x-3"
    >
      <div class="mx-auto md:mx-0">
        <div class="mb-2 text-md text-skin-link">
          {{ $t('newsletter.title') }}
        </div>

        <InputNewsletter tag="6449077" class="relative w-[300px]" />
      </div>

      <div class="">
        <div class="hidden pb-1 text-md text-skin-link md:block">
          {{ $t('joinCommunity') }}
        </div>
        <div class="flex justify-center space-x-3 pt-2">
          <span v-for="social in socials" :key="social">
            <BaseLink :link="social.link" hide-external-icon>
              <BaseIcon
                size="30"
                class="text-skin-text opacity-80 transition-opacity hover:opacity-100"
                :name="social.icon"
              />
            </BaseLink>
          </span>
        </div>
      </div>
    </BaseContainer>
    <BaseContainer
      class="flex flex-col items-center space-y-4 md:flex-row md:space-y-0 md:space-x-3"
    >
      <div class="flex space-x-2 md:ml-auto">
        <ButtonSidebar @click="modalAboutOpen = true">
          <span class="text-skin-link">?</span>
        </ButtonSidebar>
        <ButtonSidebar :aria-label="$t('toggleSkin')" @click="toggleUserTheme">
          <BaseIcon size="20" class="text-skin-link" :name="getThemeIcon()" />
        </ButtonSidebar>

        <ButtonLanguage class="!h-[42px]" />
      </div>
      <div
        class="!ml-0 whitespace-nowrap opacity-40 md:order-first md:pt-0 md:pr-2"
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
  </div>
</template>
