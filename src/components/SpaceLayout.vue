<template>
  <Container :slim="true">
    <slot />
    <div class="mx-4 mx-md-0 d-flex flex-justify-between mb-3 hide-xl">
      <div v-text="showMenu ? '' : space.name" />
      <Icon
        :name="showMenu ? 'close' : 'threedots'"
        size="25"
        class="menu-btn v-align-text-bottom text-white"
        @click="handleMenuToggle"
      />
    </div>
    <div
      :class="
        'col-12 col-lg-3 float-left ' +
        (showMenu ? 'anim-fade-in' : 'hide-sm hide-md hide-lg')
      "
    >
      <BlockSpace :space="space" />
    </div>
    <div
      v-if="$slots['content-right']"
      :class="'col-12 col-lg-9 float-right pl-0 pl-lg-5'"
    >
      <slot name="content-right" />
    </div>
  </Container>
</template>
<script>
export default {
  props: ['space'],
  data: function () {
    return {
      showMenu: false
    };
  },
  methods: {
    handleMenuToggle() {
      this.showMenu = !this.showMenu;
    }
  }
};
</script>
<style>
.menu-btn {
  cursor: pointer;
}
</style>
