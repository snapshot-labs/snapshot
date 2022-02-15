<script setup>
import { computed } from 'vue';
import { useSpaceCreateForm } from '@/composables/useSpaceCreateForm';

defineProps({
  space: {
    type: Object,
    required: true
  }
});

const { form, choices, preview, sourceProposal, sourceProposalLoaded } =
  useSpaceCreateForm();

const proposal = computed(() =>
  Object.assign(form.value, { choices: choices.value })
);
</script>

<template>
  <div class="h-[1px] w-full" />
  <PluginCreate
    v-if="space?.plugins && (!sourceProposal || sourceProposalLoaded)"
    :proposal="proposal"
    :space="space"
    :preview="preview"
    v-model="form.metadata.plugins"
  />
</template>
