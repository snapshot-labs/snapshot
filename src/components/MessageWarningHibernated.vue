<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const { web3Account } = useWeb3();
const { loadSpaceController, isSpaceController } = useSpaceController();

const isAuthorized = computed(() => {
  const admins = (props.space.admins || []).map(admin => admin.toLowerCase());
  return (
    admins.includes(web3Account.value?.toLowerCase()) || isSpaceController.value
  );
});

onMounted(async () => {
  await loadSpaceController();
});
</script>

<template>
  <BaseMessageBlock v-if="space.hibernated" level="warning" is-responsive>
    {{ $t('create.errorSpaceHibernated') }}
    <BaseLink
      link="https://docs.snapshot.org/user-guides/spaces/space-hibernation"
    >
      {{ $t('learnMore') }}
    </BaseLink>

    <p v-if="isAuthorized" class="mt-3">
      <router-link :to="{ name: 'spaceSettings' }">
        <BaseButton>
          {{ $t('reactivateSpace') }}
        </BaseButton>
      </router-link>
    </p>
  </BaseMessageBlock>
</template>
