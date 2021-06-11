export function percentageOfPower(i, selected) {
  const total: any = Object.values(selected).reduce(
    (a: any, b: any) => a + b,
    0
  );
  const percent = Math.round((selected[i] / total) * 1000) / 10;
  return isNaN(percent) ? 0 : percent;
}

export function quadraticMath(i, choice, balance) {
  return Math.sqrt((percentageOfPower(i + 1, choice) / 100) * balance);
}

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
    return this.proposal.choices
      .map((choice, i) =>
        this.votes
          .map(vote => quadraticMath(i, vote.choice, vote.balance))
          .reduce((a, b: any) => a + b, 0)
      )
      .map(sqrt => sqrt * sqrt);
  }

  votingPowerByStrategy() {
    return this.proposal.choices
      .map((choice, i) =>
        this.strategies.map((strategy, sI) =>
          this.votes
            .map(vote => quadraticMath(i, vote.choice, vote.scores[sI]))
            .reduce((a, b: any) => a + b, 0)
        )
      )
      .map(sqrt => [sqrt * sqrt]);
  }

  getChoiceString() {
    return this.proposal.choices
      .map((choice, i) => {
        if (this.selected[i + 1]) {
          return `${percentageOfPower(i + 1, this.selected)}% for ${choice} `;
        }
      })
      .filter(el => el != null)
      .join(', ');
  }

  totalPowerOfResults() {
    return this.proposal.choices
      .map((choice, i) =>
        this.votes
          .map(vote => quadraticMath(i, vote.choice, vote.balance))
          .reduce((a, b: any) => a + b, 0)
      )
      .map(sqrt => sqrt * sqrt)
      .reduce((a, b: any) => a + b, 0);
  }
}
