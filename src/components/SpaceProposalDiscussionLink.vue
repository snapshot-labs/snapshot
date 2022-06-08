<script setup>
import { onMounted, ref } from 'vue';
import { getIpfsUrl } from '@/helpers/utils';

const props = defineProps(['discussionLink']);
const preview = ref(false);

onMounted(async () => {
  await update(props.discussionLink);
});

async function update(val) {
  try {
    preview.value = false;
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
    <h3>{{ $t('discussion') }}</h3>
    <BaseLink :link="getIpfsUrl(discussionLink)" hide-external-icon>
      <div
        class="flex items-center border rounded-xl hover:border-skin-text hover:cursor-pointer"
      >
        <div v-if="preview?.links?.icon[0]?.href" class="px-4 pr-0">
          <div>
            <div
              v-if="preview.links.icon[0].href.includes('discord.com')"
              class="bg-[#5865F2] p-2 rounded-full"
            >
              <i-s-discord class="h-[26px] w-[26px]" />
            </div>
            <img
              v-else
              :src="preview.links.icon[0].href"
              width="32"
              height="32"
              class="bg-white rounded"
            />
          </div>
        </div>
        <div class="px-4 py-3 overflow-hidden">
          <div class="text-skin-link truncate">{{ preview.meta.title }}</div>
          <div
            v-if="preview.meta.description"
            class="text-sm text-skin-text truncate"
          >
            {{ preview.meta.description }}
          </div>
        </div>
      </div>
    </BaseLink>
  </div>
</template>
