<script setup>
import { computed, defineProps } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  proposal: Object
});

const { t } = useI18n();

const state = computed(() => {
  const ts = (Date.now() / 1e3).toFixed();
  const { start, end } = props.proposal.msg.payload;
  if (ts > end)
    return { name: t('proposals.states.closed'), class: 'bg-purple' };
  if (ts > start)
    return { name: t('proposals.states.active'), class: 'bg-green' };
  return { name: t('proposals.states.pending') };
});
</script>

<template>
  <span :class="state.class" v-text="state.name" class="State text-normal" />
</template>
