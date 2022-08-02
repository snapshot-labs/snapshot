<script setup lang="ts">
import pkg from '@/../package.json';
import { useSkin } from '@/composables/useSkin';

const { toggleUserTheme, getThemeIcon } = useSkin();

const commitSha = import.meta.env.VITE_COMMIT_SHA;

const navigationItems = [
  {
    name: 'Explore',
    link: 'home'
  },
  {
    name: 'Timeline',
    link: 'timeline'
  },
  {
    name: 'Create a space',
    link: 'setup'
  }
];
</script>

<template>
  <BaseDropdown :items="null" placement="bottom-end">
    <template #button>
      <ButtonSidebar class="relative !h-[46px] !w-[46px]">
        <i-ho-dots-horizontal class="text-skin-link" />
      </ButtonSidebar>
    </template>
    <template #header>
      <div class="w-[360px]">
        <div class="m-4 flex justify-between">
          <ButtonSidebar
            :aria-label="$t('toggleSkin')"
            class="text-skin-link"
            @click.stop="toggleUserTheme"
          >
            <i-ho-moon v-if="getThemeIcon() === 'moon'" />
            <i-ho-sun v-if="getThemeIcon() === 'sun'" />
          </ButtonSidebar>

          <ButtonLanguage class="!h-[42px]" />
        </div>
        <div class="group m-4 py-1">
          <BaseLink
            v-for="item in navigationItems"
            :key="item.name"
            :link="{ name: item.link }"
            class="block py-1 pr-[100px] text-xl hover:!text-skin-link group-hover:text-skin-text"
          >
            {{ item.name }}
          </BaseLink>
        </div>

        <div class="mt-4 border-t">
          <div class="m-4 flex items-center justify-between">
            <FooterSocials class="inline-flex justify-start !pt-0" />
            <div class="max-w-[100px] text-xs leading-4 opacity-40">
              Snapshot
              <BaseLink
                v-if="commitSha"
                :link="`https://github.com/${pkg.repository}/tree/${commitSha}`"
              >
                v{{ pkg.version }}#{{ commitSha.slice(0, 7) }}
              </BaseLink>
              <span v-else v-text="`v${pkg.version}`" />
            </div>
          </div>
        </div>
      </div>
    </template>
  </BaseDropdown>
</template>
