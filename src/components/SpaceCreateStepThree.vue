<script setup lang="ts">
import { computed } from 'vue';
import { useCreateProposal } from '@/composables/useCreateProposal';

defineProps<{
  space: { plugins? };
}>();

const { form, choices, preview, sourceProposal, sourceProposalLoaded } =
  useCreateProposal();

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
