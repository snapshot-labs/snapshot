<script setup lang="ts">
import { shorten, getChoiceString, explorerUrl } from '@/helpers/utils';
import { getPower, voteValidation } from '@/helpers/snapshot';
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
import shutterEncryptChoice from '@/helpers/shutter';

const { web3Account } = useWeb3();

const votingPower = ref(0);
const votingPowerByStrategy = ref([]);
const isValidVoter = ref(false);
const reason = ref('');

const isValidationAndPowerLoading = ref(false);
const isValidationAndPowerLoaded = ref(false);
const hasVotingPowerFailed = ref(false);
const hasVotingValidationFailed = ref(false);

const props = defineProps<{
  open: boolean;
  space: ExtendedSpace;
  proposal: Proposal;
  selectedChoices: number | number[] | Record<string, any> | null;
  strategies: { name: string; network: string; params: Record<string, any> }[];
}>();

const emit = defineEmits(['reload', 'close', 'openPostVoteModal']);

const { send, isSending } = useClient();
const format = getChoiceString;
const { formatNumber, formatCompactNumber } = useIntl();
const { addVotedProposalId } = useProposals();
const { isGnosisAndNotSpaceNetwork } = useGnosis(props.space);

const isLoadingShutter = ref(false);

const symbols = computed(() =>
  props.strategies.map(strategy => strategy.params.symbol || '')
);

const validationStrategySymbolsString = computed(() => {
  let symbols = props.proposal.validation?.params?.strategies
    ?.map(strategy => strategy.params.symbol)
    .filter(symbol => symbol);

  if (!symbols) return '';

  symbols = symbols.map(symbol => `$${symbol}`);

  if (symbols.length === 1) return `${symbols[0]}`;

  return `(${symbols.join(', ')})`;
});

async function voteShutter() {
  isLoadingShutter.value = true;
  const encryptedChoice = await shutterEncryptChoice(
    JSON.stringify(props.selectedChoices),
    props.proposal.id
  );
  isLoadingShutter.value = false;

  if (!encryptedChoice) return null;
  return vote({
    proposal: props.proposal,
    choice: encryptedChoice,
    privacy: 'shutter',
    reason: reason.value
  });
}

async function vote(payload) {
  return send(props.space, 'vote', payload);
}

async function handleSubmit() {
  let result: { id: string; ipfs?: string } | null = null;
  if (props.proposal.privacy === 'shutter') result = await voteShutter();
  else
    result = await vote({
      proposal: props.proposal,
      choice: props.selectedChoices,
      reason: reason.value
    });

  console.log('Result', result);

  if (result?.id) {
    const waitingForSigners = !result.ipfs;
    emit('openPostVoteModal', waitingForSigners);
    if (!waitingForSigners) emit('reload');
    addVotedProposalId(props.proposal.id);
  }
  emit('close');
}

async function loadVotingValidation() {
  if (props.proposal.validation.name === 'any') {
    isValidVoter.value = true;
    return;
  }
  hasVotingValidationFailed.value = false;
  try {
    const validationRes = await voteValidation(
      props.space,
      web3Account.value,
      props.proposal
    );
    isValidVoter.value = validationRes;
  } catch (e) {
    hasVotingValidationFailed.value = true;
    console.log(e);
  }
}

async function loadVotingPower() {
  hasVotingPowerFailed.value = false;
  try {
    const powerRes = await getPower(
      props.space,
      web3Account.value,
      props.proposal
    );
    votingPower.value = powerRes.vp;
    votingPowerByStrategy.value = powerRes.vp_by_strategy;
  } catch (e) {
    hasVotingPowerFailed.value = true;
    console.log(e);
  }
}

async function loadValidationAndPower() {
  try {
    isValidationAndPowerLoading.value = true;
    await Promise.all([loadVotingPower(), loadVotingValidation()]);
  } catch (e) {
    console.log(e);
    isValidationAndPowerLoading.value = false;
  } finally {
    isValidationAndPowerLoading.value = false;
    isValidationAndPowerLoaded.value = true;
  }
}

watch(
  () => [props.open, web3Account.value],
  async () => {
    if (props.open === false) return;
    loadValidationAndPower();
  }
);
</script>

