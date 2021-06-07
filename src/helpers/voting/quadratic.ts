import { numberOfVotes } from '@/helpers/utils';

function quadraticScore(votes, score) {
  let total = 0;
  for (let v = 1; v <= votes; v++) {
    total = total + score / v;
    console.log(v, score, total);
  }
  return total;
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

  totalBalances() {
    return this.proposal.choices.map((choice, i) =>
      this.votes
        .map(vote =>
          quadraticScore(numberOfVotes(i + 1, vote.choice), vote.balance)
        )
        .reduce((a, b: any) => a + b, 0)
    );
  }

  totalScores() {
    return this.proposal.choices.map((choice, i) =>
      this.strategies.map((strategy, sI) =>
        this.votes
          .map(vote =>
            quadraticScore(numberOfVotes(i + 1, vote.choice), vote.scores[sI])
          )
          .reduce((a, b: any) => a + b, 0)
      )
    );
  }

  getChoiceString() {
    return this.proposal.choices
      .map((choice, i) => {
        if (this.selected[i + 1]) {
          return `${numberOfVotes(i + 1, this.selected)} votes for ${choice} `;
        }
      })
      .filter(el => el != null)
      .join(', ');
  }

  totalVotesBalances() {
    return this.proposal.choices
      .map((choice, i) =>
        this.votes
          .map(vote =>
            quadraticScore(numberOfVotes(i + 1, vote.choice), vote.balance)
          )
          .reduce((a, b: any) => a + b, 0)
      )
      .reduce((a, b: any) => a + b, 0);
  }
}
