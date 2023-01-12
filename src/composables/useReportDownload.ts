import { ref } from 'vue';
import jsonexport from 'jsonexport/dist';
import pkg from '@/../package.json';
import { getProposalVotes } from '@/helpers/snapshot';
import { Vote } from '@/helpers/interfaces';

export function useReportDownload() {
  async function getCsvFile(
    data: any[] | Record<string, any>,
    fileName: string
  ) {
    const csv = await jsonexport(data);
    const link = document.createElement('a');
    link.setAttribute('href', `data:text/csv;charset=utf-8,${csv}`);
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
  }

  async function getAllVotes(proposalId: string, space: string) {
    let votes: Vote[] = [];
    let page = 0;
    const pageSize = 1000;
    while (votes.length === pageSize * page) {
      const newVotes = await getProposalVotes(proposalId, {
        first: pageSize,
        skip: page * pageSize,
        space: space
      });
      votes = [...votes, ...newVotes];
      page++;
    }
    return votes;
  }

  const isDownloadingVotes = ref(false);

  async function downloadVotes(proposalId: string, space: string) {
    isDownloadingVotes.value = true;
    const votes = await getAllVotes(proposalId, space);
    if (!votes.length) return;
    const data = votes.map(vote => {
      return {
        address: vote.voter,
        choice: vote.choice,
        voting_power: vote.vp,
        timestamp: vote.created,
        date_utc: new Date(vote.created * 1e3).toUTCString(),
        author_ipfs_hash: vote.ipfs
      };
    });
    try {
      getCsvFile(data, `${pkg.name}-report-${proposalId}`);
    } catch (e) {
      console.error(e);
      isDownloadingVotes.value = false;
    }
    isDownloadingVotes.value = false;
  }

  return {
    downloadVotes,
    isDownloadingVotes
  };
}
