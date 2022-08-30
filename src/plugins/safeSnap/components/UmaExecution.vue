<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ModuleExecutionData } from '@/helpers/safe';
import { useSafeUmaModule } from '@/composables';

const props = defineProps<{
  executionData: ModuleExecutionData;
  proposalId: string;
}>();

const umaModule = useSafeUmaModule(props.executionData, props.proposalId);

const loading = ref(true);
onMounted(async () => {
  loading.value = false;
});
</script>

<template>
  <div>
    <LoadingSpinner v-if="loading" />
    <BaseButton v-else> propose transactions </BaseButton>
  </div>
</template>
