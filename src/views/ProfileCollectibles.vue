<script setup lang="ts">
// import { FOLLOWS_QUERY } from '@/helpers/queries';

type Collectible = {
  id: string;
  title: string;
};

const props = defineProps<{
  userAddress: string;
  profile?: { about?: string };
}>();

// const { apolloQuery } = useApolloQuery();

const loadingOwnedCollectibles = ref(false);
const collectibles = ref([]) as Ref<Collectible[]>;

async function loadCollectibles() {
  collectibles.value = [
    {
      id: '0x73021d63f985aba8e42c67165f80c0027a591980a5cc372cda9637bdf2173f95',
      title: '[Temperature Check] Deploy Uniswap v3 on Moonbeam (2023)'
    },
    {
      id: '0x0f8a85d90759acf3a6fdc018e20b991f3562847122a8142c4e166c71d0e755e3',
      title:
        '[Temperature Check] Post-BSL cross-chain deployment process and creation of new uniswap.eth subdomain'
    }
  ];
}

onMounted(async () => {
  loadingOwnedCollectibles.value = true;
  await loadCollectibles();
  loadingOwnedCollectibles.value = false;
});
</script>

<template>
  <div>
    <div class="flex w-full flex-row flex-wrap gap-3">
      <ProfileCollectiblesItem
        v-for="c in collectibles"
        :key="c.id"
        :collectible="c"
      />
      <span v-if="collectibles.length === 0">Collectibles not found.</span>
    </div>
  </div>
</template>
