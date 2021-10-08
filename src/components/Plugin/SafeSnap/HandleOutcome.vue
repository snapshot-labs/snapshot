<template>
  <div v-if="questionState === questionStates.error" class="my-4">
    {{ $t('safeSnap.labels.error') }}
  </div>

  <div v-if="questionState === questionStates.noWalletConnection" class="my-4">
    {{ $t('safeSnap.labels.connectWallet') }}
  </div>

  <div v-if="questionState === questionStates.loading" class="my-4">
    <UiLoading />
  </div>

  <div v-if="questionState === questionStates.waitingForQuestion" class="my-4">
    <UiButton @click="performAction" v-text="$t('safeSnap.labels.request')" />
  </div>

  <div
    v-if="
      (showOracleInfo || bondData.canClaim) &&
      questionState !== questionStates.loading
    "
    class="my-4"
  >
    <div class="text-base block-bg p-3 rounded-3xl border inline-block">
      <h5 class="text-center link-color">
        Reality oracle
        <a
          @click="updateDetails"
          class="float-right text-color"
          style="padding-top: 2px"
        >
          <Icon name="refresh" size="16" />
        </a>
      </h5>
      <div
        v-if="questionState !== questionStates.questionNotSet"
        class="flex items-center my-3"
        style="text-align: left"
      >
        <div class="border rounded-lg p-3 mr-3">
          <div>
            <b class="pr-3"
              >{{
                questionDetails?.finalizedAt
                  ? $t('safeSnap.finalOutcome')
                  : $t('safeSnap.currentOutcome')
              }}:</b
            >
            <span class="float-right link-color">
              {{ approvalData?.decision }}
            </span>
          </div>
          <div v-if="!questionDetails?.finalizedAt" mt-3>
            <b class="pr-3">{{ $t('safeSnap.currentBond') }}:</b>
            <span class="float-right link-color">
              {{ approvalData?.currentBond }}
            </span>
          </div>
        </div>

        <div class="border rounded-lg p-3 link-color">
          <b>{{ approvalData?.timeLeft }}</b>
        </div>
      </div>

      <div v-if="questionState === questionStates.questionNotSet">
        <UiButton
          class="w-full my-1"
          @click="performAction"
          v-text="$t('safeSnap.labels.setOutcome')"
        />
      </div>
      <div v-if="questionState === questionStates.questionNotResolved">
        <UiButton
          class="w-full my-1"
          @click="performAction"
          v-text="$t('safeSnap.labels.changeOutcome')"
        />
      </div>
      <div v-if="bondData.canClaim">
        <UiButton
          class="w-full my-1"
          @click="claimBond"
          v-text="$t('safeSnap.claimBond')"
        />
      </div>
    </div>
  </div>

  <div v-if="questionState === questionStates.proposalApproved" class="my-4">
    <UiButton
      @click="performAction"
      v-text="
        $t('safeSnap.labels.executeTxs', [
          questionDetails.nextTxIndex + 1,
          txs.length
        ])
      "
    />
  </div>

  <div v-if="questionState === questionStates.completelyExecuted" class="my-4">
    {{ $t('safeSnap.labels.executed') }}
  </div>

  <teleport to="#modal">
    <PluginSafeSnapModalOptionApproval
      :minimumBond="questionDetails?.minimumBond"
      :open="modalApproveDecisionOpen"
      :isApproved="questionDetails?.isApproved"
      :bond="questionDetails?.currentBond"
      :questionId="questionDetails?.questionId"
      :tokenSymbol="bondData?.tokenSymbol"
      :tokenDecimals="bondData?.tokenDecimals"
      @setApproval="voteOnQuestion"
      @close="modalApproveDecisionOpen = false"
    />
  </teleport>
</template>

<script>
import Plugin from '@/../snapshot-plugins/src/plugins/safeSnap';
import { sleep } from '@/helpers/utils';
import { BigNumber } from '@ethersproject/bignumber';
import { formatBatchTransaction } from '@/helpers/abi/utils';
import { formatUnits } from '@ethersproject/units';
import { useSafesnap } from '@/composables/useSafesnap';
import { useWeb3 } from '@/composables/useWeb3';

const { clearBatchError, setBatchError } = useSafesnap();
const { web3 } = useWeb3();

const plugin = new Plugin();

const QuestionStates = {
  error: -1,
  noWalletConnection: 0,
  loading: 1,
  waitingForQuestion: 2,
  questionNotSet: 3,
  questionNotResolved: 4,
  waitingForCooldown: 5,
  proposalApproved: 6,
  proposalRejected: 7,
  completelyExecuted: 8
};
Object.freeze(QuestionStates);

