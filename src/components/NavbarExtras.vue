<script setup lang="ts">
import pkg from '@/../package.json';
import { useApp } from '@/composables';
import { useRouter } from 'vue-router';
import { PopoverButton } from '@headlessui/vue';

const { domain } = useApp();
const router = useRouter();

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

function clickNavigationItem(item: any) {
  if (domain) window.open(`https://snapshot.org/#/${item.link}`, '_blank');
  else router.push({ name: item.link });
}
</script>

<template>
  <BasePopover>
    <template #button>
      <ButtonSidebar class="relative !h-[46px] !w-[46px]">
        <i-ho-dots-horizontal class="text-skin-link" />
      </ButtonSidebar>
    </template>
    <template #content>
      <div>
        <div class="m-4 flex justify-between">
          <div>
            <ButtonTheme v-if="!domain" />
          </div>
          <MenuLanguages class="!h-[42px]" />
        </div>
        <div class="group m-4 my-[30px]">
          <PopoverButton
            v-for="item in navigationItems"
            :key="item.name"
            as="div"
            class="block cursor-pointer py-1 text-xl text-skin-link hover:!text-skin-link hover:!opacity-100 group-hover:text-skin-text group-hover:opacity-70"
            @click="clickNavigationItem(item)"
          >
            {{ item.name }}
          </PopoverButton>
        </div>

        <div class="mt-4 border-t">
          <div class="m-4 flex items-center justify-between">
            <FooterSocials class="inline-flex justify-start !pt-0" />
            <div class="text-sm leading-4 opacity-40">
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
  </BasePopover>
</template>
