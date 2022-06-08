<template>
  <BaseContainer :slim="true">
    <slot />
    <div
      v-if="$slots['sidebar-left']"
      class="float-left hidden w-1/4 lg:block"
      id="sidebar-left"
    >
      <slot name="sidebar-left" />
    </div>
    <div
      v-if="$slots['content-right']"
      class="relative float-right w-full pl-0 lg:w-3/4 lg:pl-5"
      id="content-right"
    >
      <slot name="content-right" />
    </div>
    <div class="lg:flex">
      <div
        v-if="$slots['content-left']"
        class="relative w-full lg:w-8/12 lg:pr-5"
        id="content-left"
      >
        <slot name="content-left" />
      </div>
      <div
        v-if="$slots['sidebar-right']"
        class="w-full lg:w-4/12 lg:min-w-[321px]"
        id="sidebar-right"
      >
        <slot name="sidebar-right" />
      </div>
    </div>
  </BaseContainer>
</template>
