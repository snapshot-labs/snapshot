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

  totalBalances() {
    return this.proposal.choices.map((choice, i) =>
      this.votes
        .filter((vote: any) => vote.choice.includes(i + 1))
        .reduce((a, b: any) => a + b.balance, 0)
    );
  }

  totalScores() {
    return this.proposal.choices.map((choice, i) =>
      this.strategies.map((strategy, sI) =>
        this.votes
          .filter((vote: any) => vote.choice.includes(i + 1))
          .reduce((a, b: any) => a + b.scores[sI], 0)
      )
    );
  }

  getChoiceString() {
    return this.proposal.choices
      .filter((choice, i) => this.selected.includes(i + 1))
      .join(', ');
  }
}
