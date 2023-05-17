<script setup lang="ts">
import { clone } from '@snapshot-labs/snapshot.js/src/utils';
import networks from '@snapshot-labs/snapshot.js/src/networks.json';
import { shorten } from '@/helpers/utils';

const { env } = useApp();

const defaultNetwork = import.meta.env.VITE_DEFAULT_NETWORK;

const { web3Account } = useWeb3();
const { loadOwnedEnsDomains, ownedEnsDomains } = useEns();
const { loadSpaces, spaces, isLoadingSpaces } = useSpaces();

const inputDomain = ref('');
const loadingOwnedEnsDomains = ref(false);

watch(
  web3Account,
  async () => {
    ownedEnsDomains.value = [];
    loadingOwnedEnsDomains.value = true;
    await loadOwnedEnsDomains(web3Account.value);
    loadingOwnedEnsDomains.value = false;
    if (ownedEnsDomains.value.map(d => d.name).length)
      await loadSpaces(ownedEnsDomains.value.map(d => d.name));
  },
  { immediate: true }
);

const domainsWithoutExistingSpace = computed(() => {
  const spaceIds = clone(spaces.value.map(space => space.id));
  return ownedEnsDomains.value.filter(d => !spaceIds.includes(d.name));
});

const domainsWithExistingSpace = computed(() => {
  const spaceIds = ownedEnsDomains.value.map(d => d.name);
  return spaces.value.filter(d => spaceIds.includes(d.id));
});

const emit = defineEmits(['next']);

// handle periodic lookup (every 5s) while registering new domain
let waitingForRegistrationInterval;
const waitForRegistration = () => {
  clearInterval(waitingForRegistrationInterval);
  waitingForRegistrationInterval = setInterval(loadOwnedEnsDomains, 5000);
};

function shortenInvalidEns(ens: string) {
  const [name, domain] = ens.split('.');
  return `${shorten(name)}.${domain}`;
}

// stop lookup when leaving
onUnmounted(() => clearInterval(waitingForRegistrationInterval));
</script>

<template>
  <div>
    <LoadingRow v-if="loadingOwnedEnsDomains || isLoadingSpaces" block />
    <div v-else>
      <h4 class="mb-2 px-4 md:px-0">{{ $t('setup.domain.title') }}</h4>
      <BaseMessageBlock
        v-if="env !== 'demo'"
        class="mb-4"
        level="info"
        is-responsive
      >
        {{ $t('setup.domain.ensMessage') }}
        <i18n-t
          keypath="setup.domain.ensMessageTestnet"
          tag="span"
          scope="global"
        >
          <template #link>
            <BaseLink link="https://demo.snapshot.org">
              {{ $t('setup.domain.tryDemo') }}
            </BaseLink>
          </template>
        </i18n-t>
      </BaseMessageBlock>

      <BlockSpacesList
        v-if="domainsWithExistingSpace.length"
        :spaces="domainsWithExistingSpace"
        :title="$t('setup.domain.yourExistingSpaces')"
        class="mb-3"
      />

      <BaseMessageBlock
        v-if="defaultNetwork === '5'"
        level="info"
        class="mb-4"
        is-responsive
      >
        {{
          $t('setup.demoTestnetEnsMessage', {
            network: networks[defaultNetwork].name
          })
        }}
      </BaseMessageBlock>

      <BaseBlock>
        <div v-if="domainsWithoutExistingSpace.length">
          <div class="mb-3">
            {{
              $t(
                domainsWithoutExistingSpace.length > 1
                  ? 'setup.chooseExistingEns'
                  : 'setup.useSingleExistingEns'
              )
            }}
          </div>
          <div class="space-y-2">
            <template v-for="(ens, i) in domainsWithoutExistingSpace" :key="i">
              <BaseButton
                v-if="!ens.isInvalid"
                class="flex w-full items-center justify-between"
                :primary="domainsWithoutExistingSpace.length === 1"
                @click="emit('next', ens.name)"
              >
                {{ ens.name }}
                <i-ho-arrow-sm-right class="-mr-2" />
              </BaseButton>
              <BaseLink
                v-else
                :link="`https://app.ens.domains/address/${web3Account}/controller`"
                hide-external-icon
              >
                <BaseButton
                  tabindex="-1"
                  class="flex w-full items-center justify-between"
                >
                  {{ shortenInvalidEns(ens.name) }}
                  <i-ho-exclamation-circle
                    v-tippy="{
                      content: ens.isInvalid
                        ? $t('setup.domain.invalidEns')
                        : null
                    }"
                    class="-mr-2"
                  />
                </BaseButton>
              </BaseLink>
            </template>
          </div>
          <div class="mt-4">
            {{ $t('setup.orRegisterNewEns') }}
          </div>
        </div>
        <div>
          <div v-if="!domainsWithoutExistingSpace.length" class="mb-3">
            {{ $t('setup.toCreateASpace') }}
          </div>
          <SetupDomainRegister
            v-model.trim="inputDomain"
            @waitForRegistration="waitForRegistration"
          />
        </div>
      </BaseBlock>
    </div>
  </div>
</template>
