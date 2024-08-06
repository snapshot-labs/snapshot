<template>
  <div>
    <div class="flex items-center mt-3">
      <BaseLink
        v-tippy="{
          content: $t('privacy.shutter.tooltip')
        }"
        :link="$t('privacy.shutter.url')"
        hide-external-icon
        class="inline-block cursor-pointer"
      >
        <i-s-shutter class="w-[80px]" />
      </BaseLink>
    </div>
  </div>
</template>
