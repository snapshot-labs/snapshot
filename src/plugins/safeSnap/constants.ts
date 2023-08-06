import { MULTI_SEND_VERSION } from './utils/multiSend';

export const EIP712_TYPES = {
  Transaction: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
    { name: 'operation', type: 'uint8' },
    { name: 'nonce', type: 'uint256' }
  ]
};

export const EIP3770_PREFIXES = {
  1: 'eth',
  5: 'gor',
  56: 'bnb',
  100: 'gno',
  246: 'ewt',
  73799: 'vt',
  42161: 'arb1',
  137: 'matic'
};

export const EXPLORER_API_URLS = {
  '1': 'https://api.etherscan.io/api',
  '5': 'https://api-goerli.etherscan.io/api',
  '100': 'https://gnosis.blockscout.com/api',
  '73799': 'https://volta-explorer.energyweb.org/api',
  '246': 'https://explorer.energyweb.org/api',
  '137': 'https://api.polygonscan.com/api',
  '56': 'https://api.bscscan.com/api',
  '42161': 'https://api.arbiscan.io/api'
};

export const GNOSIS_SAFE_TRANSACTION_API_URLS = {
  '1': 'https://safe-transaction-mainnet.safe.global/api',
  '5': 'https://safe-transaction-goerli.safe.global/api',
  '100': 'https://safe-transaction-gnosis-chain.safe.global/api',
  '73799': 'https://safe-transaction-volta.safe.global/api',
  '246': 'https://safe-transaction-ewc.safe.global/api',
  '137': 'https://safe-transaction-polygon.safe.global/api',
  '56': 'https://safe-transaction-bsc.safe.global/api',
  '42161': 'https://safe-transaction-arbitrum.safe.global/api'
};

// ABIs

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
  'function executedProposalTransactions(bytes32 questionHash, bytes32 txHash) view returns (bool)',
  'function questionIds(bytes32 questionHash) view returns (bytes32)',
  'function minimumBond() view returns (uint256)',

  // Write functions
  'function addProposal(string proposalId, bytes32[] txHashes)',
  'function executeProposalWithIndex(string proposalId, bytes32[] txHashes, address to, uint256 value, bytes data, uint8 operation, uint256 txIndex)'
];

