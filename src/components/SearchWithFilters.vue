<template>
  <div class="position-relative">
    <Search
      :modelValue="modelValue"
      @update:modelValue="input => $emit('update:modelValue', input)"
      :placeholder="$t('searchPlaceholder')"
    >
      <template v-slot:searchWithFilters>
        <UiDropdown
          top="3.5rem"
          right="1.0rem"
          class="search-dropdown text-left"
          @select="redirectSearch"
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
      this.$router.push({
        name: e,
        query: this.modelValue ? { q: this.modelValue } : {}
      });
    }
  },
  computed: {
    searchSelectedOption() {
      return (
        this.searchOptions.find(option => option.action === this.$route.name)
          ?.text || 'home'
      );
    },
    searchOptions() {
      return [
        {
          text: this.$t('spaces'),
          action: 'home'
        },
        {
          text: this.$t('strategiesPage'),
          action: 'strategies'
        },
        {
          text: this.$t('skins'),
          action: 'skins'
        },
        {
          text: this.$t('networks'),
          action: 'networks'
        },
        {
          text: this.$t('plugins'),
          action: 'plugins'
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
  padding: 4px 15px 0 10px;
  &:hover {
    border-color: var(--link-color);
  }
}
</style>
