import jsonexport from 'jsonexport/dist';
import pkg from '@/../package.json';
import { getProposalVotes } from '@/helpers/snapshot';
import { Vote } from '@/helpers/interfaces';

export function useReportDownload() {
  async function getCsvFile(
    data: any[] | Record<string, any>,
    fileName: string
  ) {
    try {
      const csv = await jsonexport(data);
      const link = document.createElement('a');
      link.setAttribute('href', `data:text/csv;charset=utf-8,${csv}`);
      link.setAttribute('download', `${fileName}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (e) {
      console.error(e);
    }
  }

  async function getAllVotes(proposalId: string) {
    let votes: Vote[] = [];
    let page = 0;
    const pageSize = 1000;
    while (votes.length === pageSize * page) {
      const newVotes = await getProposalVotes(proposalId, {
        first: pageSize,
        skip: page * pageSize
      });
      votes = [...votes, ...newVotes];
      page++;
    }
    return votes;
  }

  async function downloadVotes(proposalId: string) {
    const votes = await getAllVotes(proposalId);
    if (!votes.length) return;
    const data = votes
      .map(vote => {
        return {
          address: vote.voter,
          choice: vote.choice,
          balance: vote.vp,
          timestamp: vote.created,
          dateUtc: new Date(vote.created * 1e3).toUTCString(),
          authorIpfsHash: vote.ipfs
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
    getCsvFile(data, `${pkg.name}-report-${proposalId}`);
  }

  return {
    downloadVotes
  };
}
