<template>
  <Container :slim="true" class="mt-4">
    <slot />
    <div v-if="$slots['sidebar-left']" class="w-1/4 float-left hidden lg:block">
      <slot name="sidebar-left" />
    </div>
    <div
      v-if="$slots['content-right']"
      class="w-full lg:w-3/4 float-right pl-0 lg:pl-5"
    >
      <slot name="content-right" />
    </div>
    <div class="lg:flex">
      <div v-if="$slots['content-left']" class="w-full lg:w-8/12 lg:pr-5">
        <slot name="content-left" />
      </div>
      <div
        v-if="$slots['sidebar-right']"
        class="w-full lg:w-4/12 lg:min-w-[321px]"
      >
        <slot name="sidebar-right" />
      </div>
    </div>
  </Container>
</template>
