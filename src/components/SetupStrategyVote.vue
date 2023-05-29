<script setup lang="ts">
import { clone } from '@snapshot-labs/snapshot.js/src/utils';

const emit = defineEmits(['next']);

const { form, DEFAULT_VOTE_VALIDATION } = useFormSpaceSettings('setup');
const { t } = useI18n();

const strategyName = ref('whitelist');
const symbol = ref('VOTE');
const whitelist = ref([]);
const validation = ref(clone(DEFAULT_VOTE_VALIDATION));
const showError = ref(false);

const strategy = computed(() => {
  const strategy: {
    name: string;
    params: {
      symbol: string;
      addresses?: string[];
    };
  } = {
    name: strategyName.value,
    params: {
      symbol: symbol.value
    }
  };

  if (strategyName.value === 'whitelist') {
    strategy.params.addresses = whitelist.value;
  }

  return strategy;
});

const votingItems = computed(() => {
  return ['whitelist', 'ticket'].map(name => ({
    value: name,
    extras: {
      information:
        name === 'whitelist'
          ? t('setup.strategy.onePersonOneVote.whitelistInformation')
          : t('setup.strategy.onePersonOneVote.ticketInformation')
    }
  }));
});

const isNotValidTicket = computed(
  () =>
    strategyName.value === 'ticket' &&
    (validation.value.name === 'any' || validation.value.name === 'basic')
);

const isNotValidWhitelist = computed(
  () => strategyName.value === 'whitelist' && whitelist.value.length === 0
);

const whitelistRef = ref();

function forceShowError() {
  whitelistRef?.value?.forceShowError();
}

function nextStep() {
  if (isNotValidWhitelist.value) {
    forceShowError();
    return;
  }
  if (isNotValidTicket.value) {
    showError.value = true;
    return;
  }

  form.value.voteValidation = clone(DEFAULT_VOTE_VALIDATION);
  form.value.strategies = [strategy.value];
  form.value.symbol = symbol.value;

  if (strategyName.value === 'ticket') {
    form.value.voteValidation = validation.value;
  }

  emit('next');
}
</script>

<template>
  <div>
    <BaseMessageBlock level="info" class="mb-3" is-responsive>
      {{ t('setup.strategy.onePersonOneVote.votesEqualInfo') }}
    </BaseMessageBlock>
    <BaseBlock :title="t('setup.strategy.blockTitle')">
      <div class="space-y-3">
        <div class="space-y-3 md:w-2/3">
          <TuneListbox
            v-model="strategyName"
            :items="votingItems"
            label="Strategy"
            class="w-full"
          >
            <template #selected="{ selectedItem }">
              <span>
                {{
                  selectedItem.value === 'whitelist'
                    ? 'Whitelist voting'
                    : 'Ticket voting'
                }}
              </span>
            </template>
            <template #item="{ item }">
              <span class="flex items-center gap-1">
                {{
                  item.value === 'whitelist'
                    ? 'Whitelist voting'
                    : 'Ticket voting'
                }}
                <IconInformationTooltip
                  :information="item.extras?.information"
                  class="text-skin-text"
                />
              </span>
            </template>
          </TuneListbox>
          <TuneInput v-model="symbol" label="Symbol" />
        </div>
        <template v-if="strategyName === 'ticket'" class="md:w-2/3">
          <InputSelectVoteValidation
            :validation="validation"
            :voting-strategies="form.strategies"
            @add="validation = $event"
          />

          <BaseMessageBlock
            v-if="isNotValidTicket && showError"
            level="warning-red"
            class="mt-3"
          >
            <i18n-t
              keypath="ticketWithAnyOrBasicError"
              tag="span"
              scope="global"
            >
              <template #article>
                <BaseLink
                  link="https://snapshot.mirror.xyz/-uSylOUP82hGAyWUlVn4lCg9ESzKX9QCvsUgvv-ng84"
                >
                  {{ $t('learnMore') }}
                </BaseLink>
              </template>
            </i18n-t>
          </BaseMessageBlock>
        </template>
        <template v-if="strategyName === 'whitelist'" class="md:w-2/3">
          <TuneTextareaArray
            ref="whitelistRef"
            v-model="whitelist"
            label="Whitelisted addresses"
            :placeholder="`0x8C28Cf33d9Fd3D0293f963b1cd27e3FF422B425c\n0xeF8305E140ac520225DAf050e2f71d5fBcC543e7`"
            :error="
              isNotValidWhitelist ? 'Please add at least one address' : ''
            "
          />
        </template>
      </div>
    </BaseBlock>
    <div class="float-right mx-4 md:mx-0">
      <SetupButtonNext @click="nextStep" />
    </div>
  </div>
</template>
