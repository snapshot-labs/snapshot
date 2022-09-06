<template>
  <div>
    <div class="-mb-2 mt-2 text-xs">{{ $t('poweredBy') }}</div>

    <div class="flex items-center">
      <div
        v-tippy="{
          content: $t('privacy.shutter.tooltip')
        }"
        class="inline-block cursor-help"
      >
        <i-s-shutter class="h-[36px] text-[70px]" />
      </div>
      <BaseLink :link="$t('privacy.shutter.url')" />
    </div>
  </div>
</template>
