<template>
  <button class="ml-4 h-full cursor-pointer bg-skin-bg text-skin-link">
    <div class="flex justify-center">
      <div
        class="flex h-[54px] w-[54px] items-center justify-center rounded-full border hover:border-skin-text"
      >
        <i-ho-dots-horizontal class="text-sm" />
      </div>
    </div>
    <div class="text-center text-xs">{{ $t('seeAll') }}</div>
  </button>
</template>
