<template>
  <BaseMessage level="info">
    {{ $t('resultsShutter') }}
    <div class="mt-3">
      <span class="text-sm"> {{ $t('poweredBy') }} </span>
      <BaseLink link="https://shutter.network/" class="flex items-center gap-1">
        <i-s-shutter class="-mt-1 h-[36px] text-[80px]" />
      </BaseLink>
    </div>
  </BaseMessage>
</template>
