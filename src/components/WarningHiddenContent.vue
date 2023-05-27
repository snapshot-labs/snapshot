<script setup lang="ts">
const props = defineProps<{
  type: string;
}>();

const { t } = useI18n();

const warningText = computed(() => {
  if (props.type === 'proposal') {
    return t('warningFlaggedProposal');
  }
  return t('warningFlaggedSpace');
});
</script>

<template>
  <div class="flex justify-between rounded-xl border py-3 pl-4">
    <div class="flex items-center">
      {{ warningText }}
    </div>
    <div>
      <button @click.prevent="$emit('forceShow')">
        <div class="px-4 py-3 hover:text-skin-link">{{ $t('warningFlaggedActionShow') }}</div>
      </button>
    </div>
  </div>
</template>