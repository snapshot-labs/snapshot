import { useI18n } from '@/composables/useI18n';
import { useCopy } from '@/composables/useCopy';
import { useShare } from '@vueuse/core';

export function useSharing() {
  const { t } = useI18n();

  const sharingItems = [
    {
      text: 'Twitter',
      action: 'shareProposalTwitter',
      extras: { icon: 'twitter' }
    },
    {
      text: t('copyLink'),
      action: 'shareToClipboard',
      extras: { icon: 'insertlink' }
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

  function shareVote(space, proposal, choices: string) {
    const handle = space.twitter ? `@${space.twitter}` : space.name;
    const text = `I just voted "${choices}" for`;
    if (isSupported.value)
      share({
        title: '',
        text: `${text} "${proposal.title}" ${handle} @SnapshotLabs`,
        url: proposalUrl(space.id, proposal)
      });
    else if (window) {
      shareTwitter(
        `${encodeURIComponent(text)}%20"${encodeURIComponent(
          proposal.title
        )}"%20${encodedProposalUrl(
          space.id,
          proposal
        )}%20${handle}%20@SnapshotLabs`
      );
    }
  }

  function shareTwitter(text) {
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank')?.focus();
  }

  function shareProposalTwitter(space, proposal) {
    const handle = space.twitter ? `@${space.twitter}` : space.name;
    shareTwitter(
      `${encodeURIComponent(proposal.title)}%20${encodedProposalUrl(
        space.id,
        proposal
      )}%20${handle}%20@SnapshotLabs`
    );
  }

  const { copyToClipboard } = useCopy();

  function shareToClipboard(space, proposal) {
    copyToClipboard(proposalUrl(space.id, proposal));
  }

  return {
    shareProposalTwitter,
    shareToClipboard,
    proposalUrl,
    shareProposal,
    shareVote,
    sharingIsSupported: isSupported,
    sharingItems
  };
}
