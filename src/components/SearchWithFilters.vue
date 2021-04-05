<template>
  <div class="position-relative">
    <Search
      :modelValue="modelValue"
      @update:modelValue="input => $emit('update:modelValue', input)"
      :placeholder="$t('searchPlaceholder')"
    >
      <template v-slot:searchWithFilters>
        <UiDropdown
          class="search-dropdown text-left"
          @redirect="redirectSearch"
          :items="searchOptions"
        >
          <span v-text="searchSelectedOption" />
          <Icon name="arrow-down" class="ml-1" />
        </UiDropdown>
      </template>
    </Search>
  </div>
</template>

<script>
export default {
  props: ['modelValue'],
  methods: {
    redirectSearch(e) {
      console.log(e);
      this.$router.push({
        name: e.route,
        query: this.modelValue ? { q: this.modelValue } : {}
      });
    }
  },
  computed: {
    searchSelectedOption() {
      return (
        this.searchOptions.find(
          option => option.options.route === this.$route.name
        )?.text || 'home'
      );
    },
    searchOptions() {
      return [
        {
          text: this.$t('spaces'),
          action: 'redirect',
          options: { route: 'home' }
        },
        {
          text: this.$t('strategiesPage'),
          action: 'redirect',
          options: { route: 'strategies' }
        },
        {
          text: this.$t('skins'),
          action: 'redirect',
          options: { route: 'skins' }
        },
        {
          text: this.$t('networks'),
          action: 'redirect',
          options: { route: 'networks' }
        },
        {
          text: this.$t('plugins'),
          action: 'redirect',
          options: { route: 'plugins' }
        }
      ];
    }
  }
};
</script>

<style scoped lang="scss">
.search-dropdown {
  top: -2px;
  right: -26px;
  line-height: 40px;
  z-index: 1;
  border-left: 1px solid var(--border-color);
  padding: 4px 5px 0 10px;
  &:hover {
    border-color: var(--link-color);
  }
}
</style>
