import pkg from '@/../package.json';

export function useReportDownload() {
  const isDownloadingVotes = ref(false);
  const errorCode: globalThis.Ref<null | Error> = ref(null);

  async function downloadFile(blob: Blob, fileName: string) {
    const href = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), {
      href,
      style: 'display:none',
      download: fileName
    });
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(href);
    a.remove();
  }

  async function downloadVotes(proposalId: string) {
    isDownloadingVotes.value = true;
    errorCode.value = null;

    return fetch(`${import.meta.env.VITE_SIDEKICK_URL}/votes/${proposalId}`, {
      method: 'POST'
    })
      .then(async response => {
        if (response.status !== 200) {
          throw new Error((await response.json()).error.message);
        }
        return response.blob();
      })
      .then(blob => {
        downloadFile(blob, `${pkg.name}-report-${proposalId}`);
        return true;
      })
      .catch((e: Error) => {
        errorCode.value = e;
        return false;
      })
      .finally(() => {
        isDownloadingVotes.value = false;
      });
  }

  return {
    downloadVotes,
    isDownloadingVotes,
    errorCode
  };
}
