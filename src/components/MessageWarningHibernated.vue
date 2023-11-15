<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const { web3Account } = useWeb3();

function handleReactivateSpace() {
  window.open('https://tally.so', '_blank');
}

const isAdmin = computed(() => {
  const admins = (props.space.admins || []).map(admin => admin.toLowerCase());
  return admins.includes(web3Account.value?.toLowerCase());
});
</script>

<template>
  <BaseMessageBlock v-if="space.hibernated" level="warning" is-responsive>
    {{ $t('create.errorSpaceHibernated') }}
    <BaseLink link="https://docs.snapshot.org/">
      {{ $t('learnMore') }}
    </BaseLink>

    <p v-if="isAdmin" class="mt-3">
      <BaseButton  @click="handleReactivateSpace">
        {{ $t('reactivateSpace') }}
      </BaseButton>
    </p>
  </BaseMessageBlock>
</template>
