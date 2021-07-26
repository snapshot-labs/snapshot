import { useI18n } from 'vue-i18n';
import { useClipboard } from '@vueuse/core';

export function useShare() {
  const { t } = useI18n();
  const { copy } = useClipboard();

  const sharingItems = [
    {
      text: t('Twitter'),
      action: 'shareToTwitter',
      icon: 'twitter'
    },
    {
      text: t('Facebook'),
      action: 'shareToFacebook',
      icon: 'facebook'
    },
    {
      text: t('Copy link'),
      action: 'shareToClipboard',
      icon: 'insertlink'
    }
  ];

  function proposalUrl(key, proposal) {
    return `https://snapshot.org/#/${key}/proposal/${proposal.id}`;
  }
  function encodedProposalUrl(key, proposal) {
    return encodeURIComponent(proposalUrl(key, proposal));
  }

  function shareToTwitter(space, proposal) {
    return `https://twitter.com/intent/tweet?text=@${
      space.twitter || space.name
    }%20${encodeURIComponent(proposal.title)}%20${encodedProposalUrl(
      space.key,
      proposal
    )}`;
  }

  function shareToFacebook(space, proposal) {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodedProposalUrl(
      space.key,
      proposal
    )}&quote=${encodeURIComponent(proposal.title)}`;
  }

  function shareToClipboard(space, proposal) {
    copy(proposalUrl(space.key, proposal));
  }

  return {
    shareToTwitter,
    shareToFacebook,
    shareToClipboard,
    proposalUrl,
    sharingItems
  };
}