export const ORACLE_ABI = [
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

export const UMA_MODULE_ABI = [
  'constructor(address _finder, address _owner, address _collateral, uint256 _bondAmount, string _rules, bytes32 _identifier, uint64 _liveness)',
  'error NotIERC165Compliant(address guard_)',
  'event AvatarSet(address indexed previousAvatar, address indexed newAvatar)',
  'event ChangedGuard(address guard)',
  'event Initialized(uint8 version)',
  'event OptimisticGovernorDeployed(address indexed owner, address indexed avatar, address target)',
  'event OptimisticOracleChanged(address indexed newOptimisticOracleV3)',
  'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
  'event ProposalDeleted(bytes32 indexed proposalHash, bytes32 indexed assertionId)',
  'event ProposalExecuted(bytes32 indexed proposalHash, bytes32 indexed assertionId)',
  'event SetCollateralAndBond(address indexed collateral, uint256 indexed bondAmount)',
  'event SetEscalationManager(address indexed escalationManager)',
  'event SetIdentifier(bytes32 indexed identifier)',
  'event SetLiveness(uint64 indexed liveness)',
  'event SetRules(string rules)',
  'event TargetSet(address indexed previousTarget, address indexed newTarget)',
  'event TransactionExecuted(bytes32 indexed proposalHash, bytes32 indexed assertionId, uint256 indexed transactionIndex)',
  'event TransactionsProposed(address indexed proposer, uint256 indexed proposalTime, bytes32 indexed assertionId, tuple(tuple(address to, uint8 operation, uint256 value, bytes data)[] transactions, uint256 requestTime) proposal, bytes32 proposalHash, bytes explanation, string rules, uint256 challengeWindowEnds)',
  'function EXPLANATION_KEY() view returns (bytes)',
  'function PROPOSAL_HASH_KEY() view returns (bytes)',
  'function RULES_KEY() view returns (bytes)',
  'function assertionDisputedCallback(bytes32 assertionId)',
  'function assertionIds(bytes32) view returns (bytes32)',
  'function assertionResolvedCallback(bytes32 assertionId, bool assertedTruthfully)',
  'function avatar() view returns (address)',
  'function bondAmount() view returns (uint256)',
  'function collateral() view returns (address)',
  'function deleteProposalOnUpgrade(bytes32 proposalHash)',
  'function escalationManager() view returns (address)',
  'function executeProposal(tuple(address to, uint8 operation, uint256 value, bytes data)[] transactions)',
  'function finder() view returns (address)',
  'function getCurrentTime() view returns (uint256)',
  'function getGuard() view returns (address _guard)',
  'function getProposalBond() view returns (uint256)',
  'function guard() view returns (address)',
  'function identifier() view returns (bytes32)',
  'function liveness() view returns (uint64)',
  'function optimisticOracleV3() view returns (address)',
  'function owner() view returns (address)',
  'function proposalHashes(bytes32) view returns (bytes32)',
  'function proposeTransactions(tuple(address to, uint8 operation, uint256 value, bytes data)[] transactions, bytes explanation)',
  'function renounceOwnership()',
  'function rules() view returns (string)',
  'function setAvatar(address _avatar)',
  'function setCollateralAndBond(address _collateral, uint256 _bondAmount)',
  'function setEscalationManager(address _escalationManager)',
  'function setGuard(address _guard)',
  'function setIdentifier(bytes32 _identifier)',
  'function setLiveness(uint64 _liveness)',
  'function setRules(string _rules)',
  'function setTarget(address _target)',
  'function setUp(bytes initializeParams)',
  'function sync()',
  'function target() view returns (address)',
  'function transferOwnership(address newOwner)'
];

export const UMA_ORACLE_ABI = [
  'constructor(address _finder, address _defaultCurrency, uint64 _defaultLiveness)',
  'event AdminPropertiesSet(address defaultCurrency, uint64 defaultLiveness, uint256 burnedBondPercentage)',
  'event AssertionDisputed(bytes32 indexed assertionId, address indexed caller, address indexed disputer)',
  'event AssertionMade(bytes32 indexed assertionId, bytes32 domainId, bytes claim, address indexed asserter, address callbackRecipient, address escalationManager, address caller, uint64 expirationTime, address currency, uint256 bond, bytes32 indexed identifier)',
  'event AssertionSettled(bytes32 indexed assertionId, address indexed bondRecipient, bool disputed, bool settlementResolution, address settleCaller)',
  'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
  'function assertTruth(bytes claim, address asserter, address callbackRecipient, address escalationManager, uint64 liveness, address currency, uint256 bond, bytes32 identifier, bytes32 domainId) returns (bytes32 assertionId)',
  'function assertTruthWithDefaults(bytes claim, address asserter) returns (bytes32)',
  'function assertions(bytes32) view returns (tuple(bool arbitrateViaEscalationManager, bool discardOracle, bool validateDisputers, address assertingCaller, address escalationManager) escalationManagerSettings, address asserter, uint64 assertionTime, bool settled, address currency, uint64 expirationTime, bool settlementResolution, bytes32 domainId, bytes32 identifier, uint256 bond, address callbackRecipient, address disputer)',
  'function burnedBondPercentage() view returns (uint256)',
  'function cachedCurrencies(address) view returns (bool isWhitelisted, uint256 finalFee)',
  'function cachedIdentifiers(bytes32) view returns (bool)',
  'function cachedOracle() view returns (address)',
  'function defaultCurrency() view returns (address)',
  'function defaultIdentifier() view returns (bytes32)',
  'function defaultLiveness() view returns (uint64)',
  'function disputeAssertion(bytes32 assertionId, address disputer)',
  'function finder() view returns (address)',
  'function getAssertion(bytes32 assertionId) view returns (tuple(tuple(bool arbitrateViaEscalationManager, bool discardOracle, bool validateDisputers, address assertingCaller, address escalationManager) escalationManagerSettings, address asserter, uint64 assertionTime, bool settled, address currency, uint64 expirationTime, bool settlementResolution, bytes32 domainId, bytes32 identifier, uint256 bond, address callbackRecipient, address disputer))',
  'function getAssertionResult(bytes32 assertionId) view returns (bool)',
  'function getCurrentTime() view returns (uint256)',
  'function getMinimumBond(address currency) view returns (uint256)',
  'function multicall(bytes[] data) returns (bytes[] results)',
  'function numericalTrue() view returns (int256)',
  'function owner() view returns (address)',
  'function renounceOwnership()',
  'function setAdminProperties(address _defaultCurrency, uint64 _defaultLiveness, uint256 _burnedBondPercentage)',
  'function settleAndGetAssertionResult(bytes32 assertionId) returns (bool)',
  'function settleAssertion(bytes32 assertionId)',
  'function stampAssertion(bytes32 assertionId) view returns (bytes)',
  'function syncUmaParams(bytes32 identifier, address currency)',
  'function transferOwnership(address newOwner)'
];

export const UMA_VOTING_ABI = [
  'constructor(uint128 _emissionRate, uint64 _unstakeCoolDown, uint64 _phaseLength, uint32 _maxRolls, uint32 _maxRequestsPerRound, uint128 _gat, uint64 _spat, address _votingToken, address _finder, address _slashingLibrary, address _previousVotingContract)',
  'event DelegateSet(address indexed delegator, address indexed delegate)',
  'event DelegatorSet(address indexed delegate, address indexed delegator)',
  'event EncryptedVote(address indexed caller, uint32 indexed roundId, bytes32 indexed identifier, uint256 time, bytes ancillaryData, bytes encryptedVote)',
  'event ExecutedUnstake(address indexed voter, uint128 tokensSent, uint128 voterStake)',
  'event GatAndSpatChanged(uint128 newGat, uint64 newSpat)',
  'event MaxRequestsPerRoundChanged(uint32 newMaxRequestsPerRound)',
  'event MaxRollsChanged(uint32 newMaxRolls)',
  'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
  'event RequestAdded(address indexed requester, uint32 indexed roundId, bytes32 indexed identifier, uint256 time, bytes ancillaryData, bool isGovernance)',
  'event RequestDeleted(bytes32 indexed identifier, uint256 indexed time, bytes ancillaryData, uint32 rollCount)',
  'event RequestResolved(uint32 indexed roundId, uint256 indexed resolvedPriceRequestIndex, bytes32 indexed identifier, uint256 time, bytes ancillaryData, int256 price)',
  'event RequestRolled(bytes32 indexed identifier, uint256 indexed time, bytes ancillaryData, uint32 rollCount)',
  'event RequestedUnstake(address indexed voter, uint128 amount, uint64 unstakeTime, uint128 voterStake)',
  'event SetNewEmissionRate(uint128 newEmissionRate)',
  'event SetNewUnstakeCoolDown(uint64 newUnstakeCoolDown)',
  'event SlashingLibraryChanged(address newAddress)',
  'event Staked(address indexed voter, address indexed from, uint128 amount, uint128 voterStake, uint128 voterPendingUnstake, uint128 cumulativeStake)',
  'event UpdatedReward(address indexed voter, uint128 newReward, uint64 lastUpdateTime)',
  'event VoteCommitted(address indexed voter, address indexed caller, uint32 roundId, bytes32 indexed identifier, uint256 time, bytes ancillaryData)',
  'event VoteRevealed(address indexed voter, address indexed caller, uint32 roundId, bytes32 indexed identifier, uint256 time, bytes ancillaryData, int256 price, uint128 numTokens)',
  'event VoterSlashApplied(address indexed voter, int128 slashedTokens, uint128 postStake)',
  'event VoterSlashed(address indexed voter, uint256 indexed requestIndex, int128 slashedTokens)',
  'event VotingContractMigrated(address newAddress)',
  'event WithdrawnRewards(address indexed voter, address indexed delegate, uint128 tokensWithdrawn)',
  'function ANCILLARY_BYTES_LIMIT() view returns (uint256)',
  'function UINT64_MAX() view returns (uint64)',
  'function commitAndEmitEncryptedVote(bytes32 identifier, uint256 time, bytes ancillaryData, bytes32 hash, bytes encryptedVote)',
  'function commitVote(bytes32 identifier, uint256 time, bytes ancillaryData, bytes32 hash)',
  'function cumulativeStake() view returns (uint128)',
  'function currentActiveRequests() view returns (bool)',
  'function delegateToStaker(address) view returns (address)',
  'function emissionRate() view returns (uint128)',
  'function executeUnstake()',
  'function finder() view returns (address)',
  'function gat() view returns (uint128)',
  'function getCurrentRoundId() view returns (uint32)',
  'function getCurrentTime() view returns (uint256)',
  'function getNumberOfPriceRequests() view returns (uint256 numberPendingPriceRequests, uint256 numberResolvedPriceRequests)',
  'function getNumberOfPriceRequestsPostUpdate() returns (uint256 numberPendingPriceRequests, uint256 numberResolvedPriceRequests)',
  'function getPendingRequests() view returns (tuple(uint32 lastVotingRound, bool isGovernance, uint64 time, uint32 rollCount, bytes32 identifier, bytes ancillaryData)[])',
  'function getPrice(bytes32 identifier, uint256 time, bytes ancillaryData) view returns (int256)',
  'function getPrice(bytes32 identifier, uint256 time) view returns (int256)',
  'function getPriceRequestStatuses(tuple(bytes32 identifier, uint256 time, bytes ancillaryData)[] requests) view returns (tuple(uint8 status, uint32 lastVotingRound)[])',
  'function getRoundEndTime(uint256 roundId) view returns (uint256)',
  'function getRoundIdToVoteOnRequest(uint32 targetRoundId) view returns (uint32)',
  'function getVotePhase() view returns (uint8)',
  'function getVoterFromDelegate(address caller) view returns (address)',
  'function getVoterParticipation(uint256 requestIndex, uint32 lastVotingRound, address voter) view returns (uint8)',
  'function getVoterPendingStake(address voter, uint32 roundId) view returns (uint128)',
  'function getVoterStakePostUpdate(address voter) returns (uint128)',
  'function hasPrice(bytes32 identifier, uint256 time) view returns (bool)',
  'function hasPrice(bytes32 identifier, uint256 time, bytes ancillaryData) view returns (bool)',
  'function lastRoundIdProcessed() view returns (uint32)',
  'function lastUpdateTime() view returns (uint64)',
  'function maxRequestsPerRound() view returns (uint32)',
  'function maxRolls() view returns (uint32)',
  'function migratedAddress() view returns (address)',
  'function multicall(bytes[] data) returns (bytes[] results)',
  'function nextPendingIndexToProcess() view returns (uint64)',
  'function outstandingRewards(address voter) view returns (uint256)',
  'function owner() view returns (address)',
  'function pendingPriceRequestsIds(uint256) view returns (bytes32)',
  'function previousVotingContract() view returns (address)',
  'function priceRequests(bytes32) view returns (uint32 lastVotingRound, bool isGovernance, uint64 time, uint32 rollCount, bytes32 identifier, bytes ancillaryData)',
  'function processResolvablePriceRequests()',
  'function processResolvablePriceRequestsRange(uint64 maxTraversals)',
  'function renounceOwnership()',
  'function requestGovernanceAction(bytes32 identifier, uint256 time, bytes ancillaryData)',
  'function requestPrice(bytes32 identifier, uint256 time, bytes ancillaryData)',
  'function requestPrice(bytes32 identifier, uint256 time)',
  'function requestSlashingTrackers(uint256 requestIndex) view returns (tuple(uint256 wrongVoteSlashPerToken, uint256 noVoteSlashPerToken, uint256 totalSlashed, uint256 totalCorrectVotes, uint32 lastVotingRound))',
  'function requestUnstake(uint128 amount)',
  'function resolvedPriceRequestIds(uint256) view returns (bytes32)',
  'function retrieveRewardsOnMigratedVotingContract(address voter, uint256 roundId, tuple(bytes32 identifier, uint256 time, bytes ancillaryData)[] toRetrieve) returns (uint256)',
  'function revealVote(bytes32 identifier, uint256 time, int256 price, bytes ancillaryData, int256 salt)',
  'function rewardPerToken() view returns (uint256)',
  'function rewardPerTokenStored() view returns (uint128)',
  'function rounds(uint256) view returns (address slashingLibrary, uint128 minParticipationRequirement, uint128 minAgreementRequirement, uint128 cumulativeStakeAtRound, uint32 numberOfRequestsToVote)',
  'function setDelegate(address delegate)',
  'function setDelegator(address delegator)',
  'function setEmissionRate(uint128 newEmissionRate)',
  'function setGatAndSpat(uint128 newGat, uint64 newSpat)',
  'function setMaxRequestPerRound(uint32 newMaxRequestsPerRound)',
  'function setMaxRolls(uint32 newMaxRolls)',
  'function setMigrated(address newVotingAddress)',
  'function setSlashingLibrary(address _newSlashingLibrary)',
  'function setUnstakeCoolDown(uint64 newUnstakeCoolDown)',
  'function slashingLibrary() view returns (address)',
  'function spat() view returns (uint64)',
  'function stake(uint128 amount)',
  'function stakeTo(address recipient, uint128 amount)',
  'function transferOwnership(address newOwner)',
  'function unstakeCoolDown() view returns (uint64)',
  'function updateTrackers(address voter)',
  'function updateTrackersRange(address voter, uint64 maxTraversals)',
  'function voteTiming() view returns (uint256 phaseLength)',
  'function voterStakes(address) view returns (uint128 stake, uint128 pendingUnstake, uint128 rewardsPaidPerToken, uint128 outstandingRewards, int128 unappliedSlash, uint64 nextIndexToProcess, uint64 unstakeTime, address delegate)',
  'function votingToken() view returns (address)',
  'function withdrawAndRestake() returns (uint128)',
  'function withdrawRewards() returns (uint128)'
];

export const UMA_FINDER_ABI = [
  'event InterfaceImplementationChanged(bytes32 indexed interfaceName, address indexed newImplementationAddress)',
  'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
  'function changeImplementationAddress(bytes32 interfaceName, address implementationAddress)',
  'function getImplementationAddress(bytes32 interfaceName) view returns (address)',
  'function interfacesImplemented(bytes32) view returns (address)',
  'function owner() view returns (address)',
  'function renounceOwnership()',
  'function transferOwnership(address newOwner)'
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

export const MULTI_SEND_ABI = [
  'function multiSend(bytes transactions) payable'
];

// MULTI SEND CONSTANTS

export const MULTI_SEND_V1_3_0 = {
  '1': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '3': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '10': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '28': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '42': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '5': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '56': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '69': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '100': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '122': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '123': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '137': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '246': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '288': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '588': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '1088': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '1285': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '1287': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '4002': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '42161': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '42220': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '43114': '0x998739BFdAAdde7C933B942a68053933098f9EDa',
  '73799': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '80001': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '333999': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '1313161554': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761',
  '1313161555': '0xA238CBeb142c10Ef7Ad8442C6D1f9E89e07e7761'
};
export const MULTI_SEND_V1_2_0 = {
  '1': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '42': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '5': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '88': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '100': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '246': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185',
  '73799': '0x6851D6fDFAfD08c0295C392436245E5bc78B0185'
};
export const MULTI_SEND_V1_1_1 = {
  '1': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '5': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '42': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '88': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '100': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '246': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD',
  '73799': '0x8D29bE29923b68abfDD21e541b9374737B49cdAD'
};
export const MULTI_SEND_VERSIONS: Record<
  MULTI_SEND_VERSION,
  Record<string, string>
> = {
  [MULTI_SEND_VERSION.V1_1_1]: MULTI_SEND_V1_1_1,
  [MULTI_SEND_VERSION.V1_2_0]: MULTI_SEND_V1_2_0,
  [MULTI_SEND_VERSION.V1_3_0]: MULTI_SEND_V1_3_0
};

// to potentially cut down on event ranges we query, hard code some deploy blocks for contracts
export type ContractData = {
  network: string;
  name: string;
  address?: string;
  deployBlockNumber?: number;
  subgraph?: string;
};
// contract addresses pulled from https://github.com/UMAprotocol/protocol/tree/master/packages/core/networks
export const contractData: ContractData[] = [
  {
    // mainnet
    network: '1',
    name: 'OptimisticOracleV3',
    address: '0xfb55F43fB9F48F63f9269DB7Dde3BbBe1ebDC0dE',
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/mainnet-optimistic-oracle-v3',
    deployBlock: 16636058
  },
  {
    // goerli
    network: '5',
    name: 'OptimisticOracleV3',
    address: '0x9923D42eF695B5dd9911D05Ac944d4cAca3c4EAB',
    subgraph:
      'https://api.thegraph.com/subgraphs/name/md0x/goerli-optimistic-oracle-v3',
    deployBlock: 8497481
  },
  {
    // optimism
    network: '10',
    name: 'OptimisticOracleV3',
    address: '0x072819Bb43B50E7A251c64411e7aA362ce82803B',
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/optimism-optimistic-oracle-v3'
  },
  {
    // gnosis
    network: '100',
    name: 'OptimisticOracleV3',
    address: '0x22A9AaAC9c3184f68C7B7C95b1300C4B1D2fB95C',
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/gnosis-optimistic-oracle-v3'
  },
  {
    // polygon
    network: '137',
    name: 'OptimisticOracleV3',
    address: '0x5953f2538F613E05bAED8A5AeFa8e6622467AD3D',
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/polygon-optimistic-oracle-v3'
  },
  {
    //arbitrum
    network: '42161',
    name: 'OptimisticOracleV3',
    address: '0xa6147867264374F324524E30C02C331cF28aa879',
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/arbitrum-optimistic-oracle-v3'
  },
  {
    // avalanche
    network: '43114',
    name: 'OptimisticOracleV3',
    address: '0xa4199d73ae206d49c966cF16c58436851f87d47F',
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/avalanche-optimistic-oracle-v3'
  },
  {
    // mainnet
    network: '1',
    name: 'OptimisticGovernor',
    address: '0x28CeBFE94a03DbCA9d17143e9d2Bd1155DC26D5d',
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/mainnet-optimistic-governor',
    deployBlock: 16890621
  },
  // Keep in mind, OG addresses are not the module addresses for each individual space, these addresses typically
  // are not used, but are here for reference.
  {
    //goerli
    network: '5',
    name: 'OptimisticGovernor',
    address: '0x07a7Be7AA4AaD42696A17e974486cb64A4daC47b',
    deployBlock: 8700589,
    subgraph:
      'https://api.thegraph.com/subgraphs/name/md0x/goerli-optimistic-governor'
  },
  {
    // optimism
    network: '10',
    name: 'OptimisticGovernor',
    address: '0x357fe84E438B3150d2F68AB9167bdb8f881f3b9A',
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/optimism-optimistic-governor'
  },
  {
    // gnosis
    network: '100',
    name: 'OptimisticGovernor',
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/gnosis-optimistic-governor'
  },
  {
    // polygon
    network: '137',
    name: 'OptimisticGovernor',
    address: '0x3Cc4b597E9c3f51288c6Cd0c087DC14c3FfdD966',
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/polygon-optimistic-governor'
  },
  {
    // arbitrum
    network: '42161',
    name: 'OptimisticGovernor',
    address: '0x30679ca4ea452d3df8a6c255a806e08810321763',
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/arbitrum-optimistic-governor'
  },
  {
    // avalanche
    network: '43114',
    name: 'OptimisticGovernor',
    address: '0xEF8b46765ae805537053C59f826C3aD61924Db45',
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/avalanche-optimistic-governor'
  }
];
