import { useShare } from '@vueuse/core';
import { ExtendedSpace, Proposal } from '@/helpers/interfaces';

export function useSharing() {
  const { t } = useI18n();

  const sharingItems = [
    {
      text: 'Twitter',
      action: 'shareProposalTwitter',
      extras: { icon: 'twitter' }
    },
    {
      text: 'Hey',
      action: 'shareProposalHey',
      extras: { icon: 'hey' }
    },
    {
      text: t('copyLink'),
      action: 'shareToClipboard',
      extras: { icon: 'link' }
    }
  ];

  function proposalUrl(key, proposal) {
    return `https://${window.location.hostname}/#/${key}/proposal/${proposal.id}`;
  }
  function encodedProposalUrl(key, proposal) {
    return encodeURIComponent(proposalUrl(key, proposal));
  }

  const { share, isSupported } = useShare();

  function shareProposal(space, proposal) {
    share({
      title: '',
      text: `${space.name} - ${proposal.title}`,
      url: proposalUrl(space.id, proposal)
    });
  }

  function shareClaim(
    shareTo: 'twitter' | 'hey',
    payload: { proposal: Proposal }
  ) {
    const postText = getClaimedText(shareTo, payload);

    if (window && shareTo === 'hey') return shareHey(postText);
    if (isSupported.value)
      return share({
        title: '',
        text: postText,
        url: proposalUrl(payload.proposal.space.id, payload.proposal)
      });
    if (window && shareTo === 'twitter') return shareTwitter(postText);
  }

  function getClaimedText(
    shareTo: 'twitter' | 'hey',
    payload: { proposal: Proposal }
  ): string {
    const claimedText = `I just claimed my reward for voting on`;

    const spaceHandle = payload.proposal.space.twitter
      ? `@${payload.proposal.space.twitter}`
      : payload.proposal.space.name;

    const hashTag = 'SnapshotClaim';

    if (shareTo === 'hey')
      return `${encodeURIComponent(claimedText)}%20"${encodeURIComponent(
        payload.proposal.title
      )}"%20${encodedProposalUrl(
        payload.proposal.space.id,
        payload.proposal
      )}&hashtags=${hashTag}`;
    if (isSupported.value)
      return `${claimedText} "${payload.proposal.title}" ${spaceHandle} #${hashTag}`;
    if (shareTo === 'twitter')
      return `${encodeURIComponent(claimedText)}%20"${encodeURIComponent(
        payload.proposal.title
      )}"%20${encodedProposalUrl(
        payload.proposal.space.id,
        payload.proposal
      )}%20${spaceHandle}%20%23${hashTag}`;

    return `${claimedText} "${payload.proposal.title}"`;
  }

  function shareVote(
    shareTo: 'twitter' | 'hey',
    payload: { space: ExtendedSpace; proposal: Proposal; choices: string }
  ) {
    const postText = getVotedText(shareTo, payload);

    if (window && shareTo === 'hey') return shareHey(postText);
    if (isSupported.value)
      return share({
        title: '',
        text: postText,
        url: proposalUrl(payload.space.id, payload.proposal)
      });
    if (window && shareTo === 'twitter') return shareTwitter(postText);
  }

  function getVotedText(shareTo: 'twitter' | 'hey', payload): string {
    const isSingleChoice =
      payload.proposal.type === 'single-choice' ||
      payload.proposal.type === 'basic';
    const isPrivate = payload.proposal.privacy === 'shutter';
    const votedText =
      payload.choices && isSingleChoice && !isPrivate
        ? `I just voted "${payload.choices}" on`
        : `I just voted on`;

    const spaceHandle = payload.space.twitter
      ? `@${payload.space.twitter}`
      : payload.space.name;

    const hashTag = 'SnapshotVote';

    if (shareTo === 'hey')
      return `${encodeURIComponent(votedText)}%20"${encodeURIComponent(
        payload.proposal.title
      )}"%20${encodedProposalUrl(
        payload.space.id,
        payload.proposal
      )}&hashtags=${hashTag}`;
    if (isSupported.value)
      return `${votedText} "${payload.proposal.title}" ${spaceHandle} #${hashTag}`;
    if (shareTo === 'twitter')
      return `${encodeURIComponent(votedText)}%20"${encodeURIComponent(
        payload.proposal.title
      )}"%20${encodedProposalUrl(
        payload.space.id,
        payload.proposal
      )}%20${spaceHandle}%20%23${hashTag}`;

    return `${votedText} "${payload.proposal.title}"`;
  }

  function shareTwitter(text) {
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank')?.focus();
  }

  function shareHey(text) {
    const url = `https://hey.xyz/?text=${text}`;
    window.open(url, '_blank')?.focus();
  }

  function shareProposalTwitter(space, proposal) {
    const handle = space.twitter ? `@${space.twitter}` : space.name;
    shareTwitter(
      `${encodeURIComponent(proposal.title)}%20${encodedProposalUrl(
        space.id,
        proposal
      )}%20${handle}%20%23Snapshot`
    );
  }

  function shareProposalHey(space, proposal) {
    shareHey(
      `${encodeURIComponent(proposal.title)}%20${encodedProposalUrl(
        space.id,
        proposal
      )}&hashtags=Snapshot`
    );
  }

  const { copyToClipboard } = useCopy();

  function shareToClipboard(space, proposal) {
    copyToClipboard(proposalUrl(space.id, proposal));
  }

  return {
    shareProposalTwitter,
    shareProposalHey,
    shareToClipboard,
    proposalUrl,
    shareProposal,
    shareVote,
    shareClaim,
    sharingIsSupported: isSupported,
    sharingItems
  };
}
