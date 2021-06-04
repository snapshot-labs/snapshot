<template>
  <UiLoading v-if="loading" />
  <label v-else class="file-select">
    <input type="file" @change="handleFileChange" accept="image/*" />
    <slot />
  </label>
</template>

<script>
export default {
  data() {
    return {
      loading: false
    };
  },
  methods: {
    async handleFileChange(e) {
      this.loading = true;
      this.$emit('loading', this.loading);
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);
      try {
        const url = `${process.env.VUE_APP_HUB_URL}/api/upload`;
        const init = {
          method: 'POST',
          body: formData
        };
        const result = await fetch(url, init);
        const output = await result.json();
        this.$emit('input', `ipfs://${output.file.ipfs_hash}`);
        this.loading = false;
        this.$emit('loading', this.loading);
      } catch (error) {
        this.loading = false;
        this.$emit('loading', this.loading);
        console.log(error);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.file-select > input[type='file'] {
  display: none;
  font-weight: normal;
}
label {
  all: initial;
  all: unset;

  &:hover {
    cursor: pointer;
  }
}
</style>
