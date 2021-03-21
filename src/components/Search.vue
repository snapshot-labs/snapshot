<template>
  <div
    class="d-flex flex-items-center"
    :class="{ 'bg-color border-bottom py-3 px-4': modal }"
  >
    <Icon name="search" size="22" class="mb-1 mr-2 text-gray" />
    <input
      :value="modelValue"
      :placeholder="placeholder"
      @input="handleInput"
      type="text"
      autocorrect="off"
      autocapitalize="none"
      class="border-0 input flex-auto width-full"
    />
    <a @click="clearInput">
      <Icon v-if="modelValue" name="close" size="12" class="mb-1" />
    </a>
    <UiDropdown
      class="search-dropdown"
      @redirect="redirectSearch"
      :items="searchOptions"
      v-if="!modal"
    >
      <span v-text="searchSelectedOption" />
      <i class="iconfont iconarrow-down ml-1"></i>
    </UiDropdown>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      searchOptions: [
        { text: 'Spaces', action: 'redirect', options: { route: 'home' } },
        {
          text: 'Strategies',
          action: 'redirect',
          options: { route: 'strategies' }
        },
        { text: 'Skins', action: 'redirect', options: { route: 'skins' } },
        {
          text: 'Networks',
          action: 'redirect',
          options: { route: 'networks' }
        },
        { text: 'Plugins', action: 'redirect', options: { route: 'plugins' } }
      ]
    };
  },
  computed: {
    searchSelectedOption() {
      return (
        this.searchOptions.find(
          option => option.options.route === this.$route.name
        )?.text || 'home'
      );
    }
  },
  props: ['modelValue', 'placeholder', 'modal'],
  emits: ['update:modelValue'],
  methods: {
    handleInput(e) {
      const input = e.target.value;
      if (!this.modal) this.$router.push({ query: input ? { q: input } : {} });
      this.$emit('update:modelValue', input);
    },
    clearInput() {
      if (!this.modal) this.$router.push({});
      this.$emit('update:modelValue', '');
    },
    redirectSearch(e) {
      this.$router.push({
        name: e.route,
        query: this.modelValue ? { q: this.modelValue } : {}
      });
    }
  }
};
</script>
