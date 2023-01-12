import { getVp, validate } from '@snapshot-labs/snapshot.js/src/utils';
import { apolloClient } from '@/helpers/apollo';
import { PROPOSAL_QUERY, VOTES_QUERY } from '@/helpers/queries';
import { Vote } from '@/helpers/interfaces';
import cloneDeep from 'lodash/cloneDeep';

export async function getProposalVotes(
  proposalId: string,
  { first, voter, skip, space }: any = {
    first: 1000,
    voter: '',
    skip: 0,
    space: ''
  }
): Promise<Vote[] | []> {
  try {
    console.time('getProposalVotes');
    const response = await apolloClient.query({
      query: VOTES_QUERY,
      variables: {
        id: proposalId,
        orderBy: 'vp',
        orderDirection: 'desc',
        first,
        voter,
        skip,
        space
      }
    });
    console.timeEnd('getProposalVotes');
    const votesResClone = cloneDeep(response);
    return votesResClone.data.votes || [];
  } catch (e) {
    console.log(e);
    return [];
  }
}

export async function getProposal(id) {
  try {
    console.time('getProposal');
    const response = await apolloClient.query({
      query: PROPOSAL_QUERY,
      variables: {
        id
      }
    });
    console.timeEnd('getProposal');

    const proposalResClone = cloneDeep(response);
    const proposal = proposalResClone.data.proposal;

    if (proposal?.plugins?.daoModule) {
      // The Dao Module has been renamed to SafeSnap
      // Previous proposals have to be renamed
      proposal.plugins.safeSnap = proposal.plugins.daoModule;
      delete proposal.plugins.daoModule;
    }

    return proposal;
  } catch (e) {
    console.log(e);
    return e;
  }
}

export async function getPower(space, address, proposal) {
  console.log('[score] getPower');
  const options: any = {};
  if (import.meta.env.VITE_SCORES_URL)
    options.url = import.meta.env.VITE_SCORES_URL;
  return getVp(
    address,
    proposal.network,
    proposal.strategies,
    parseInt(proposal.snapshot),
    space.id,
    proposal.delegation === 1,
    options
  );
}

export async function getValidation(
  space,
  address,
  proposal
): Promise<boolean> {
  console.log('[score] getValidation');
  const options: any = {};
  if (import.meta.env.VITE_SCORES_URL)
    options.url = import.meta.env.VITE_SCORES_URL;
  const validateRes = await validate(
    proposal.validation.name,
    address,
    space.id,
    proposal.network,
    parseInt(proposal.snapshot),
    proposal.validation.params,
    options
  );
  if (typeof validateRes !== 'boolean') return false;
  return validateRes;
}
