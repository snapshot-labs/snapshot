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
      text: 'Lenster',
      action: 'shareProposalLenster',
      extras: { icon: 'lenster' }
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

  function shareVote(
    shareTo: 'twitter' | 'lenster',
    payload: { space: ExtendedSpace; proposal: Proposal; choices: string }
  ) {
    const postText = getSharingText(shareTo, payload);

    if (window && shareTo === 'lenster') return shareLenster(postText);
    if (isSupported.value)
      return share({
        title: '',
        text: postText,
        url: proposalUrl(payload.space.id, payload.proposal)
      });
    if (window && shareTo === 'twitter') return shareTwitter(postText);
  }

  function getSharingText(shareTo: 'twitter' | 'lenster', payload): string {
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

    if (shareTo === 'lenster')
      return `${encodeURIComponent(votedText)}%20"${encodeURIComponent(
        payload.proposal.title
      )}"%20${encodedProposalUrl(
        payload.space.id,
        payload.proposal
      )}&hashtags=Snapshot`;
    if (isSupported.value)
      return `${votedText} "${payload.proposal.title}" ${spaceHandle} #Snapshot`;
    if (shareTo === 'twitter')
      return `${encodeURIComponent(votedText)}%20"${encodeURIComponent(
        payload.proposal.title
      )}"%20${encodedProposalUrl(
        payload.space.id,
        payload.proposal
      )}%20${spaceHandle}%20%23Snapshot`;

    return `${votedText} "${payload.proposal.title}"`;
  }

  function shareTwitter(text) {
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank')?.focus();
  }

  function shareLenster(text) {
    const url = `https://lenster.xyz/?text=${text}`;
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

  function shareProposalLenster(space, proposal) {
    shareLenster(
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
    shareProposalLenster,
    shareToClipboard,
    proposalUrl,
    shareProposal,
    shareVote,
    sharingIsSupported: isSupported,
    sharingItems
  };
}
