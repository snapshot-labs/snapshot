<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const { web3Account } = useWeb3();
const { send, isSending } = useClient();
const {
  loadSpaceController,
  isSpaceController,
} = useSpaceController();

async function handleReactivateSpace() {
  await send(props.space, 'reactivate-space', {
    space: props.space
  });
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
