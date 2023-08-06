import pkg from '@/../package.json';

export function useReportDownload() {
  const { env } = useApp();
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
    if (env === 'demo') {
      errorCode.value = new Error('UNSUPPORTED_ENV');
      return false;
    }

    isDownloadingVotes.value = true;
    errorCode.value = null;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SIDEKICK_URL}/api/votes/${proposalId}`,
        {
          method: 'POST'
        }
      );

      if (response.status !== 200) {
        throw new Error((await response.json()).error.message);
      }

      downloadFile(await response.blob(), `${pkg.name}-report-${proposalId}`);
      return true;
    } catch (e: any) {
      errorCode.value = e;
      return false;
    } finally {
      isDownloadingVotes.value = false;
    }
  }

  return {
    downloadVotes,
    isDownloadingVotes,
    errorCode
  };
}
