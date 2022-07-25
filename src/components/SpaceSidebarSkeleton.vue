<template>
  <div class="mb-4 lg:fixed lg:mb-0 lg:w-[240px]">
    <BaseBlock :slim="true" class="overflow-hidden">
      <div class="flex px-4 pt-3 text-center lg:block lg:h-[253px]">
        <div class="mb-2 flex lg:mb-3 lg:block">
          <div class="lazy-loading mx-auto h-[80px] w-[80px] rounded-full" />

          <div
            class="ml-3 flex flex-col items-start justify-center lg:mt-3 lg:ml-0 lg:items-center"
          >
            <div
              class="lazy-loading mb-2 h-[28px] w-[130px] rounded-md bg-skin-text"
            />
            <div
              class="lazy-loading h-[26px] w-[100px] rounded-md bg-skin-text"
            />
          </div>
        </div>
        <div class="ml-3 flex items-center justify-center gap-x-2 lg:ml-0">
          <BaseButton class="w-[120px] cursor-wait">
            {{ $t('join') }}
          </BaseButton>
        </div>
      </div>
      <SpaceSidebarNavigation />
    </BaseBlock>
  </div>
</template>
