<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('voting.selectVoting') }}</h3>
    </template>
    <div class="mt-4 mx-0 mx-md-4">
      <a v-for="type in types" :key="type" @click="select(type)">
        <Block class="button--submit">
          <h3 v-text="$t(`voting.${type}`)" />
          <div v-text="$t(`voting.description.${type}`)" class="text-gray" />
        </Block>
      </a>
    </div>
  </UiModal>
</template>

<script>
export default {
  props: {
    open: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      types: ['single-choice', 'approval', 'quadratic']
    };
  },
  methods: {
    select(id) {
      this.$emit('update:modelValue', id);
      this.$emit('close');
    }
  }
};
</script>
