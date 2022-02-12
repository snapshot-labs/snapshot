import { useI18n } from '@/composables/useI18n';
import { useCopy } from '@/composables/useCopy';
import { useShare } from '@vueuse/core';

export function useSharing() {
  const { t } = useI18n();

  const sharingItems = [
    {
      text: 'Twitter',
      action: 'shareToTwitter',
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

  function startShare(space, proposal) {
    share({
      title: '',
      text: `${space.name} - ${proposal.title}`,
      url: proposalUrl(space.id, proposal)
    });
  }

  function shareToTwitter(space, proposal, window) {
    const url = `https://twitter.com/intent/tweet?text=@${
      space.twitter || space.name
    }%20${encodeURIComponent(proposal.title)}%20${encodedProposalUrl(
      space.id,
      proposal
    )}`;
    window.open(url, '_blank').focus();
  }

  function shareToFacebook(space, proposal, window) {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodedProposalUrl(
      space.id,
      proposal
    )}&quote=${encodeURIComponent(proposal.title)}`;
    window.open(url, '_blank').focus();
  }

  const { copyToClipboard } = useCopy();

  function shareToClipboard(space, proposal) {
    copyToClipboard(proposalUrl(space.id, proposal));
  }

  return {
    shareToTwitter,
    shareToFacebook,
    shareToClipboard,
    proposalUrl,
    startShare,
    sharingIsSupported: isSupported,
    sharingItems
  };
}
