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
  <BaseModal :open="open" @close="$emit('close')">
    <template #header>
      <h3>{{ $t('voting.selectVoting') }}</h3>
    </template>
    <div class="mx-0 mt-4 flex flex-col space-y-3 md:mx-4">
      <a v-if="allowAny" @click="select(undefined)">
        <BaseBlock
          :class="[
            'voting-type relative transition-colors hover:border-skin-text',
            { '!border-skin-link': !selected }
          ]"
        >
          <i
            v-if="!selected"
            class="iconfont iconcheck1 absolute top-2 right-2 text-lg"
          />
          <h3>
            {{ $t('settings.anyType') }}
          </h3>
        </BaseBlock>
      </a>
      <a v-for="(type, key) in types" :key="key" @click="select(type)">
        <BaseBlock
          :class="[
            'voting-type relative transition-colors hover:border-skin-text',
            { '!border-skin-link': type === selected }
          ]"
        >
          <i
            v-if="type === selected"
            class="iconfont iconcheck1 absolute top-2 right-2 text-lg"
          />
          <h3 class="mt-0" v-text="$t(`voting.${type}`)" />
          <div
            class="text-skin-text"
            v-text="$t(`voting.description.${type}`)"
          />
        </BaseBlock>
      </a>
    </div>
  </BaseModal>
</template>