<template>
  <BaseModal :open="open" hide-close class="flex" @close="$emit('close')">
    <div class="flex flex-auto flex-col">
      <h4 class="m-4 mb-0 text-center">
        {{ $tc('proposal.castVote') }}
      </h4>
      <div slim class="m-4 space-y-4 text-skin-link">
        <div>
          <div class="flex">
            <span class="mr-1 flex-auto text-skin-text" v-text="$t('choice')" />
            <span
              v-tippy="{
                content:
                  format(proposal, selectedChoices).length > 30
                    ? format(proposal, selectedChoices)
                    : null
              }"
              class="ml-4 truncate text-right"
            >
              {{ format(proposal, selectedChoices) }}
            </span>
          </div>

          <div class="flex">
            <span
              class="mr-1 flex-auto text-skin-text"
              v-text="$t('snapshot')"
            />
            <BaseLink
              :link="explorerUrl(proposal.network, proposal.snapshot, 'block')"
              class="float-right"
            >
              {{ formatNumber(Number(proposal.snapshot)) }}
            </BaseLink>
          </div>

          <div
            v-if="
              proposal.validation?.name !== 'any' &&
              isValidationAndPowerLoaded &&
              !isValidationAndPowerLoading
            "
            class="flex"
          >
            <span
              class="mr-1 flex-auto text-skin-text"
              v-text="$t('votingValidation.label')"
            />
            <div class="flex items-center gap-1">
              <span
                v-if="hasVotingValidationFailed"
                class="flex items-center gap-1"
              >
                <i-ho-exclamation-circle class="text-sm text-red" />
                {{ $t('failed') }}
              </span>
              <span v-else class="flex items-center">
                <i-ho-check v-if="isValidVoter" class="text-green" />
                <i-ho-x v-else class="text-red" />
                {{ $t(`votingValidation.${proposal.validation.name}.label`) }}
              </span>
            </div>
          </div>

          <div class="flex">
            <span
              class="mr-1 flex-auto text-skin-text"
              v-text="$t('votingPower')"
            />
            <span v-if="hasVotingPowerFailed" class="flex items-center gap-1">
              <i-ho-exclamation-circle class="text-sm text-red" />
              {{ $t('failed') }}
            </span>
            <span
              v-else-if="
                isValidationAndPowerLoaded && !isValidationAndPowerLoading
              "
              v-tippy="{
                content: votingPowerByStrategy
                  .map(
                    (score, index) =>
                      `${formatCompactNumber(votingPower === 0 ? 0 : score)} ${
                        symbols[index]
                      }`
                  )
                  .join(' + ')
              }"
            >
              {{ formatCompactNumber(votingPower) }}
              {{ shorten(proposal.symbol || space.symbol, 'symbol') }}
            </span>
            <LoadingSpinner v-else />
          </div>
        </div>

        <MessageWarningGnosisNetwork
          v-if="isGnosisAndNotSpaceNetwork"
          :space="space"
          action="vote"
        />
        <template
          v-else-if="isValidationAndPowerLoaded && !isValidationAndPowerLoading"
        >
          <!-- Voting power messages -->
          <BaseMessageBlock v-if="hasVotingPowerFailed" level="warning">
            <i18n-t
              keypath="votingPowerFailedMessage"
              tag="span"
              scope="global"
            >
              <template #discord>
                <BaseLink link="https://discord.snapshot.org">Discord</BaseLink>
              </template>
            </i18n-t>
          </BaseMessageBlock>

          <!-- Voting validation messages -->
          <BaseMessageBlock
            v-else-if="hasVotingValidationFailed"
            level="warning"
          >
            <!-- {{ t('votingValidationFailedMessage') }} -->

            <i18n-t
              keypath="votingValidationFailedMessage"
              tag="span"
              scope="global"
            >
              <template #discord>
                <BaseLink link="https://discord.snapshot.org">Discord</BaseLink>
              </template>
            </i18n-t>
          </BaseMessageBlock>
          <MessageWarningValidation
            v-else-if="!isValidVoter && proposal.validation?.name"
            context="voting"
            :space-id="proposal.space.id"
            :validation-name="proposal.validation.name"
            :validation-params="proposal.validation?.params || {}"
            :min-score="proposal.validation?.params?.minScore || 0"
            :symbol="validationStrategySymbolsString"
          />
          <!-- No voting power -->
          <BaseMessageBlock v-else-if="votingPower === 0" level="warning">
            {{
              $t('noVotingPower', {
                blockNumber: formatNumber(Number(proposal.snapshot))
              })
            }}
            <BaseLink
              link="https://github.com/snapshot-labs/snapshot/discussions/767"
            >
              {{ $t('learnMore') }}</BaseLink
            >
          </BaseMessageBlock>
          <!-- Reason field -->
          <div v-else-if="props.proposal.privacy !== 'shutter'" class="flex">
            <TextareaAutosize
              v-model="reason"
              :max-length="140"
              class="s-input !rounded-3xl"
              :placeholder="$t('comment.placeholder')"
            />
          </div>
        </template>
      </div>
    </div>

    <template #footer>
      <div class="float-left w-2/4 pr-2">
        <BaseButton type="button" class="w-full" @click="$emit('close')">
          {{ $t('cancel') }}
        </BaseButton>
      </div>
      <div class="float-left w-2/4 pl-2">
        <BaseButton
          :disabled="
            votingPower === 0 ||
            !isValidVoter ||
            isSending ||
            isLoadingShutter ||
            isGnosisAndNotSpaceNetwork
          "
          :loading="isSending || isLoadingShutter"
          class="w-full"
          primary
          data-testid="confirm-vote-button"
          @click="handleSubmit"
        >
          {{ $t('confirm') }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
