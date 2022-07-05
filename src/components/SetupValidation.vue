<script setup lang="ts">
import { useSpaceSettingsForm } from '@/composables/useSpaceSettingsForm';

const { form, getErrorMessage } = useSpaceSettingsForm();

defineProps<{
  creatingSpace: boolean;
}>();

const emit = defineEmits(['create', 'back']);
</script>

<template>
  <h4 class="mb-2">Who can manage this space and create proposals?</h4>
  <div class="space-y-4">
    <SettingsValidationBlock
      v-model:validation="form.validation"
      :filters="form.filters"
      @update:min-score="val => (form.filters.minScore = val)"
      @update:only-members="val => (form.filters.onlyMembers = val)"
    />

    <SettingsAdminsBlock
      :admins="form.admins"
      :error="getErrorMessage('admins')"
      @update:admins="val => (form.admins = val)"
    />

    <SettingsAuthorsBlock
      :members="form.members"
      :error="getErrorMessage('members')"
      @update:members="val => (form.members = val)"
    />
  </div>
  <SetupButtonCreate
    :creating-space="creatingSpace"
    class="mt-4"
    @create="emit('create')"
  />
  <!--   <div class="mx-4 md:mx-0">
  <div>
      <BaseMessage
        v-if="
          uriAddress &&
          uriAddress !== web3Account &&
          !loadingTextRecord &&
          !pendingENSRecord
        "
        level="warning"
        class="!mt-4"
      >
        {{ $t('setup.notControllerAddress', { wallet: shorten(uriAddress) }) }}
      </BaseMessage>
      <BaseMessage
        v-else-if="debouncedShowPleaseWaitMessage && creatingSpace"
        level="info"
        class="!mt-4"
      >
        {{ $t('setup.pleaseWaitMessage') }}
      </BaseMessage>
    </div>
  </div> -->
  <BaseButton class="mt-4" @click="emit('back')"> Back </BaseButton>
</template>
