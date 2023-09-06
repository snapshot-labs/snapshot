import {
  SchemaRegistry,
  EAS,
  SchemaEncoder,
  AttestationRequestData
} from '@ethereum-attestation-service/eas-sdk';
import type { Web3Provider } from '@ethersproject/providers';
import type { Wallet } from '@ethersproject/wallet';
import { EASNetworks } from './constants';
import { calcPercentageOfSum } from '@snapshot-labs/snapshot.js/src/voting/quadratic';

export const WEIGHTED_VOTING_PROPOSAL_SCHEMA_UID =
  '0x5cdcfa48b615f285686efd222db3b733e93d5e6fb6448f1f115726d6b4f2b55f';

export async function createWeightedVotingProposalSchema(
  web3: Web3Provider | Wallet
) {
  const signer = 'getSigner' in web3 ? web3.getSigner() : web3;
  const network = await signer.getChainId();
  const easConfig = EASNetworks[network];
  console.log({ easConfig, network });
  const schemaRegistryContractAddress = easConfig.SchemaRegistry;
  const schemaRegistry = new SchemaRegistry(schemaRegistryContractAddress);

  schemaRegistry.connect(signer as any);

  const schema = 'string choice, uint16 percent, bytes32 proposalId';
  // const resolverAddress: string = ZERO_ADDRESS;

  const revocable = true;

  const transaction = await schemaRegistry.register({
    schema,
    // resolverAddress,
    revocable
  });

  // Optional: Wait for transaction to be validated
  await transaction.wait();
}
export async function weightedVotingProposalAttest(
  proposalId: string,
  web3: Web3Provider | Wallet,
  data: { name: string; value: number }[]
) {
  console.log('proposalId: ', proposalId);
  const totalValues = data.map(item => item.value);
  const _data = data.map(item => {
    return {
      name: item.name,
      percentage: Math.round(
        calcPercentageOfSum(item.value, totalValues) * 10000
      )
    };
  });

  console.log('_data: ', _data);

  const signer = 'getSigner' in web3 ? web3.getSigner() : web3;
  // const signer = 'getSigner' in web3 ? web3.getSigner() : web3;
  // console.log({ signer });
  const network = await signer.getChainId();
  const easConfig = EASNetworks[network];
  const eas = new EAS(easConfig.EASDeployment);
  const schemaRegistry = new SchemaRegistry(easConfig.SchemaRegistry);

  // const _signer = {
  //   ...signer,
  //   signTypedData: signer._signTypedData
  // };
  //
  eas.connect(signer as any);
  schemaRegistry.connect(signer as any);

  const schema = await schemaRegistry.getSchema({
    uid: WEIGHTED_VOTING_PROPOSAL_SCHEMA_UID
  });
  const schemaEncoder = new SchemaEncoder(schema.schema);
  console.log('schema.schema: ', schema.schema);

  try {
    const multiAttestData = _data.map((item): AttestationRequestData => {
      const encodedData = schemaEncoder.encodeData([
        {
          name: 'proposalId',
          type: 'bytes32',
          value: proposalId
        },
        { name: 'name', type: 'string', value: item.name },
        {
          name: 'percent',
          type: 'uint16',
          value: item.percentage
        }
      ]);
      return {
        recipient: '0x0000000000000000000000000000000000000000',
        revocable: false, // Be aware that if your schema is not revocable, this MUST be false
        data: encodedData
      };
    });
    const tx = await eas.multiAttest([
      {
        schema: WEIGHTED_VOTING_PROPOSAL_SCHEMA_UID,
        data: multiAttestData
      }
    ]);

    const newAttestationUID = await tx.wait();

    console.log('New attestation UID:', newAttestationUID);
  } catch (e) {
    console.log('error on sending tx:', e);
  }
}
