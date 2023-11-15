<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const { web3Account } = useWeb3();
const { send, isSending } = useClient();
const { reloadSpace } = useExtendedSpaces();
const { loadSpaceController, isSpaceController } = useSpaceController();
const { notify } = useFlashNotification();
const { t } = useI18n();
const {
  isValid,
  prunedForm,
  populateForm
} = useFormSpaceSettings('settings');

async function handleReactivateSpace() {
  const result = await send(props.space, 'settings', prunedForm.value);

  if (result.id) {
    await reloadSpace(props.space.id);
    notify(['green', t('notify.spaceReactivated')]);
  }
}

const isAuthorized = computed(() => {
  const admins = (props.space.admins || []).map(admin => admin.toLowerCase());
  return admins.includes(web3Account.value?.toLowerCase()) || isSpaceController;
});

onMounted(async () => {
  await loadSpaceController();

  if (isAuthorized.value) {
    populateForm(props.space);
  }
});
</script>

<template>
  <BaseMessageBlock v-if="space.hibernated" level="warning" is-responsive>
    {{ $t('create.errorSpaceHibernated') }}
    <BaseLink link="https://docs.snapshot.org/user-guides/spaces/space-hibernation">
      {{ $t('learnMore') }}
    </BaseLink>

    <p v-if="isAuthorized" class="mt-3">
      <BaseButton :disabled="!isValid" :loading="isSending" @click="handleReactivateSpace">
        {{ $t('reactivateSpace') }}
      </BaseButton>
    </p>
  </BaseMessageBlock>
</template>
