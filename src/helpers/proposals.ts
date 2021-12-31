export function getProposalPeriod(proposal) {
  if (proposal.state === 'closed') return 'endedAgo';
  if (proposal.state === 'active') return 'proposalToNow';
  return 'proposalStartIn';
}
