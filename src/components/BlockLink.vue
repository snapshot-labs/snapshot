<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getIpfsUrl } from '@/helpers/utils';

const props = defineProps<{
  link: string;
  title?: string;
}>();
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

onMounted(async () => {
  await update(props.link);
});

async function update(val: string) {
  try {
    preview.value = null;
    new URL(val);
    const IFRAMELY_API_KEY = 'd155718c86be7d5305ccb6';
    const url = `https://cdn.iframe.ly/api/iframely?url=${encodeURI(
      val
    )}&api_key=${IFRAMELY_API_KEY}`;
    const result = await fetch(url);
    preview.value = await result.json();
  } catch (e) {
    console.log(e);
  }
}
</script>

<template>
  <div v-if="preview?.meta?.title">
    <div v-if="title" class="mb-2" v-text="title" />
    <BaseLink :link="getIpfsUrl(link)" hide-external-icon>
      <div
        class="flex items-center rounded-xl border hover:cursor-pointer hover:border-skin-text"
      >
        <div v-if="preview?.links?.icon[0]?.href" class="px-4 pr-0">
          <div class="w-[32px]">
            <IconDiscord
              v-if="preview.links.icon[0].href.includes('discord.com')"
            />
            <img
              v-else
              :src="preview.links.icon[0].href"
              alt="logo"
              width="32"
              height="32"
              class="rounded bg-white"
            />
          </div>
        </div>
        <div class="overflow-hidden px-4 py-3">
          <div class="truncate text-skin-link">{{ preview.meta.title }}</div>
          <div
            v-if="preview.meta.description"
            class="truncate text-sm text-skin-text"
          >
            {{ preview.meta.description }}
          </div>
        </div>
      </div>
    </BaseLink>
  </div>
</template>
