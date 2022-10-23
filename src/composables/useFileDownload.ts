import jsonexport from 'jsonexport/dist';
import pkg from '@/../package.json';
import { getProposalVotes } from '@/helpers/snapshot';
import { Vote } from '@/helpers/interfaces';

export function useFileDownload() {
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
    let batches = 0;
    const batchSize = 1000;
    async function getAllVotes() {
      const votesRes =
        (await getProposalVotes(proposalId, {
          skip: batchSize * batches,
          first: batchSize
        })) ?? [];
      batches += 1;
      votes = votes.concat(votesRes);
      if (votes.length === batchSize * batches) {
        await getAllVotes();
      }
    }
    await getAllVotes();
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
