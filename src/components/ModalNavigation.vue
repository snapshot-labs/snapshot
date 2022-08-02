<script setup lang="ts">
import { ref, watch } from 'vue';
import pkg from '@/../package.json';

const commitSha = import.meta.env.VITE_COMMIT_SHA;

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits(['close']);

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

const isSettingsOpen = ref(false);

watch(
  () => props.open,
  () => {
    isSettingsOpen.value = false;
  }
);
</script>

<template>
  <BaseModal :open="open" @close="emit('close')">
    <div v-if="isSettingsOpen" class="relative m-4">
      <div class="space-y-4 pt-3">
        <div class="space-y-3">
          <h4>Theme</h4>
          <SelectTheme />
        </div>
        <div class="space-y-3 border-t pt-3 pb-3">
          <h4>Language</h4>
          <ButtonLanguage class="!h-[42px]" />
        </div>
      </div>
    </div>
    <div v-else>
      <div class="m-4 space-y-1 py-3">
        <BaseLink
          v-for="item in navigationItems"
          :key="item.name"
          :link="{ name: item.link }"
          class="block pr-[100px] text-xl font-semibold"
          @click="emit('close')"
        >
          {{ item.name }}
        </BaseLink>

        <div
          class="group flex cursor-pointer items-center justify-between text-xl font-semibold text-skin-link"
          @click="isSettingsOpen = !isSettingsOpen"
        >
          <span> Settings </span>
          <i-ho-chevron-down
            :class="[
              'text-base text-skin-text group-hover:text-skin-link',
              [isSettingsOpen ? 'rotate-0' : '-rotate-90']
            ]"
          />
        </div>
      </div>
      <div class="mt-4 border-t">
        <div class="m-4 mt-3 flex items-end justify-between">
          <FooterSocials class="!mt-0 inline-flex justify-start" />
          <div class="text-xs leading-4">
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
  </BaseModal>
</template>
