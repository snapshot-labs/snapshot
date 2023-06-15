<script setup lang="ts">
const props = defineProps<{
  type: string;
  responsive?: boolean;
}>();

const emit = defineEmits(['forceShow']);

const { t } = useI18n();

const warningText = computed(() => {
  if (props.type === 'proposal') {
    return t('warningFlaggedProposal');
  }
  return t('warningFlaggedSpace');
});
</script>

<template>
  <div
    class="flex justify-between py-3 pl-4"
    :class="[
      { 'rounded-xl border': !responsive },
      { 'rounded-none border-y md:rounded-xl md:border': responsive }
    ]"
  >
    <div class="flex items-center">
      {{ warningText }}
    </div>
    <div>
      <button @click.prevent="emit('forceShow')">
        <div class="px-4 py-3 hover:text-skin-link">
          {{ $t('warningFlaggedActionShow') }}
        </div>
      </button>
    </div>
  </div>
</template>
