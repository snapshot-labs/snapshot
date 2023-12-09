<script setup lang="ts">
import { ExtendedSpace } from '@/helpers/interfaces';
import { getProposal } from '@/helpers/snapshot';

const props = defineProps<{
  space: ExtendedSpace;
}>();

const route = useRoute();

const proposal = ref();
const tokens = ref();
const boostForm = ref({
  numberOfUsers: 'unlimited',
  eligibleUsers: 'anyone',
  network: '1',
  tokenAddress: ''
  //   type: ''
});

const eligibilityOptions = computed(() => {
  const proposalChoices = proposal.value?.choices.map(
    (choice: string, index: number) => {
      return {
        value: index + 1,
        name: `Anyone who votes '${choice}'`
      };
    }
  );

  return [
    {
      value: 'anyone',
      name: 'Anyone who votes'
    },
    ...proposalChoices
  ];
});

watchEffect(async () => {
  const id = route.params.proposalId;
  if (id) {
    proposal.value = await getProposal(id);
  }
});

async function fetchTokens(): Promise<any[]> {
  try {
    // TODO: How are we going to have lists for other networks?
    const response = await fetch(
      'https://gateway.ipfs.io/ipns/tokens.uniswap.org'
    );
    const data = await response.json();
    return data.tokens;
  } catch {
    return [];
  }
}

onMounted(async () => {
  tokens.value = await fetchTokens();
});
</script>

<template>
  <div>
    <SpaceBreadcrumbs :space="space" />
    <TheLayout reverse class="pt-[12px]">
      <template #content-left>
        <LoadingPage v-if="!proposal || !tokens" />
        <template v-else>
          <h1>New boost</h1>
          Incentivize people to vote on this proposal

          <BaseBlock title="Eligibility" class="mt-5">
            Number of eligible users
            <div class="flex gap-4 pt-1">
              <TuneRadio
                v-model="boostForm.numberOfUsers"
                value="unlimited"
                hint="Unlimited"
              />
              <TuneRadio
                v-model="boostForm.numberOfUsers"
                value="fixed"
                hint="First x voters only"
              />
            </div>

            <TuneListbox
              v-model="boostForm.eligibleUsers"
              :items="eligibilityOptions"
              label="Eligible users"
              class="mt-3"
            />
          </BaseBlock>

          <BaseBlock title="Deposit amount" class="mt-5">
            <ButtonSelectToken
              v-model:selected-token="boostForm.tokenAddress"
              :network="boostForm.network"
              :tokens="tokens"
            />
          </BaseBlock>
          <BaseBlock title="Distribution" class="mt-5"> </BaseBlock>
          <BaseBlock title="Dates" class="mt-5"> </BaseBlock>
        </template>
      </template>

      <template #sidebar-right> Test </template>
    </TheLayout>
  </div>
</template>
