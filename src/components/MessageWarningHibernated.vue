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

async function handleReactivateSpace() {
  const receipt = await send(props.space, 'reactivate-space', {
    space: props.space
  });

  if (receipt.id) {
    await reloadSpace(props.space.id);
    notify(['green', t('notify.spaceReactivated')])
  }
}

const isAdmin = computed(() => {
  const admins = (props.space.admins || []).map(admin => admin.toLowerCase());
  return admins.includes(web3Account.value?.toLowerCase());
});

onMounted(async () => {
  await loadSpaceController();
});
</script>

<template>
  <BaseMessageBlock v-if="space.hibernated" level="warning" is-responsive>
    {{ $t('create.errorSpaceHibernated') }}
    <BaseLink link="https://docs.snapshot.org/">
      {{ $t('learnMore') }}
    </BaseLink>

    <p v-if="isAdmin || isSpaceController" class="mt-3">
      <BaseButton :loading="isSending" @click="handleReactivateSpace">
        {{ $t('reactivateSpace') }}
      </BaseButton>
    </p>
  </BaseMessageBlock>
</template>
