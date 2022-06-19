<template>
  <div style="position: fixed; width: 240px">
    <BaseBlock :slim="true" class="overflow-hidden">
      <div class="h-[253px] text-center">
        <div class="mb-2 pt-3">
          <div class="lazy-loading mx-auto h-[80px] w-[80px] rounded-full" />

          <div
            class="lazy-loading mx-auto mb-2 mt-3 h-[28px] w-[130px] rounded-md bg-skin-text"
          />
          <div
            class="lazy-loading mx-auto mb-2 h-[26px] w-[100px] rounded-md bg-skin-text"
          />
        </div>
        <div class="flex justify-center gap-x-2">
          <BaseButton class="w-[120px] cursor-wait">{{
            $t('join')
          }}</BaseButton>
        </div>
      </div>
      <SpaceSidebarNavigation />
      <SpaceSidebarFooter />
    </BaseBlock>
  </div>
</template>
