export function percentageOfTotal(
  i: number,
  values: { [k: string]: number },
  total: number[]
) {
  const reducedTotal: any = total.reduce((a: number, b: number) => a + b, 0);
  const percent = (values[i] / reducedTotal) * 100;
  return isNaN(percent) ? 0 : percent;
}

export function quadraticMath(
  i: number,
  choice: { [k: number]: number },
  balance: number
) {
  const filteredPosChoice: { [k: string]: number } = Object.fromEntries(
    Object.entries(choice).filter((c: [string, number]) => c[1] > 0)
  );
  return Math.sqrt(
    (percentageOfTotal(
      i + 1,
      filteredPosChoice,
      Object.values(filteredPosChoice)
    ) /
      100) *
      balance
  );
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

  resultsByVoteBalance() {
    const results = this.proposal.choices
      .map((choice, i) =>
        this.votes
          .map(vote => quadraticMath(i, vote.choice, vote.balance))
          .reduce((a, b: number) => a + b, 0)
      )
      .map(sqrt => sqrt * sqrt);

    return results
      .map((res, i) => percentageOfTotal(i, results, results))
      .map(p => (this.sumOfResultsBalance() / 100) * p);
  }

  resultsByStrategyScore() {
    const results = this.proposal.choices
      .map((choice, i) =>
        this.strategies.map((strategy, sI) =>
          this.votes
            .map(vote => quadraticMath(i, vote.choice, vote.scores[sI]))
            .reduce((a, b: number) => a + b, 0)
        )
      )
      .map(arr => arr.map(sqrt => [sqrt * sqrt]));

    return results.map((res, i) =>
      this.strategies
        .map((strategy, sI) => [
          percentageOfTotal(0, results[i][sI], results.flat(2))
        ])
        .map(p => [(this.sumOfResultsBalance() / 100) * p])
    );
  }

  sumOfResultsBalance() {
    return this.votes.reduce(
      (a: number, b: { [k: string]: number }) => a + b.balance,
      0
    );
  }

  getChoiceString() {
    return this.proposal.choices
      .map((choice, i) => {
        if (this.selected[i + 1]) {
          return `${
            Math.round(
              percentageOfTotal(
                i + 1,
                this.selected,
                Object.values(this.selected)
              ) * 10
            ) / 10
          }% for ${choice}`;
        }
      })
      .filter(el => el != null)
      .join(', ');
  }
}
