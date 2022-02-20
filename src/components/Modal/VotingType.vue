<script setup>
defineProps({
  open: {
    type: Boolean,
    required: true
  },
  selected: String,
  allowAny: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'update:selected']);

const types = [
  'single-choice',
  'approval',
  'quadratic',
  'ranked-choice',
  'weighted',
  'basic'
];

function select(id) {
  emit('update:selected', id);
  emit('close');
}
</script>

<template>
  <UiModal :open="open" @close="$emit('close')">
    <template v-slot:header>
      <h3>{{ $t('voting.selectVoting') }}</h3>
    </template>
    <div class="mt-4 mx-0 md:mx-4">
      <a v-if="allowAny" @click="select(undefined)">
        <Block
          :class="[
            'transition-colors relative voting-type',
            { 'voting-type-active': !selected }
          ]"
        >
          <i
            v-if="!selected"
            class="iconfont iconcheck1 absolute top-2 right-2 text-lg"
          />
          <h3>
            {{ $t('settings.anyType') }}
          </h3>
        </Block>
      </a>
      <a v-for="(type, key) in types" :key="key" @click="select(type)">
        <Block
          :class="[
            'transition-colors relative voting-type',
            { 'voting-type-active': type === selected }
          ]"
        >
          <i
            v-if="type === selected"
            class="iconfont iconcheck1 absolute top-2 right-2 text-lg"
          />
          <h3 v-text="$t(`voting.${type}`)" class="mt-0" />
          <div
            v-text="$t(`voting.description.${type}`)"
            class="text-skin-text"
          />
        </Block>
      </a>
    </div>
  </UiModal>
</template>

<style scoped lang="scss">
.voting-type {
  &.voting-type-active,
  &:hover {
    border-color: var(--link-color);
  }
}
</style>
