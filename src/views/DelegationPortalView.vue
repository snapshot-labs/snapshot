<script setup>
import { useModal } from '@/composables/useModal';
import { useWeb3 } from '@/composables/useWeb3';
import { getScores } from '@snapshot-labs/snapshot.js/src/utils';
import { SPACE_DELEGATE_QUERY } from '@/helpers/queries';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { debouncedWatch } from '@vueuse/shared';
import { useApolloQuery } from '@/composables/useApolloQuery';
import { useProfiles } from '@/composables/useProfiles';

const route = useRoute();
const loaded = ref(false);
const specifySpaceChecked = ref(false);
const space = ref({});
const myScore = ref(0);
const modalDelegationRequestFormOpen = ref(false);

// const { modalAccountOpen } = useModal();
const { web3Account } = useWeb3();
const { apolloQuery, queryLoading: spaceLoading } = useApolloQuery();

const { profiles, loadProfiles } = useProfiles();

const getMyScore = async () => {
  const scores = await getScores(
    specifySpaceChecked.value,
    space.value.strategies,
    space.value.network,
    [web3Account.value],
    'latest',
    import.meta.env.VITE_SCORES_URL + '/api/scores'
  );
  console.log(scores);
  // [
  //     {
  //         "address": 1
  //     }
  // ]
  myScore.value = scores.reduce((a, b) => a + b[web3Account.value], 0);
};

debouncedWatch(
  () => route.params.key,
  async () => {
    if (!route.params.key) return;
    space.value = await apolloQuery(
      {
        query: SPACE_DELEGATE_QUERY,
        variables: {
          id: route.params.key
        }
      },
      'space'
    );
    loaded.value = true;
    myScore.value = 0;
    getMyScore();
    loadProfiles([web3Account.value]);
  },
  { immediate: true, debounce: 500 }
);

onMounted(async () => {
  console.log(route.params.key);
  if (route.params.key) specifySpaceChecked.value = true;
  // TODO: Check if space exist

  // setPageTitle('page.title.lobot');
});
</script>

<template>
  <TheLayout v-bind="$attrs">
    <div class="mb-3 px-4 md:px-0">
      <ButtonBack @click="$router.go(-1)" />
      <div class="flex justify-between">
        <h1>Delegation Portal</h1>
        <button
          class="flex h-[44px] cursor-pointer select-none items-center justify-center rounded-full border px-4 hover:border-skin-text"
          @click="modalDelegationRequestFormOpen = true"
        >
          <i-ho-plus-sm class="mr-2" /> Add Request
        </button>
      </div>
      <hr class="my-4" />
      <div v-if="!web3Account" class="my-4">
        <div>Connect wallet to continue</div>
      </div>
      <div v-else-if="!specifySpaceChecked || spaceLoading" class="my-4">
        <div>Select space to continue</div>
      </div>
      <div v-else-if="loaded" class="my-4">
        <div class="mb-2 flex justify-between">
          <h2 class="my-2 mb-3 break-words leading-7">Delegations:</h2>

          <h2 class="my-2 mb-3 break-words leading-7">
            My voting power: {{ myScore || '-' }}
          </h2>
        </div>
        <DelegationsCurrentUser
          :space="route.params.key"
          :current-account="web3Account"
        />
        <div class="my-2">
          <h2 class="mb-3">Change your delegate:</h2>
          <div>
            Delegate your voting power to an ENS name or Ethereum address.
          </div>
        </div>
        <div class="flex justify-between">
          <div
            class="relative z-10 flex w-full rounded-3xl border border-skin-border bg-skin-bg px-3 text-left leading-[42px] outline-none transition-colors focus-within:border-skin-text"
          >
            <div class="mr-2 whitespace-nowrap text-skin-text">To</div>
            <input
              placeholder="Address or ENS name"
              type="text"
              class="input w-full flex-auto"
              required=""
            />
          </div>
          <BaseButton type="submit" class="ml-4" primary>
            {{ $t('confirm') }}
          </BaseButton>
        </div>
        <DelegationRequestItems
          :space="route.params.key"
          :current-account="web3Account"
        />
        <div class="my-4">
          <h2 class="mb-3">Snapshot Lobby:</h2>
          <div>
            Delegate your voting power the pool of delegators to earn rewards
          </div>
          <div
            class="mt-2 grid grid-flow-col grid-rows-3 gap-2 rounded-md border p-3"
          >
            <div>
              <h4>Lobby 1</h4>
              This lobby generates 5$ reward per vote.
            </div>
            <div class="flex justify-between">
              <div>
                Delegated By:
                <div class="flex justify-start">
                  <AvatarUser
                    :address="web3Account"
                    size="18"
                    class="m-1 ml-0"
                  />
                  <AvatarUser :address="web3Account" size="18" class="m-1" />
                  <AvatarUser :address="web3Account" size="18" class="m-1" />
                  <AvatarUser :address="web3Account" size="18" class="m-1" />
                  <div>+24 others</div>
                </div>
              </div>
              <div>
                <div>
                  Total Voting power delegated:
                  <span class="bold text-skin-text">5K</span>
                </div>
                <div>
                  Current Reward per 1 VP:
                  <span class="bold text-skin-text">5$</span>
                </div>
              </div>
            </div>
            <BaseButton type="submit" class="m-1" primary>
              Delegate your voting power to this pool
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
    <LoadingPage v-if="!loaded" />
  </TheLayout>
  <teleport to="#modal">
    <ModalDelegationRequestForm
      :open="modalDelegationRequestFormOpen"
      :address="web3Account"
      :space="route.params.key"
      @close="modalDelegationRequestFormOpen = false"
    />
  </teleport>
</template>
