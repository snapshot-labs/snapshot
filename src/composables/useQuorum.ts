import { useIntl } from '@/composables';

export function useQuorum() {
  const { formatCompactNumber } = useIntl();

  const quorumScore = payload => {
    let scores = 0;
    if (
      payload.proposal.privacy === 'shutter' &&
      payload.proposal.scores_state !== 'final'
    )
      scores = payload.votes.reduce((a, b) => a + b.balance, 0);
    else if (payload.results) scores = payload.results.scoresTotal;
    return formatCompactNumber(scores);
  };

  return { quorumScore };
}
