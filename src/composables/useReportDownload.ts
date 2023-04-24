import jsonexport from 'jsonexport/dist';
import pkg from '@/../package.json';
import { getProposalVotes, getProposal } from '@/helpers/snapshot';
import { Vote } from '@/helpers/interfaces';

export function useReportDownload() {
  const isDownloadingVotes = ref(false);
  const downloadProgress = ref(0);

  async function getCsvFile(
    data: any[] | Record<string, any>,
    headers: string[],
    fileName: string
  ) {
    const csv = await jsonexport(data, { headers });
    const link = document.createElement('a');
    link.setAttribute('href', `data:text/csv;charset=utf-8,${csv}`);
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
  }

  async function getAllVotes(
    proposalId: string,
    space: string,
    totalVotesCount: number
  ) {
    let votes: Vote[] = [];
    let page = 0;
    let createdPivot = 0;
    const pageSize = 1000;
    let resultsSize = 0;
    const maxPage = 5;
    do {
      let newVotes = await getProposalVotes(proposalId, {
        first: pageSize,
        skip: page * pageSize,
        space: space,
        created_gte: createdPivot,
        orderBy: 'created',
        orderDirection: 'asc'
      });
      resultsSize = newVotes.length;

      if (page === 0 && createdPivot > 0) {
        const existingIpfs = votes.slice(-pageSize).map(vote => vote.ipfs);

        newVotes = newVotes.filter(vote => {
          return !existingIpfs.includes(vote.ipfs);
        });
      }

      if (page === maxPage) {
        page = 0;
        createdPivot = newVotes[newVotes.length - 1].created;
      } else {
        page++;
      }

      votes = [...votes, ...newVotes];
      downloadProgress.value = Math.floor(
        (votes.length / totalVotesCount) * 100
      );
    } while (resultsSize === pageSize);
    return votes;
  }

  async function downloadVotes(proposalId: string, space: string) {
    isDownloadingVotes.value = true;
    const proposal = await getProposal(proposalId);
    const votes = await getAllVotes(proposalId, space, proposal.votes);
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
      getCsvFile(
        data,
        [
          'address',
          ...proposal.choices.map((choice, index) => `choice.${index + 1}`),
          'voting_power',
          'timestamp',
          'date_utc',
          'author_ipfs_hash'
        ],
        `${pkg.name}-report-${proposalId}`
      );
    } catch (e) {
      console.error(e);
      isDownloadingVotes.value = false;
    }
    isDownloadingVotes.value = false;
  }

  return {
    downloadVotes,
    isDownloadingVotes,
    downloadProgress
  };
}
