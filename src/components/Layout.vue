<template>
  <Container :slim="true">
    <div
      v-if="$slots['sidebar-left']"
      class="col-12 col-lg-3 float-left hide-sm hide-md hide-lg"
    >
      <slot name="sidebar-left" />
    </div>
    <div
      v-if="$slots['content-right']"
      class="col-12 col-lg-9 float-right pl-0 pl-lg-5"
    >
      <slot name="content-right" />
    </div>
    <div
      v-if="$slots['content-left']"
      class="col-12 col-lg-8 float-left pr-0 pr-lg-5"
    >
      <slot name="content-left" />
    </div>
    <div v-if="$slots['sidebar-right']" class="col-12 col-lg-4 float-left">
      <slot name="sidebar-right" />
    </div>
  </Container>
</template>