export default {
  props: ['txs', 'proposalId', 'network', 'realityAddress'],
  data() {
    return {
      loading: true,
      questionStates: QuestionStates,
      actionInProgress: false,
      questionDetails: undefined,
      modalApproveDecisionOpen: false,
      bondData: {
        canClaim: undefined,
        data: undefined
      }
    };
  },
  async created() {
    await this.updateDetails();
  },
  methods: {
    async updateDetails() {
      if (!this.realityAddress) return;
      this.loading = true;
      try {
        this.questionDetails = await plugin.getExecutionDetails(
          this.network,
          this.realityAddress,
          this.proposalId,
          this.txs.map(formatBatchTransaction)
        );
        if (this.questionDetails.questionId && this.$auth.web3) {
          this.bondData = await plugin.loadClaimBondData(
            this.$auth.web3,
            this.network,
            this.questionDetails.questionId,
            this.questionDetails.oracle
          );
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    async claimBond() {
      if (!this.questionDetails.oracle) return;
      try {
        this.actionInProgress = true;

        const params = Object.keys(this.bondData.data).map(
          key => new Array(...this.bondData.data[key])
        );

        await plugin.claimBond(
          this.$auth.web3,
          this.questionDetails.oracle,
          this.questionDetails.questionId,
          params
        );
        await sleep(3e3);
        await this.updateDetails();
      } catch (e) {
        console.error(e);
      } finally {
        this.actionInProgress = true;
      }
    },
    async performAction() {
      if (!this.$auth.isAuthenticated.value) return;
      this.actionInProgress = true;
      try {
        switch (this.questionState) {
          case QuestionStates.waitingForQuestion:
            await plugin.submitProposal(
              this.$auth.web3,
              this.realityAddress,
              this.questionDetails.proposalId,
              this.questionDetails.transactions
            );
            break;
          case QuestionStates.questionNotSet:
          case QuestionStates.questionNotResolved:
            this.modalApproveDecisionOpen = true;
            return;
          case QuestionStates.proposalApproved:
            await this.executeProposal();
            break;
        }
        await sleep(3e3);
        await this.updateDetails();
      } catch (e) {
        console.error(e);
      } finally {
        this.actionInProgress = false;
      }
    },
    async voteOnQuestion(option) {
      await plugin.voteForQuestion(
        this.network,
        this.$auth.web3,
        this.questionDetails.oracle,
        this.questionDetails.questionId,
        this.questionDetails.minimumBond,
        option
      );
      await sleep(3e3);
      await this.updateDetails();
    },
    async executeProposal() {
      try {
        clearBatchError();
        await plugin.executeProposal(
          this.$auth.web3,
          this.realityAddress,
          this.questionDetails.proposalId,
          this.questionDetails.transactions,
          this.questionDetails.nextTxIndex
        );
      } catch (err) {
        setBatchError(this.questionDetails.nextTxIndex, err.reason);
      }
    }
  },
  computed: {
    questionState() {
      if (!web3.value.account) return QuestionStates.noWalletConnection;

      if (this.loading) return QuestionStates.loading;

      if (!this.questionDetails) return QuestionStates.error;

      if (!this.questionDetails.questionId)
        return QuestionStates.waitingForQuestion;

      if (this.questionDetails.currentBond.isZero())
        return QuestionStates.questionNotSet;

      if (!this.questionDetails.finalizedAt)
        return QuestionStates.questionNotResolved;

      const ts = (Date.now() / 1e3).toFixed();
      if (this.questionDetails.executionApproved) {
        if (
          this.questionDetails.finalizedAt + this.questionDetails.cooldown >
          ts
        ) {
          return QuestionStates.waitingForCooldown;
        }
        if (!Number.isInteger(this.questionDetails.nextTxIndex))
          return QuestionStates.completelyExecuted;
        return QuestionStates.proposalApproved;
      } else {
        if (this.questionDetails.finalizedAt < ts) {
          return QuestionStates.proposalRejected;
        }
      }

      return QuestionStates.error;
    },
    showOracleInfo() {
      return (
        this.questionState === this.questionStates.questionNotSet ||
        this.questionState === this.questionStates.questionNotResolved ||
        this.questionState === this.questionStates.waitingForCooldown
      );
    },
    approvalData() {
      if (this.questionDetails) {
        const { currentBond, finalizedAt, isApproved, endTime } =
          this.questionDetails;

        if (currentBond === undefined || BigNumber.from(currentBond).eq(0)) {
          return {
            decision: '--',
            timeLeft: '--',
            currentBond: '--'
          };
        }

        if (finalizedAt) {
          if (isApproved) {
            return {
              decision: 'Yes',
              timeLeft: this.$i18n.t('safeSnap.executableIn', [
                this._ms(endTime + this.questionDetails.cooldown)
              ])
            };
          }

          return {
            decision: 'No'
          };
        }

        return {
          decision: isApproved ? 'Yes' : 'No',
          timeLeft: this.$i18n.t('safeSnap.finalizedIn', [this._ms(endTime)]),
          currentBond:
            formatUnits(currentBond, this.bondData.tokenDecimals) +
            ' ' +
            this.bondData.tokenSymbol
        };
      }
      return {
        decision: '--',
        timeLeft: '--',
        currentBond: '--'
      };
    }
  }
};
</script>
