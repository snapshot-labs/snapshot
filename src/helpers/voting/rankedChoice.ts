import { getNumberWithOrdinal } from '@/helpers/utils';
export default class ApprovalVoting {
  public proposal;
  public votes;
  public strategies;
  public selected;

  constructor(proposal, votes, strategies, selected) {
    this.proposal = proposal;
    this.votes = votes;
    this.strategies = strategies;
    this.selected = selected;
  }

  totalVotingPower() {
    //   TODO
    return this.proposal.choices.map((choice, i) =>
      this.votes
        .filter((vote: any) => vote.choice.includes(i + 1))
        .reduce((a, b: any) => a + b.balance, 0)
    );
  }

  votingPowerByStrategy() {
    //   TODO
    return this.proposal.choices.map((choice, i) =>
      this.strategies.map((strategy, sI) =>
        this.votes
          .filter((vote: any) => vote.choice.includes(i + 1))
          .reduce((a, b: any) => a + b.scores[sI], 0)
      )
    );
  }

  totalPowerOfResults() {
    //   TODO
    return this.votes.reduce((a, b: any) => a + b.balance, 0);
  }

  getChoiceString() {
    return this.selected
      .map((choice, i) => {
        if (this.proposal.choices[choice - 1])
          return this.proposal.choices[choice - 1];
      })
      .map((el, i) => `(${getNumberWithOrdinal(i + 1)}) ${el}`)
      .join(', ');
  }
}
