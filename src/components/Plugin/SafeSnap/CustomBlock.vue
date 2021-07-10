<template>
  <Block
    title="SafeSnap Transactions"
    :icon="!loading && moduleAddress ? 'refresh' : undefined"
    :loading="loading"
    @submit="updateDetails"
  >
    <div v-if="infoLabel" class="mb-3 text-center">
      <Label>
        {{ $t(infoLabel, [questionDetails.transactions.length]) }}
      </Label>
    </div>
    <div v-if="showDecision" class="mb-3 text-white text-center">
      <Label> {{ approvalData?.decision }} </Label>
    </div>
    <div
      v-if="questionDetails?.questionId && showQuestionInfo"
      class="mb-3 p-4 text-white text-center"
    >
      <div>
        <Label> {{ approvalData?.decision }} </Label>
      </div>
      <div class="m-4 text-center">
        <Label> {{ approvalData?.currentBond }} </Label>
      </div>
      <div>
        <Label> {{ approvalData?.timeLeft }} </Label>
      </div>
    </div>
    <UiButton
      v-if="showActionButton"
      @click="performAction"
      :disabled="!actionEnabled"
      v-text="$t(actionLabel, [questionDetails.transactions.length])"
      class="mb-2 width-full button"
    />
    <UiButton
      v-if="canClaim"
      @click="claimBond"
      v-text="$t('safeSnap.claimBond')"
      class="mb-3 width-full button"
    />
    <teleport to="#modal">
      <PluginSafeSnapModalOptionApproval
        :minimumBond="questionDetails?.minimumBond"
        :open="modalApproveDecisionOpen"
        :isApproved="questionDetails?.isApproved"
        :bond="questionDetails?.currentBond"
        :questionId="questionDetails?.questionId"
        @setApproval="voteOnQuestion"
        @close="modalApproveDecisionOpen = false"
      />
    </teleport>
  </Block>
</template>

<script>
import Plugin from '@snapshot-labs/snapshot.js/src/plugins/safeSnap';
import { sleep } from '@/helpers/utils';
import { formatBatchTransaction } from '@/helpers/abi/utils';

