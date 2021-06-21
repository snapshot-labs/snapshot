export default class SingleChoiceVoting {
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

  //  Returns an array with the results for each choice
  resultsByVoteBalance() {
    return this.proposal.choices.map((choice, i) =>
      this.votes
        .filter((vote: any) => vote.choice === i + 1)
        .reduce((a, b: any) => a + b.balance, 0)
    );
  }

  //  Returns an array with the results for each choice
  //  and for each strategy
  resultsByStrategyScore() {
    return this.proposal.choices.map((choice, i) =>
      this.strategies.map((strategy, sI) =>
        this.votes
          .filter((vote: any) => vote.choice === i + 1)
          .reduce((a, b: any) => a + b.scores[sI], 0)
      )
    );
  }

  // Returns the total amount of the results
  sumBalanceAllVotes() {
    return this.votes.reduce((a, b: any) => a + b.balance, 0);
  }

  //  Returns a string of all choices
  getChoiceString() {
    return this.proposal.choices[this.selected - 1];
  }
}
