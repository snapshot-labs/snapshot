<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from '@/composables/useI18n';
import { shorten, getChoiceString, explorerUrl } from '@/helpers/utils';
import { useClient } from '@/composables/useClient';
import { useIntl } from '@/composables/useIntl';
import { getPower, getValidation } from '@/helpers/snapshot';
import { useWeb3 } from '@/composables/useWeb3';
import { useProposals } from '@/composables';
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';
import shutterEncryptChoice from '@/helpers/shutter';

const { web3Account } = useWeb3();

const votingPower = ref(0);
const votingPowerByStrategy = ref([]);
const votingValidation = ref(0);
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

const { t } = useI18n();
const { send, isSending } = useClient();
const format = getChoiceString;
const { formatNumber, formatCompactNumber } = useIntl();
const { addVotedProposalId } = useProposals();

const symbols = computed(() =>
  props.strategies.map(strategy => strategy.params.symbol || '')
);

const isLoadingShutter = ref(false);

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
  let result: { id: string } | null = null;
  if (props.proposal.privacy === 'shutter') result = await voteShutter();
  else
    result = await vote({
      proposal: props.proposal,
      choice: props.selectedChoices,
      reason: reason.value
    });

  console.log('Result', result);

  if (result?.id) {
    emit('openPostVoteModal');
    emit('reload');
    addVotedProposalId(props.proposal.id);
    emit('close');
  }
}

async function loadVotingValidation() {
  hasVotingValidationFailed.value = false;
  try {
    const validationRes = await getValidation(
      props.space,
      web3Account.value,
      props.proposal
    );
    votingValidation.value = validationRes;
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

          <div class="flex">
            <span
              class="mr-1 flex-auto text-skin-text"
              v-text="$t('votingPower')"
            />
            <span
              v-if="hasVotingPowerFailed || hasVotingValidationFailed"
              class="item-center flex"
            >
              <BaseButtonIcon class="p-0 pr-2" @click="loadValidationAndPower">
                <i-ho-refresh class="text-sm" />
              </BaseButtonIcon>
              <i-ho-exclamation-circle class="mt-[1px]" />
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

        <template
          v-if="isValidationAndPowerLoaded && !isValidationAndPowerLoading"
        >
          <BaseMessageBlock v-if="hasVotingPowerFailed" level="warning">
            {{ t('votingPowerError') }}
          </BaseMessageBlock>
          <BaseMessageBlock v-if="hasVotingValidationFailed" level="warning">
            {{
              t(
                'There was an error on our side and we could not verify if you eligible to vote.'
              )
            }}
          </BaseMessageBlock>
          <BaseMessageBlock
            v-else-if="votingPower === 0 && isValidationAndPowerLoaded"
            level="warning"
          >
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
          <BaseMessageBlock
            v-else-if="!votingValidation && isValidationAndPowerLoaded"
            level="warning"
          >
            <!-- {{ $t("Oops, you don't seem to be eligible to vote", {}) }} -->
            {{
              `Voting requires a GitcoinPassport with a minimum of ${proposal.validation.params.min_weight} points.`
            }}
            <BaseLink link="https://passport.gitcoin.co/#/dashboard">
              {{ $t('Passport') }}</BaseLink
            >
            <!-- Create a table for proposal.validation.params.stamps -->
            <table class="mt-3 w-full">
              <thead>
                <tr>
                  <th class="w-2/3 py-1 text-left text-skin-link">Stamp</th>
                  <th class="w-1/3 py-1 text-left text-skin-link">Points</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="stamp in proposal.validation.params.stamps"
                  :key="stamp.name"
                >
                  <td class="py-1">{{ stamp.id }}</td>
                  <td class="py-1">{{ stamp.weight }}</td>
                </tr>
              </tbody>
            </table>
          </BaseMessageBlock>
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
            !votingValidation ||
            isSending ||
            isLoadingShutter
          "
          :loading="isSending || isLoadingShutter"
          type="submit"
          class="w-full"
          primary
          @click="handleSubmit"
        >
          {{ $t('confirm') }}
        </BaseButton>
      </div>
    </template>
  </BaseModal>
</template>