const QuestionStates = {
  error: -1,
  loading: 0,
  proposalNotResolved: 1,
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
  props: [
    'proposalConfig',
    'proposalId',
    'proposalEnd',
    'network',
    'moduleAddress'
  ],
  data() {
    return {
      loading: true,
      questionStates: QuestionStates,
      actionInProgress: false,
      plugin: new Plugin(),
      questionDetails: undefined,
      modalApproveDecisionOpen: false,
      bondData: {
        canClaim: undefined,
        data: undefined
      }
    };
  },
  computed: {
    questionState() {
      if (this.loading) return QuestionStates.loading;

      const ts = (Date.now() / 1e3).toFixed();
      if (ts < this.proposalEnd) return QuestionStates.proposalNotResolved;
      if (!this.questionDetails) return QuestionStates.error;

      if (!this.questionDetails.questionId)
        return QuestionStates.waitingForQuestion;

      if (this.questionDetails?.currentBond === '0.0')
        return QuestionStates.questionNotSet;

      if (
        this.questionDetails?.currentBond !== '0.0' &&
        !this.questionDetails.finalizedAt
      )
        return QuestionStates.questionNotResolved;

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
    actionLabel() {
      switch (this.questionState) {
        case QuestionStates.loading:
          return 'loading';
        case QuestionStates.waitingForQuestion:
          return 'safeSnap.labels.request';
        case QuestionStates.questionNotSet:
          return 'safeSnap.labels.setOutcome';
        case QuestionStates.questionNotResolved:
          return 'safeSnap.labels.changeOutcome';
        case QuestionStates.proposalApproved:
          return 'safeSnap.labels.executeTxs';
        case QuestionStates.completelyExecuted:
          return 'safeSnap.labels.executed';
        case QuestionStates.error:
          return 'safeSnap.labels.error';
        default:
          return null;
      }
    },
    actionEnabled() {
      if (!this.$auth.isAuthenticated.value) return false;
      switch (this.questionState) {
        case QuestionStates.waitingForQuestion:
        case QuestionStates.questionNotResolved:
        case QuestionStates.questionNotSet:
        case QuestionStates.waitingForExecution:
        case QuestionStates.proposalApproved:
          return true;
        default:
          return false;
      }
    },
    showDecision() {
      return (
        this.questionDetails?.questionId &&
        !this.showQuestionInfo &&
        !this.questionState === QuestionStates.proposalApproved
      );
    },
    infoLabel() {
      switch (this.questionState) {
        case QuestionStates.proposalNotResolved:
          return 'safeSnap.labels.waiting';
        case QuestionStates.waitingForQuestion:
        case QuestionStates.questionNotSet:
        case QuestionStates.questionNotResolved:
          return 'safeSnap.labels.finalized';
        case QuestionStates.completelyExecuted:
          return 'safeSnap.labels.executed';
        default:
          return null;
      }
    },
    showQuestionInfo() {
      return (
        this.questionState === this.questionStates.waitingForQuestion ||
        this.questionState === this.questionStates.questionNotSet ||
        this.questionState === this.questionStates.questionNotResolved ||
        this.questionState === this.questionStates.waitingForCooldown
      );
    },
    approvalData() {
      if (this.questionDetails) {
        const { currentBond, finalizedAt, isApproved, endTime } =
          this.questionDetails;
        if (currentBond === '0.0') {
          return {
            decision: this.$i18n.t('safeSnap.currentOutcome', ['--']),
            timeLeft: this.$i18n.t('safeSnap.finalizedIn', ['--']),
            currentBond: this.$i18n.t('safeSnap.currentBond', ['--'])
          };
        }

        if (finalizedAt) {
          if (isApproved) {
            return {
              decision: this.$i18n.t('safeSnap.finalOutcome', ['Yes']),
              timeLeft: this.$i18n.t('safeSnap.executableIn', [
                this._ms(endTime + this.questionDetails.cooldown)
              ])
            };
          }

          return {
            decision: this.$i18n.t('safeSnap.finalOutcome', ['No'])
          };
        }

        return {
          decision: this.$i18n.t('safeSnap.currentOutcome', [
            isApproved ? 'Yes' : 'No'
          ]),
          timeLeft: this.$i18n.t('safeSnap.finalizedIn', [this._ms(endTime)]),
          currentBond: this.$i18n.t('safeSnap.currentBond', [currentBond])
        };
      }
      return {
        decision: `--`,
        timeLeft: `--`,
        currentBond: '--'
      };
    },
    canChangeAnswer() {
      return this.questionState === 3 && !this.questionDetails.finalizedAt;
    },
    showActionButton() {
      return (
        this.questionState === QuestionStates.waitingForQuestion ||
        this.questionState === QuestionStates.questionNotResolved ||
        this.questionState === QuestionStates.questionNotSet ||
        (this.questionDetails?.executionApproved &&
          !this.questionState === QuestionStates.waitingForCooldown) ||
        this.questionState === QuestionStates.waitingForExecution ||
        this.questionState === QuestionStates.proposalApproved ||
        !this.questionState === QuestionStates.completelyExecuted
      );
    },
    canClaim() {
      return this.bondData.canClaim;
    }
  },
  async created() {
    await this.updateDetails();
  },
  methods: {
    async updateDetails() {
      if (!this.moduleAddress) return;
      this.loading = true;
      try {
        this.questionDetails = await this.plugin.getExecutionDetails(
          this.network,
          this.moduleAddress,
          this.proposalId,
          this.proposalConfig.txs.map(formatBatchTransaction)
        );
        if (this.questionDetails.questionId) {
          this.bondData = await this.plugin.loadClaimBondData(
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

        await this.plugin.claimBond(
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
            await this.plugin.submitProposal(
              this.$auth.web3,
              this.moduleAddress,
              this.questionDetails.proposalId,
              this.questionDetails.transactions
            );
            break;
          case QuestionStates.questionNotSet:
          case QuestionStates.questionNotResolved:
            this.modalApproveDecisionOpen = true;
            return;
          case QuestionStates.proposalApproved:
            await this.plugin.executeProposal(
              this.$auth.web3,
              this.moduleAddress,
              this.questionDetails.proposalId,
              this.questionDetails.transactions,
              this.questionDetails.nextTxIndex
            );
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
      await this.plugin.voteForQuestion(
        this.$auth.web3,
        this.questionDetails.oracle,
        this.questionDetails.questionId,
        this.questionDetails.minimumBond,
        option
      );
      await sleep(3e3);
      await this.updateDetails();
    }
  }
};
</script>
