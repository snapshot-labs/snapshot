<template>
  <BaseContainer :slim="true">
    <slot />
    <div
      v-if="$slots['sidebar-left']"
      id="sidebar-left"
      class="float-left hidden w-1/4 lg:block"
    >
      <slot name="sidebar-left" />
    </div>
    <div
      v-if="$slots['content-right']"
      id="content-right"
      class="relative float-right w-full pl-0 lg:w-3/4 lg:pl-5"
    >
      <slot name="content-right" />
    </div>
    <div class="lg:flex">
      <div
        v-if="$slots['content-left']"
        id="content-left"
        class="relative w-full lg:w-8/12 lg:pr-5"
      >
        <slot name="content-left" />
      </div>
      <div
        v-if="$slots['sidebar-right']"
        id="sidebar-right"
        class="w-full lg:w-4/12 lg:min-w-[321px]"
      >
        <slot name="sidebar-right" />
      </div>
    </div>
  </BaseContainer>
</template>
