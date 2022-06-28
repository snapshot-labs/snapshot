<template>
  <BaseMessage level="info">
    {{ $t('resultsShutter') }}
    <div class="mt-3">
      <BaseLink link="https://shutter.network/" hide-external-icon>
        <span class="text-sm"> {{ $t('poweredBy') }} </span>
        <i-s-shutter class="-mt-1 h-[40px] w-[130px]" />
      </BaseLink>
    </div>
  </BaseMessage>
</template>
