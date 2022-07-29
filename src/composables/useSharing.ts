import { useI18n } from '@/composables/useI18n';
import { useCopy } from '@/composables/useCopy';
import { useShare } from '@vueuse/core';

export function useSharing() {
  const { t } = useI18n();

  const sharingItems = [
    {
      text: 'Twitter',
      action: 'shareProposalTwitter',
      icon: 'twitter'
    },
    {
      text: 'Facebook',
      action: 'shareToFacebook',
      icon: 'facebook'
    },
    {
      text: t('copyLink'),
      action: 'shareToClipboard',
      icon: 'insertlink'
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
    const text = `I just voted "${choices}" for`;
    if (isSupported.value)
      share({
        title: '',
        text: `${text} "${proposal.title}" @${space.twitter || space.name}`,
        url: proposalUrl(space.id, proposal)
      });
    else if (window) {
      shareTwitter(
        `${encodeURIComponent(text)}%20"${encodeURIComponent(
          proposal.title
        )}"%20${encodedProposalUrl(space.id, proposal)}%20@${
          space.twitter || space.name
        }`
      );
    }
  }

  function shareTwitter(text) {
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(url, '_blank')?.focus();
  }

  function shareProposalTwitter(space, proposal) {
    shareTwitter(
      `@${space.twitter || space.name}%20${encodeURIComponent(
        proposal.title
      )}%20${encodedProposalUrl(space.id, proposal)}`
    );
  }

  function shareToFacebook(space, proposal) {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodedProposalUrl(
      space.id,
      proposal
    )}&quote=${encodeURIComponent(proposal.title)}`;
    window.open(url, '_blank')?.focus();
  }

  const { copyToClipboard } = useCopy();

  function shareToClipboard(space, proposal) {
    copyToClipboard(proposalUrl(space.id, proposal));
  }

  return {
    shareProposalTwitter,
    shareToFacebook,
    shareToClipboard,
    proposalUrl,
    shareProposal,
    shareVote,
    sharingIsSupported: isSupported,
    sharingItems
  };
}
