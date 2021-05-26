<template>
  <Block
    title="SafeSnap"
    :icon="!loading && moduleAddress ? 'refresh' : undefined"
    @submit="updateDetails"
  >
    <div class="mb-3 text-center">
      <Label> {{ infoLabel }} </Label>
    </div>
    <div
      v-if="questionDetails?.questionId && !showQuestionInfo"
      class="mb-3 text-white text-center"
    >
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
      v-text="actionLabel"
      class="width-full button"
    />
    <teleport to="#modal">
      <PluginSafeSnapModalOptionApproval
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
import Plugin from '@snapshot-labs/snapshot.js/src/plugins/daoModule';
import { sleep } from '@/helpers/utils';

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
    'porposalId',
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
      modalApproveDecisionOpen: false
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
        return QuestionStates.proposalApproved;
      } else {
        if (this.questionDetails.finalizedAt < ts) {
          return QuestionStates.proposalRejected;
        }
      }

      if (this.questionDetails.nextTxIndex >= 0)
        return QuestionStates.completelyExecuted;
    },
    actionLabel() {
      switch (this.questionState) {
        case QuestionStates.loading:
          return 'Loading...';
        case QuestionStates.waitingForQuestion:
          return 'Request Execution';
        case QuestionStates.questionNotSet:
          return 'Set outcome';
        case QuestionStates.questionNotResolved:
          return 'Change outcome';
        case QuestionStates.proposalApproved:
          return 'Execute Transaction 1/x';
        case QuestionStates.completelyExecuted:
          return 'Executed!';
        case QuestionStates.error:
          return 'Error';
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
    infoLabel() {
      switch (this.questionState) {
        case QuestionStates.proposalNotResolved:
          return 'Waiting for vote to close';
        case QuestionStates.waitingForQuestion:
        case QuestionStates.questionNotSet:
        case QuestionStates.questionNotResolved:
          return 'Vote finalized';
        case QuestionStates.completelyExecuted:
          return 'Proposal executed';
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
        const {
          currentBond,
          finalizedAt,
          isApproved,
          endTime
        } = this.questionDetails;
        if (currentBond === '0.0') {
          return {
            decision: 'Current outcome: --',
            timeLeft: 'Finalized in: --',
            currentBond: 'Current bond: --'
          };
        }

        if (finalizedAt) {
          if (isApproved) {
            return {
              decision: 'Outcome: Yes',
              timeLeft: `Executable ${this._ms(
                endTime + this.questionDetails.cooldown
              )}`
            };
          }

          return {
            decision: 'Outcome: No'
          };
        }

        return {
          decision: `Current outcome: ${isApproved ? 'Yes' : 'No'}`,
          timeLeft: `Finalized ${this._ms(endTime)}`,
          currentBond: 'Current bond: ' + currentBond
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
        this.questionState === QuestionStates.proposalApproved
      );
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
          this.porposalId,
          this.proposalConfig.txs
        );
        console.log(this.questionDetails);
      } catch (e) {
        console.error(e);
      } finally {
        this.loading = false;
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
