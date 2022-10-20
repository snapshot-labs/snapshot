<template>
  <div>
    <div class="-mb-2 mt-2 text-xs">{{ $t('poweredBy') }}</div>

    <div class="flex items-center">
      <BaseLink
        v-tippy="{
          content: $t('privacy.shutter.tooltip')
        }"
        :link="$t('privacy.shutter.url')"
        hide-external-icon
        class="inline-block cursor-pointer"
      >
        <i-s-shutter class="h-[36px] text-[70px]" />
      </BaseLink>
    </div>
  </div>
</template>
