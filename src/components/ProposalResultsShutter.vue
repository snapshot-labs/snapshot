<template>
  <div>
    <div class="-mb-2 mt-2 text-xs">{{ $t('poweredBy') }}</div>

    <div class="flex items-center">
      <div
        v-tippy="{
          content:
            'This proposal has Shutter privacy enabled. All votes will be encrypted until the voting period has ended and the final score is calculated.'
        }"
        class="inline-block cursor-help"
      >
        <i-s-shutter class="h-[36px] text-[70px]" />
      </div>
      <BaseLink link="https://shutter.network/" />
    </div>
  </div>
</template>
