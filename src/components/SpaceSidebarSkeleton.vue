<template>
  <div style="position: fixed; width: 240px">
    <BaseBlock :slim="true" class="overflow-hidden">
      <div class="text-center h-[253px]">
        <div class="pt-3 mb-2">
          <div class="h-[80px] w-[80px] mx-auto lazy-loading rounded-full" />

          <div
            class="bg-skin-text h-[28px] rounded-md lazy-loading mb-2 mt-3 w-[130px] mx-auto"
          />
          <div
            class="bg-skin-text h-[26px] rounded-md lazy-loading w-[100px] mb-2 mx-auto"
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
