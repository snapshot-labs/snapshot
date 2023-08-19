<script setup lang="ts">
import { debouncedWatch } from '@vueuse/core';

const props = withDefaults(
  defineProps<{
    link: string;
    safeLinkPreview?: boolean;
  }>(),
  {
    safeLinkPreview: true
  }
);

const preview = ref<null | {
  meta: {
    title: string;
    description: string;
  };
  links: {
    icon: {
      href: string;
    }[];
  };
}>(null);

const showModal = ref(false);
const loaded = ref(false);
const error = ref(false);

function handleConfirm() {
  window.open(props.link, '_blank', 'noopener,noreferrer');
}

function handleClickLink() {
  if (props.safeLinkPreview) {
    showModal.value = true;
  } else {
    window.open(props.link, '_blank', 'noopener,noreferrer');
  }
}

async function update(val: string) {
  try {
    error.value = false;
    loaded.value = false;
    preview.value = null;
    new URL(val);
    const IFRAMELY_API_KEY = 'd155718c86be7d5305ccb6';
    const url = `https://cdn.iframe.ly/api/iframely?url=${encodeURI(
      val
    )}&api_key=${IFRAMELY_API_KEY}`;
    const result = await fetch(url);
    const json = await result.json();
    if (json.status === 404) throw new Error('Error fetching link preview');
    preview.value = json;
  } catch (e) {
    console.log(e);
    error.value = true;
  } finally {
    loaded.value = true;
  }
}

debouncedWatch(
  () => props.link,
  newLink => update(newLink),
  { debounce: 500, immediate: true }
);
</script>

<template>
  <div v-if="!error">
    <slot name="title" />
    <button
      type="button"
      class="flex w-full items-center rounded-xl border hover:cursor-pointer hover:border-skin-text"
      @click="handleClickLink"
    >
      <div class="shrink-0 px-4">
        <div v-if="!loaded">
          <div class="lazy-loading h-[32px] w-[32px] rounded-lg" />
        </div>
        <div v-else>
          <div class="w-[32px]">
            <IconDiscord
              v-if="preview?.links.icon[0].href.includes('discord.com')"
            />
            <img
              v-else
              :src="preview?.links.icon[0].href"
              alt="logo"
              width="32"
              height="32"
              class="rounded bg-white"
            />
          </div>
        </div>
      </div>
      <div class="overflow-hidden py-3 pr-4">
        <div v-if="!loaded" class="flex h-[48px] flex-col justify-center">
          <div class="lazy-loading h-[10px] w-[90px] rounded" />
          <div class="lazy-loading mt-2 h-[10px] w-[160px] rounded" />
        </div>
        <div v-else>
          <div class="line-clamp-1 text-left text-skin-link">
            {{ preview?.meta.title }}
          </div>
          <div
            v-if="preview?.meta.description"
            class="line-clamp-1 text-left text-sm text-skin-text"
          >
            {{ preview?.meta.description }}
          </div>
        </div>
      </div>
    </button>
    <Teleport to="#modal">
      <ModalLinkPreview
        :open="showModal"
        :clicked-url="props.link"
        @close="showModal = false"
        @confirm="handleConfirm"
      />
    </Teleport>
  </div>
</template>
