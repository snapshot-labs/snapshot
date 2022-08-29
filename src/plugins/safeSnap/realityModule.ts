import { _TypedDataEncoder } from '@ethersproject/hash';
import {
  call,
  multicall,
  sendTransaction
} from '@snapshot-labs/snapshot.js/src/utils';
import {
  AbstractExecutor,
  EIP712_TYPES,
  ModuleExecutionData
} from '@/helpers/safe';
import {
  createMultiSendTx,
  getMultiSendAddress,
  Transaction
} from '@/helpers/transactionBuilder';
import { HashZero } from '@ethersproject/constants';
import { keccak256 } from '@ethersproject/solidity';
import { BigNumber } from '@ethersproject/bignumber';

export const REALITY_MODULE_ABI = [
  // Events
  'event ProposalQuestionCreated(bytes32 indexed questionId, string indexed proposalId)',

  // Read functions
  'function avatar() view returns (address)', // Reality Module
  'function executor() view returns (address)', // Dao Module
  'function oracle() view returns (address)',
  'function questionCooldown() view returns (uint32)',
  'function answerExpiration() view returns (uint32)',
  'function buildQuestion(string proposalId, bytes32[] txHashes) view returns (string)',
  'function getQuestionId(string question, uint256 nonce) view returns (bytes32)',
  'function executedProposalTransactions(bytes32 questionHash, bytes32 txHash) view returns (bool)',
  'function questionIds(bytes32 questionHash) view returns (bytes32)',
  'function minimumBond() view returns (uint256)',

  // Write functions
  'function addProposal(string proposalId, bytes32[] txHashes)',
  'function executeProposalWithIndex(string proposalId, bytes32[] txHashes, address to, uint256 value, bytes data, uint8 operation, uint256 txIndex)'
];

export const REALITY_ORACLE_ABI = [
  // Events
  `event LogNewAnswer(
    bytes32 answer,
    bytes32 indexed question_id,
    bytes32 history_hash,
    address indexed user,
    uint256 bond,
    uint256 ts,
    bool is_commitment
  )`,

  // Read functions
  'function resultFor(bytes32 question_id) view returns (bytes32)',
  'function getFinalizeTS(bytes32 question_id) view returns (uint32)',
  'function getBond(bytes32 question_id) view returns (uint256)',
  'function getBestAnswer(bytes32 question_id) view returns (uint32)',
  'function balanceOf(address) view returns (uint256)',
  'function getHistoryHash(bytes32 question_id) view returns (bytes32)',
  'function isFinalized(bytes32 question_id) view returns (bool)',
  'function token() view returns (address)',

  // Write functions
  'function submitAnswer(bytes32 question_id, bytes32 answer, uint256 max_previous) external payable',
  'function submitAnswerERC20(bytes32 question_id, bytes32 answer, uint256 max_previous, uint256 tokens) external',
  `function claimMultipleAndWithdrawBalance(
    bytes32[] question_ids,
    uint256[] lengths,
    bytes32[] hist_hashes,
    address[] addrs,
    uint256[] bonds,
    bytes32[] answers
  ) public`,
  'function withdraw() public'
];

export const ERC20_ABI = [
  //Read functions
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint32)',
  'function symbol() view returns (string)',
  'function allowance(address owner, address spender) external view returns (uint256)',

  // Write functions
  'function approve(address spender, uint256 value) external returns (bool)',
  'function transfer(address recipient, uint256 amount) public virtual override returns (bool)'
];

export const ERC721_ABI = [
  'function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable'
];

export class RealityModule extends AbstractExecutor {
  public batchHashes!: string[];
  public question = '';
  public questionHash = '';
  public questionId = '';
  public executionApproved = false;
  public nextTxIndex: number | undefined = undefined;
  public finalizedAt: number | undefined = undefined;
  public daoAddress: string | undefined = undefined;
  public oracleAddress!: string;
  public cooldown: number | undefined = undefined;
  public minimumBond: number | undefined = undefined;
  public expiration: number | undefined = undefined;

  constructor(executionData: ModuleExecutionData, proposalId: string) {
    super(executionData, proposalId);

    this.hashBatches();
  }

  async *proposeTransactions() {
    const tx = await sendTransaction(
      this.writeProvider,
      this.executionData.module.address,
      REALITY_MODULE_ABI,
      'addProposal',
      [this.proposalId, this.batchHashes]
    );
    yield;
    await tx.wait();
  }

  async *executeTransactions() {
    yield;
  }

  async *disputeTransactions() {
    yield;
  }

  hashBatches(): void {
    const hashes: string[] = [];

    this.executionData.batches.forEach((batch, nonce) => {
      if (batch.length === 1) {
        hashes.push(this.calcTransactionHash(batch[0], nonce.toString()));
      } else if (batch.length > 1) {
        hashes.push(
          this.calcTransactionHash(
            createMultiSendTx(
              batch,
              nonce.toString(),
              getMultiSendAddress(this.executionData.safe.network)
            )
          )
        );
      }
    });

    this.batchHashes = hashes;
  }

  calcTransactionHash(transaction: Transaction, nonce = '0') {
    const domain = {
      chainId: this.executionData.safe.network,
      verifyingContract: this.executionData.module.address
    };

    return _TypedDataEncoder.hash(domain, EIP712_TYPES, {
      ...transaction,
      data: transaction.data || '0x',
      nonce
    });
  }

