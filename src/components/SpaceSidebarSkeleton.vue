<template>
  <div class="mb-4">
    <BaseBlock :slim="true" class="overflow-hidden !border-t-0 md:!border-t">
      <div class="mx-3 mb-4 items-end text-center md:mt-3 md:flex lg:block">
        <div>
          <div class="lazy-loading h-[48px] w-[48px] rounded-full" />

          <div class="mt-2 flex flex-col items-start justify-center">
            <div
              class="lazy-loading mb-2 h-[28px] w-[130px] rounded-md bg-skin-text"
            />
            <div
              class="lazy-loading h-[20px] w-[100px] rounded-md bg-skin-text"
            />
          </div>
        </div>
        <div class="mt-[12px] flex w-full justify-end">
          <BaseButton class="w-full cursor-wait md:max-w-[180px] lg:max-w-none">
            {{ $t('join') }}
          </BaseButton>
        </div>
      </div>
    </BaseBlock>
  </div>
</template>
