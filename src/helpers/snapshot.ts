import { getVp, validate } from '@snapshot-labs/snapshot.js/src/utils';
import { apolloClient } from '@/helpers/apollo';
import { PROPOSAL_QUERY, VOTES_QUERY } from '@/helpers/queries';
import { ExtendedSpace, Proposal, Vote } from '@/helpers/interfaces';
import { isAddress } from '@ethersproject/address';
import cloneDeep from 'lodash/cloneDeep';

export async function getProposalVotes(
  proposalId: string,
  {
    first = 1000,
    voter = '',
    skip = 0,
    space = '',
    orderBy = 'vp',
    orderDirection = 'desc',
    created_gte = 0
  } = {}
): Promise<Vote[] | []> {
  try {
    console.time('getProposalVotes');
    const response = await apolloClient.query({
      query: VOTES_QUERY,
      variables: {
        id: proposalId,
        orderBy,
        orderDirection,
        first,
        voter: isAddress(voter) ? voter : undefined,
        skip,
        space: space || undefined,
        created_gte
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

export async function voteValidation(
  space: ExtendedSpace,
  address: string,
  proposal: Proposal
): Promise<boolean> {
  console.log('[score] getValidation');
  const options: any = {};
  if (import.meta.env.VITE_SCORES_URL)
    options.url = import.meta.env.VITE_SCORES_URL;

  const params = proposal.validation?.params || {};
  if (proposal.validation.name === 'basic') {
    params.strategies = params.strategies ?? proposal.strategies;
  }

  const validateRes = await validate(
    proposal.validation.name,
    address,
    space.id,
    proposal.network,
    parseInt(proposal.snapshot),
    params,
    options
  );
  if (typeof validateRes !== 'boolean') {
    console.error('Vote validation failed', validateRes);
    return false;
  }
  return validateRes;
}

export async function proposalValidation(
  space: ExtendedSpace,
  address: string
): Promise<boolean> {
  console.log('[score] getProposalValidation');
  const options: any = {};
  if (import.meta.env.VITE_SCORES_URL)
    options.url = import.meta.env.VITE_SCORES_URL;

  const params = space.validation?.params || {};
  if (space.validation.name === 'basic') {
    params.minScore =
      space.validation?.params?.minScore || space.filters.minScore;
    params.strategies =
      space.validation?.params?.strategies || space.strategies;
  }

  const validateRes = await validate(
    space.validation.name,
    address,
    space.id,
    space.network,
    'latest',
    params,
    options
  );
  if (typeof validateRes !== 'boolean') {
    console.error('Proposal validation failed', validateRes);
    return false;
  }
  return validateRes;
}
