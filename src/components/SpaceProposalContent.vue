<script setup lang="ts">
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
defineProps<{
  space: ExtendedSpace;
  proposal: Proposal;
}>();

const showFullMarkdownBody = ref(false);

// Scroll to top of the page after clicking "Show less" button
watch(showFullMarkdownBody, () => {
  if (!showFullMarkdownBody.value) window.scrollTo(0, 0);
});

// Ref to the proposal body element
const markdownBody = ref<HTMLElement | null>(null);

// Detect if the proposal body is too long and should be shortened
const truncateMarkdownBody = computed(() => {
  const markdownBodyHeight = markdownBody.value?.clientHeight
    ? markdownBody.value.clientHeight
    : 0;
  return markdownBodyHeight > 400 ? true : false;
});
</script>

<template>
  <div v-if="proposal.body.length" class="relative">
    <div
      v-if="!showFullMarkdownBody && truncateMarkdownBody"
      class="absolute bottom-0 h-[80px] w-full bg-gradient-to-t from-skin-bg"
    />
    <div
      v-if="truncateMarkdownBody"
      class="absolute flex w-full justify-center"
      :class="{
        '-bottom-[64px]': showFullMarkdownBody,
        '-bottom-[14px]': !showFullMarkdownBody
      }"
    >
      <BaseButton
        class="z-10 !bg-skin-bg"
        @click="showFullMarkdownBody = !showFullMarkdownBody"
      >
        {{
          showFullMarkdownBody
            ? $t('proposals.showLess')
            : $t('proposals.showMore')
        }}
      </BaseButton>
    </div>
    <div
      class="overflow-hidden"
      :class="{
        'h-[420px]': !showFullMarkdownBody && truncateMarkdownBody,
        'mb-[92px]': showFullMarkdownBody,
        'mb-[56px]': !showFullMarkdownBody
      }"
    >
      <div ref="markdownBody">
        <BaseMarkdown
          :body="proposal.body"
          data-testid="proposal-page-content"
        />
      </div>
    </div>
  </div>
</template>
