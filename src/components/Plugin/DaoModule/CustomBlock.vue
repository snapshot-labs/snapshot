<template>
  <Block
    title="DAO Module Transactions"
    :icon="!loading && moduleAddress ? 'refresh' : undefined"
    @submit="updateDetails"
  >
    <div class="mb-1">
      <div
        v-for="(tx, i) in proposalConfig.txs"
        :key="i"
        class="mb-3 p-4 border rounded-2 text-white text-center"
      >
        <PluginDaoModuleTransactionPreview :transaction="tx" />
      </div>
    </div>
    <UiButton
      v-if="questionDetails?.questionId"
      @click="showQuestion"
      class="width-full mb-2"
    >
      Show Question
    </UiButton>
    <UiButton
      v-if="moduleAddress"
      @click="performAction"
      :disabled="!actionEnabled"
      v-text="actionLabel"
      class="width-full button--submit"
    />
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
  questionNotResolved: 3,
  waitingForCooldown: 4,
  waitingForExecution: 5,
  completelyExecuted: 6
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
      actionInProgress: false,
      plugin: new Plugin(),
      questionDetails: undefined
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
      if (
        !this.questionDetails.executionApproved ||
        !this.questionDetails.finalizedAt
      )
        return QuestionStates.questionNotResolved;
      if (ts < this.questionDetails.finalizedAt + this.questionDetails.cooldown)
        return QuestionStates.waitingForCooldown;
      if (this.questionDetails.nextTxIndex >= 0)
        return QuestionStates.waitingForExecution;
      return QuestionStates.completelyExecuted;
    },
    actionLabel() {
      switch (this.questionState) {
        case QuestionStates.loading:
          return 'Loading...';
        case QuestionStates.proposalNotResolved:
          return 'Not resolved yet!';
        case QuestionStates.waitingForQuestion:
          return 'Request Execution';
        case QuestionStates.questionNotResolved:
          return 'Waiting for Approval!';
        case QuestionStates.waitingForCooldown:
          return 'Waiting for Cooldown!';
        case QuestionStates.waitingForExecution:
          return 'Execute Proposal';
        case QuestionStates.completelyExecuted:
          return 'Executed!';
        case QuestionStates.error:
        default:
          return 'Error';
      }
    },
    actionEnabled() {
      if (!this.$auth.isAuthenticated.value) return false;
      if (this.actionInProgress) return false;
      switch (this.questionState) {
        case QuestionStates.waitingForQuestion:
        case QuestionStates.waitingForExecution:
          return true;
        default:
          return false;
      }
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
          case QuestionStates.waitingForExecution:
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

    showQuestion() {
      window.open(
        'https://reality.eth.link/app/#!/question/' +
          this.questionDetails.questionId,
        '_blank'
      );
    }
  }
};
</script>
