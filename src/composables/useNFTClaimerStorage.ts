import { BigNumber } from '@ethersproject/bignumber';
import { Mint, getCollection, getSpaceCollection } from '@/helpers/nftClaimer';
import { ExtendedSpace, Profile, Proposal } from '@/helpers/interfaces';
import { formatUnits } from '@ethersproject/units';

type Mintable = {
  maxSupply: number;
  mintPrice: BigNumber;
  formattedMintPrice: number;
  proposerFee: number;
};

type ContractInfo = {
  address: string;
  treasuryAddress: string;
  enabled: boolean;
  createdAt: number;
  mintCount: number;
  proposals: Record<string, CollectionInfo>;
} & Mintable;

type CollectionInfo = {
  id: string;
  mints: (Mint & { userProfile?: Profile })[];
  createdAt: number;
  mintCount: number;
} & Mintable;

const data = ref<Record<string, ContractInfo>>({});
const inited = ref(false);

function formattedMintableInfo(collection: Record<string, any>): Mintable {
  return {
    proposerFee: parseInt(collection.proposerFee),
    mintPrice: BigNumber.from(collection.mintPrice),
    formattedMintPrice: parseFloat(formatUnits(collection.mintPrice, 18)),
    maxSupply: parseInt(collection.maxSupply)
  };
}

export function useNFTClaimerStorage() {
  const { profiles, loadProfiles } = useProfiles();

  function getContractInfo(spaceId: string) {
    return data.value[spaceId];
  }

  function setContractInfo(spaceId: string, info: ContractInfo) {
    data.value[spaceId] = info;
  }

  function getCollectionInfo(spaceId: string, proposalId: string) {
    return getContractInfo(spaceId)?.proposals[proposalId];
  }

  function setCollectionInfo(
    spaceId: string,
    proposalId: string,
    info: CollectionInfo
  ) {
    data.value[spaceId].proposals[proposalId] = info;
  }

  async function initContract(space: ExtendedSpace, force = false) {
    console.debug('NFTClaimer/Storage: init contract', space.id);

    const { id } = space;
    const existingInfo = getContractInfo(id);

    if (!existingInfo || force) {
      console.debug('NFTClaimer/Storage: init contract - set data');
      const info = await getSpaceCollection(id);

      if (info) {
        setContractInfo(id, {
          address: info.id,
          treasuryAddress: info.spaceTreasury as string,
          enabled: info.enabled as boolean,
          createdAt: Date.now(),
          proposals: {},
          mintCount: parseInt(info.mintCount as any),
          ...formattedMintableInfo(info)
        });
      }
    }
  }

  async function initCollection(proposal: Proposal, force = false) {
    console.debug('NFTClaimer/Storage: init collection', proposal.id);

    const spaceId = proposal.space.id;
    let spaceInfo = getContractInfo(spaceId);

    if (!spaceInfo) {
      await initContract(proposal.space);
      spaceInfo = getContractInfo(spaceId);
    }

    if (spaceInfo || force) {
      console.debug('NFTClaimer/Storage: init collection - set data');
      const proposalId = proposal.id;
      const info = await getCollection(BigInt(proposalId));

      setCollectionInfo(spaceId, proposalId, {
        id: proposalId,
        mints: info?.mints?.sort((a, b) => b.timestamp - a.timestamp) || [],
        createdAt: Date.now(),
        mintCount: parseInt((info?.mintCount as any) || 0),
        ...formattedMintableInfo(info || spaceInfo)
      });

      loadProfiles(
        getCollectionInfo(spaceId, proposalId).mints.map(m => m.minterAddress)
      );

      getCollectionInfo(spaceId, proposalId).mints.map(m => {
        m.userProfile = profiles[m.minterAddress];
      });
    }
  }

  async function init(item: ExtendedSpace | Proposal, force = false) {
    try {
      console.debug('NFTClaimer/Storage: init', force);
      if (Object.prototype.hasOwnProperty.call(item, 'space')) {
        await initCollection(item as Proposal, force);
      } else if (item) {
        await initContract(item as ExtendedSpace, force);
      }

      return;
    } catch (e) {
      console.error(
        'NFTClaimer/Storage: unable to fetch data from Subgraph',
        e
      );
    } finally {
      inited.value = true;
    }
  }

  async function refresh(item: ExtendedSpace | Proposal) {
    return init(item, true);
  }

  return {
    getContractInfo,
    getCollectionInfo,
    data,
    init,
    refresh,
    inited
  };
}
