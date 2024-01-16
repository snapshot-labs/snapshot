<script setup lang="ts">
const props = defineProps<{
  open: boolean;
}>();
const emit = defineEmits(['close']);

const { initialized, userState, loadEmailSubscriptions } =
  useEmailSubscription();

watch(
  () => props.open,
  () => {
    if (
      (props.open && !initialized.value) ||
      userState.value === 'UNVERIFIED'
    ) {
      loadEmailSubscriptions();
    }
  }
);
</script>

<template>
  <BaseModal max-height="510px" :open="open" @close="emit('close')">
    <template #header>
      <h3 v-if="userState === 'NOT_SUBSCRIBED'">
        {{ $t('emailSubscription.title') }}
      </h3>
      <h3 v-else-if="userState === 'UNVERIFIED'">
        {{ $t('emailResend.title') }}
      </h3>
      <h3 v-else-if="userState === 'VERIFIED'">
        {{ $t('emailManagement.title') }}
      </h3>
    </template>

    <LoadingRow v-if="!initialized" />
    <ModalEmailSubscription
      v-else-if="userState === 'NOT_SUBSCRIBED'"
      @close="emit('close')"
    />
    <ModalEmailResend
      v-else-if="userState === 'UNVERIFIED'"
      @close="emit('close')"
    />
    <ModalEmailManagement
      v-else-if="userState === 'VERIFIED'"
      @close="emit('close')"
    />
  </BaseModal>
</template>