  async setQuestion(): Promise<void> {
    this.question = await call(this.readProvider, REALITY_MODULE_ABI, [
      this.executionData.module.address,
      'buildQuestion',
      [this.proposalId, this.batchHashes]
    ]);
    this.questionHash = keccak256(['string'], [this.question]);
    this.questionId = await call(this.readProvider, REALITY_MODULE_ABI, [
      this.executionData.module.address,
      'getQuestionId',
      [this.question, 0]
    ]);
  }

  async setProposalDetails(): Promise<void> {
    const proposalInfo = (
      await multicall(
        this.executionData.safe.network,
        this.readProvider,
        REALITY_MODULE_ABI,
        [
          [
            this.executionData.module.address,
            'questionIds',
            [this.questionHash]
          ]
        ].concat(
          this.batchHashes.map(txHash => [
            this.executionData.module.address,
            'executedProposalTransactions',
            [this.questionHash, txHash]
          ])
        )
      )
    ).map(res => res[0]);

    const questionId = proposalInfo[0];
    // We need to offset the index by -1 the first element is the questionId
    const nextIndexToExecute = proposalInfo.indexOf(false, 1) - 1;

    this.questionId = questionId !== HashZero ? questionId : undefined;
    this.nextTxIndex =
      nextIndexToExecute < 0 || nextIndexToExecute >= this.batchHashes.length
        ? undefined
        : nextIndexToExecute;
  }

  async setModuleDetails(): Promise<void> {
    const moduleDetails = await multicall(
      this.executionData.safe.network,
      this.readProvider,
      REALITY_MODULE_ABI,
      [
        [this.executionData.module.address, 'avatar'],
        [this.executionData.module.address, 'oracle'],
        [this.executionData.module.address, 'questionCooldown'],
        [this.executionData.module.address, 'minimumBond'],
        [this.executionData.module.address, 'answerExpiration']
      ]
    );

    this.daoAddress = moduleDetails[0][0];
    this.oracleAddress = moduleDetails[1][0];
    this.cooldown = moduleDetails[2][0];
    this.minimumBond = moduleDetails[3][0];
    this.expiration = moduleDetails[4][0];
  }

  async checkPossibleExecution(): Promise<void> {
    if (this.questionId) {
      try {
        const result = await multicall(
          this.executionData.safe.network,
          this.readProvider,
          REALITY_ORACLE_ABI,
          [
            [this.oracleAddress, 'resultFor', [this.questionId]],
            [this.oracleAddress, 'getFinalizeTS', [this.questionId]]
          ]
        );

        this.executionApproved = BigNumber.from(result[0][0]).eq(
          BigNumber.from(1)
        );
        this.finalizedAt = BigNumber.from(result[1][0]).toNumber();
      } catch (e) {
        // We expect an error while the question is not answered yet
      }
    }

    this.executionApproved = false;
    this.finalizedAt = undefined;
  }

  async *setOracleAnswer(answer: '1' | '0') {
    if (!this.writeProvider) return;

    const currentBond = await call(this.readProvider, REALITY_ORACLE_ABI, [
      this.oracleAddress,
      'getBond',
      [this.questionId]
    ]);

    let bond;
    let methodName;
    const txOverrides = {};
    let parameters = [this.questionId, HashZero.replace(/.$/, answer)];

    const currentBondIsZero = currentBond.eq(BigNumber.from(0));
    if (currentBondIsZero) {
      // DaoModules can have 0 minimumBond, if it happens, the initial bond will be 1 token
      const daoBondIsZero = BigNumber.from(this.minimumBond).eq(0);
      bond = daoBondIsZero ? BigNumber.from(10) : this.minimumBond;
    } else {
      bond = currentBond.mul(2);
    }

    // fetch token attribute from Realitio contract, if it works, it means it is
    // a RealitioERC20, otherwise the catch will handle the currency as ETH
    try {
      const account = (await this.writeProvider.listAccounts())[0];
      const token = await call(this.readProvider, REALITY_ORACLE_ABI, [
        this.oracleAddress,
        'token',
        []
      ]);
      const [[tokenDecimals], [allowance]] = await multicall(
        this.executionData.safe.network,
        this.readProvider,
        ERC20_ABI,
        [
          [token, 'decimals', []],
          [token, 'allowance', [account, this.oracleAddress]]
        ]
      );

      if (bond.eq(10)) {
        bond = bond.pow(tokenDecimals);
      }

      // Check if contract has allowance on user tokens,
      // if not, trigger approve method
      if (allowance.lt(bond)) {
        const approveTx = await sendTransaction(
          this.writeProvider,
          token,
          ERC20_ABI,
          'approve',
          [this.oracleAddress, bond],
          {}
        );
        yield 'erc20-approval';
        const approvalReceipt = await approveTx.wait();
        console.log('[DAO module] token transfer approved:', approvalReceipt);
        yield;
      }
      parameters = [...parameters, bond, bond];
      methodName = 'submitAnswerERC20';
    } catch (e) {
      if (bond.eq(10)) {
        bond = bond.pow(18);
      }
      parameters = [...parameters, bond];
      txOverrides['value'] = bond.toString();
      methodName = 'submitAnswer';
    }

    const tx = await sendTransaction(
      this.writeProvider,
      this.oracleAddress,
      REALITY_ORACLE_ABI,
      methodName,
      parameters,
      txOverrides
    );
    yield;
    const receipt = await tx.wait();
    console.log('[DAO module] executed vote on oracle:', receipt);
  }
}
