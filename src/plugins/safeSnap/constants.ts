import { SafeAsset, TokenAsset } from '@/helpers/interfaces';
import { MULTI_SEND_VERSION } from './utils/multiSend';

export enum Network {
  //Mainnet
  Mainnet = '1',
  BSC = '56',
  GnosisChain = '100',
  Polygon = '137',
  EWC = '246',
  Arbitrum = '42161',
  Volta = '73799',
  Optimism = '10',
  //Testnet
  Goerli = '5',
  OptimismGoerli = '420',
  Mumbai = '80001',
  ArbitrumGoerli = '421613',
  zkSyncEraTestnet = '280',
  LineaTestnet = '59140',
  PolygonZkEVMTestnet = '1442'
}

export const EIP712_TYPES = {
  Transaction: [
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
    { name: 'operation', type: 'uint8' },
    { name: 'nonce', type: 'uint256' }
  ]
};

export const EIP3770_PREFIXES: Partial<Record<Network, string>> = {
  [Network.Mainnet]: 'eth',
  [Network.Goerli]: 'gor',
  [Network.BSC]: 'bnb',
  [Network.GnosisChain]: 'gno',
  [Network.EWC]: 'ewt',
  [Network.Volta]: 'vt',
  [Network.Arbitrum]: 'arb1',
  [Network.Polygon]: 'matic'
};

export const EXPLORER_API_URLS: Partial<Record<Network, string>> = {
  [Network.Mainnet]: 'https://api.etherscan.io/api',
  [Network.Goerli]: 'https://api-goerli.etherscan.io/api',
  [Network.GnosisChain]: 'https://gnosis.blockscout.com/api',
  [Network.Volta]: 'https://volta-explorer.energyweb.org/api',
  [Network.EWC]: 'https://explorer.energyweb.org/api',
  [Network.Polygon]: 'https://api.polygonscan.com/api',
  [Network.BSC]: 'https://api.bscscan.com/api',
  [Network.Arbitrum]: 'https://api.arbiscan.io/api'
};

export const GNOSIS_SAFE_TRANSACTION_API_URLS: Partial<
  Record<Network, string>
> = {
  [Network.Mainnet]: 'https://safe-transaction-mainnet.safe.global/api',
  [Network.Goerli]: 'https://safe-transaction-goerli.safe.global/api',
  [Network.GnosisChain]:
    'https://safe-transaction-gnosis-chain.safe.global/api',
  [Network.Volta]: 'https://safe-transaction-volta.safe.global/api',
  [Network.EWC]: 'https://safe-transaction-ewc.safe.global/api',
  [Network.Polygon]: 'https://safe-transaction-polygon.safe.global/api',
  [Network.BSC]: 'https://safe-transaction-bsc.safe.global/api',
  [Network.Arbitrum]: 'https://safe-transaction-arbitrum.safe.global/api'
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

export const TOKEN_ABI = [
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function'
  }
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

export const CONNEXT_MODULE_ABI = [
  'event AvatarSet(address indexed previousAvatar, address indexed newAvatar)',
  'event ChangedGuard(address guard)',
  'event ConnextSet(address connext)',
  'event Initialized(uint8 version)',
  'event ModuleSetUp(address owner, address avatar, address target, address originSender, uint32 origin, address connext)',
  'event OriginSenderSet(address originSender)',
  'event OriginSet(uint32 origin)',
  'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
  'event TargetSet(address indexed previousTarget, address indexed newTarget)',
  'function avatar() view returns (address)',
  'function connext() view returns (address)',
  'function getGuard() view returns (address)',
  'function guard() view returns (address)',
  'function origin() view returns (uint32)',
  'function originSender() view returns (address)',
  'function owner() view returns (address)',
  'function renounceOwnership()',
  'function setAvatar(address _avatar)',
  'function setConnext(address _connext)',
  'function setGuard(address _guard)',
  'function setOrigin(uint32 _origin)',
  'function setOriginSender(address _originSender)',
  'function setTarget(address _target)',
  'function setUp(bytes initializeParams)',
  'function target() view returns (address)',
  'function transferOwnership(address newOwner)',
  'function xReceive(bytes32, uint256 _amount, address _asset, address _originSender, uint32 _origin, bytes _callData) returns (bytes)'
];

export const CONNEXT_BRIDGE_FACET = [
  // xcall functions
  'function xcall(uint32 _destination, address _to, address _asset, address _delegate, uint256 _amount, uint256 _slippage, bytes _callData) payable returns (bytes32)'
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
      'https://api.thegraph.com/subgraphs/name/umaprotocol/optimism-optimistic-oracle-v3',
    deployBlock: 74537234
  },
  {
    // gnosis
    network: '100',
    name: 'OptimisticOracleV3',
    address: '0x22A9AaAC9c3184f68C7B7C95b1300C4B1D2fB95C',
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/gnosis-optimistic-oracle-v3',
    deployBlock: 27087150
  },
  {
    // polygon
    network: '137',
    name: 'OptimisticOracleV3',
    address: '0x5953f2538F613E05bAED8A5AeFa8e6622467AD3D',
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/polygon-optimistic-oracle-v3',
    deployBlock: 39331673
  },
  {
    //arbitrum
    network: '42161',
    name: 'OptimisticOracleV3',
    address: '0xa6147867264374F324524E30C02C331cF28aa879',
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/arbitrum-optimistic-oracle-v3',
    deployBlock: 61236565
  },
  {
    // avalanche
    network: '43114',
    name: 'OptimisticOracleV3',
    address: '0xa4199d73ae206d49c966cF16c58436851f87d47F',
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/avalanche-optimistic-oracle-v3',
    deployBlock: 27816737
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
    deployBlock: 83168480,
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/optimism-optimistic-governor'
  },
  {
    // gnosis
    network: '100',
    name: 'OptimisticGovernor',
    deployBlock: 27102135,
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/gnosis-optimistic-governor'
  },
  {
    // polygon
    network: '137',
    name: 'OptimisticGovernor',
    address: '0x3Cc4b597E9c3f51288c6Cd0c087DC14c3FfdD966',
    deployBlock: 40677035,
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/polygon-optimistic-governor'
  },
  {
    // arbitrum
    network: '42161',
    name: 'OptimisticGovernor',
    address: '0x30679ca4ea452d3df8a6c255a806e08810321763',
    deployBlock: 72850751,
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/arbitrum-optimistic-governor'
  },
  {
    // avalanche
    network: '43114',
    name: 'OptimisticGovernor',
    address: '0xEF8b46765ae805537053C59f826C3aD61924Db45',
    deployBlock: 28050250,
    subgraph:
      'https://api.thegraph.com/subgraphs/name/umaprotocol/avalanche-optimistic-governor'
  }
];

interface ChainData {
  [key: string]: {
    safeIdentifier?: string | undefined;
    name: string;
    id: number;
    domainId: number;
    connextContract: string;
    ZCMFactory: string;
    safeMasterCopy: string;
    multicallAddress: string;
    assets: {
      [key: string]: string;
    };
    publicRpcProvider: string;
  };
}

interface Constants {
  SETUP_SAFE_GAS_LIMIT: number;
  MAINNET_CHAINS: string[];
  TESTNETS_CHAINS: string[];
  relayerFeeBoost: number;
  Chains: ChainData;
  AVAILABLE_ORIGIN_NETWORKS: string[];
  AVAILABLE_DESTINY_NETWORKS: string[];
  tokensDecimals: { [key: string]: number };
  TESTNET_AVAILABLE_ORIGIN_NETWORKS: string[];
  TESTNET_AVAILABLE_DESTINY_NETWORKS: string[];
}

interface AssetDetails {
  [key: string]: string;
}

export const getConstants = (): Constants => {
  return {
    SETUP_SAFE_GAS_LIMIT: 2400000,

    relayerFeeBoost: 150, // 1.5x

    MAINNET_CHAINS: ['1', '137', '10', '42161', '56', '100'],
    TESTNETS_CHAINS: ['5', '420', '80001', '421613', '280', '59140'],

    AVAILABLE_ORIGIN_NETWORKS: [
      'ethereum',
      'polygon',
      'optimism',
      'arbitrum',
      'bnbChain',
      'gnosisChain'
    ],
    AVAILABLE_DESTINY_NETWORKS: [
      'ethereum',
      'polygon',
      'optimism',
      'arbitrum',
      'bnbChain',
      'gnosisChain'
    ],

    TESTNET_AVAILABLE_ORIGIN_NETWORKS: [
      'optimismGoerli',
      'mumbai',
      'arbitrumGoerli',
      'zkSyncEraTestnet',
      'lineaTestnet'
    ],
    TESTNET_AVAILABLE_DESTINY_NETWORKS: ['goerli'],

    tokensDecimals: {
      USDC: 6,
      WETH: 18,
      DAI: 18,
      USDT: 6,
      nextUSDC: 6,
      nextWETH: 18,
      nextDAI: 18,
      nextUSDT: 6,
      TEST:18
    },

    // See: https://docs.connext.network/resources/supported-chains#mainnet
    //      https://docs.gelato.network/developer-services/relay/payment-and-fees#gelatos-fees
    Chains: {
      ethereum: {
        name: 'Ethereum',
        id: 1,
        safeIdentifier: 'eth',
        domainId: 6648936,
        connextContract: '0x8898B472C54c31894e3B9bb83cEA802a5d0e63C6',
        ZCMFactory: '0x614F9Ffe9C7EaA5F5BE877F47217Cf77C3D142d3',
        safeMasterCopy: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
        multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
        publicRpcProvider: 'https://eth.llamarpc.com',
        assets: {
          USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
        }
      },
      polygon: {
        name: 'Polygon',
        id: 137,
        domainId: 1886350457,
        safeIdentifier: 'matic',
        connextContract: '0x11984dc4465481512eb5b777E44061C158CF2259',
        ZCMFactory: '0x614F9Ffe9C7EaA5F5BE877F47217Cf77C3D142d3',
        safeMasterCopy: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
        multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
        publicRpcProvider: 'https://polygon.llamarpc.com',
        assets: {
          nextUSDC: '0xF96C6d2537e1af1a9503852eB2A4AF264272a5B6',
          USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
          nextWETH: '0x4b8BaC8Dd1CAA52E32C07755c17eFadeD6A0bbD0',
          WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
          nextDAI: '0xaDCe87b14d570665222C1172D18a221BF7690d5a',
          DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
          nextUSDT: '0xE221C5A2a8348f12dcb2b0e88693522EbAD2690f',
          USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
        }
      },
      optimism: {
        name: 'Optimism',
        id: 10,
        domainId: 1869640809,
        safeIdentifier: 'oeth',
        connextContract: '0x8f7492DE823025b4CfaAB1D34c58963F2af5DEDA',
        ZCMFactory: '0x614F9Ffe9C7EaA5F5BE877F47217Cf77C3D142d3',
        safeMasterCopy: '0xfb1bffC9d739B8D520DaF37dF666da4C687191EA',
        multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
        publicRpcProvider: 'https://mainnet.optimism.io',
        assets: {
          nextUSDC: '0x67E51f46e8e14D4E4cab9dF48c59ad8F512486DD',
          USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
          nextWETH: '0xbAD5B3c68F855EaEcE68203312Fd88AD3D365e50',
          WETH: '0x4200000000000000000000000000000000000006',
          nextDAI: '0xd64Bd028b560bbFc732eA18f282c64B86F3468e0',
          DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
          nextUSDT: '0x4cBB28FA12264cD8E87C62F4E1d9f5955Ce67D20',
          USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58'
        }
      },
      arbitrum: {
        name: 'Arbitrum One',
        id: 42161,
        domainId: 1634886255,
        safeIdentifier: 'arb1',
        connextContract: '0xEE9deC2712cCE65174B561151701Bf54b99C24C8',
        ZCMFactory: '0x614F9Ffe9C7EaA5F5BE877F47217Cf77C3D142d3',
        safeMasterCopy: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
        multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
        publicRpcProvider: 'https://arb1.arbitrum.io/rpc',
        assets: {
          nextUSDC: '0x8c556cF37faa0eeDAC7aE665f1Bb0FbD4b2eae36',
          USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
          nextWETH: '0x2983bf5c334743Aa6657AD70A55041d720d225dB',
          WETH: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
          nextDAI: '0xfDe99b3B3fbB69553D7DaE105EF34Ba4FE971190',
          DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
          nextUSDT: '0x2fD7E61033b3904c65AA9A9B83DCd344Fa19Ffd2',
          USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9'
        }
      },
      bnbChain: {
        name: 'BNB Chain',
        id: 56,
        domainId: 6450786,
        safeIdentifier: 'bnb',
        connextContract: '0xCd401c10afa37d641d2F594852DA94C700e4F2CE',
        ZCMFactory: '0x614F9Ffe9C7EaA5F5BE877F47217Cf77C3D142d3',
        safeMasterCopy: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
        multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
        publicRpcProvider: 'https://bsc-dataseed1.binance.org',
        assets: {
          nextUSDC: '0x5e7D83dA751F4C9694b13aF351B30aC108f32C38',
          USDC: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
          nextWETH: '0xA9CB51C666D2AF451d87442Be50747B31BB7d805',
          WETH: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
          nextDAI: '0x86a343BCF17D79C475d300eed35F0145F137D0c9',
          DAI: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
          nextUSDT: '0xD609f26B5547d5E31562B29150769Cb7c774B97a',
          USDT: '0x55d398326f99059fF775485246999027B3197955'
        }
      },
      gnosisChain: {
        name: 'Gnosis Chain',
        id: 100,
        safeIdentifier: 'gno',
        domainId: 6778479,
        connextContract: '0x5bB83e95f63217CDa6aE3D181BA580Ef377D2109',
        ZCMFactory: '0x614F9Ffe9C7EaA5F5BE877F47217Cf77C3D142d3',
        safeMasterCopy: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
        multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
        publicRpcProvider: 'https://rpc.gnosischain.com',
        assets: {
          nextUSDC: '0x44CF74238d840a5fEBB0eAa089D05b763B73faB8',
          USDC: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83',
          nextWETH: '0x538E2dDbfDf476D24cCb1477A518A82C9EA81326',
          WETH: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1',
          nextDAI: '0x0e1D5Bcd2Ac5CF2f71841A9667afC1E995CaAf4F',
          DAI: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d',
          nextUSDT: '0xF4d944883D6FddC56d3534986feF82105CaDbfA1',
          USDT: '0x4ECaBa5870353805a9F068101A40E0f32ed605C6'
        }
      },

      //Testnet
      goerli: {
        name: 'Goerli',
        id: 5,
        domainId: 1735353714,
        safeIdentifier: 'gor',
        connextContract: '0xFCa08024A6D4bCc87275b1E4A1E22B71fAD7f649',
        ZCMFactory: '0x614F9Ffe9C7EaA5F5BE877F47217Cf77C3D142d3',
        safeMasterCopy: '0x3E5c63644E683549055b9Be8653de26E0B4CD36E',
        multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
        publicRpcProvider: 'https://ethereum-goerli.publicnode.com',
        assets: {
          TEST: '0x7ea6eA49B0b0Ae9c5db7907d139D9Cd3439862a1',
          WETH: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6'
        }
      },
      optimismGoerli: {
        name: 'Optimism Goerli',
        id: 420,
        domainId: 1735356532,
        connextContract: '0x5Ea1bb242326044699C3d81341c5f535d5Af1504',
        ZCMFactory: '0x0000000000000000000000000000000000000000',
        safeMasterCopy: '0x0000000000000000000000000000000000000000',
        multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
        publicRpcProvider: 'https://goerli.optimism.io',
        assets: {
          TEST: '0x68Db1c8d85C09d546097C65ec7DCBFF4D6497CbF',
          nextWETH: '0x39B061B7e41DE8B721f9aEcEB6b3f17ECB7ba63E',
          WETH: '0x74c6FD7D2Bc6a8F0Ebd7D78321A95471b8C2B806'
        }
      },
      mumbai: {
        name: 'Mumbai',
        id: 80001,
        domainId: 9991,
        connextContract: '0x2334937846Ab2A3FCE747b32587e1A1A2f6EEC5a',
        ZCMFactory: '0x0000000000000000000000000000000000000000',
        safeMasterCopy: '0x0000000000000000000000000000000000000000',
        multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
        publicRpcProvider: 'https://polygon-mumbai-bor.publicnode.com',
        assets: {
          TEST: '0xeDb95D8037f769B72AAab41deeC92903A98C9E16',
          nextWETH: '0x1E5341E4b7ed5D0680d9066aac0396F0b1bD1E69',
          WETH: '0xFD2AB41e083c75085807c4A65C0A14FDD93d55A9'
        }
      },
      arbitrumGoerli: {
        name: 'Arbitrum-Goerli',
        id: 421613,
        domainId: 1734439522,
        connextContract: '0x2075c9E31f973bb53CAE5BAC36a8eeB4B082ADC2',
        ZCMFactory: '0x0000000000000000000000000000000000000000',
        safeMasterCopy: '0x0000000000000000000000000000000000000000',
        multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
        publicRpcProvider: 'https://arbitrum-goerli.publicnode.com',
        assets: {
          TEST: '0xDC805eAaaBd6F68904cA706C221c72F8a8a68F9f',
          WETH: '0x1346786E6A5e07b90184a1Ba58E55444b99DC4A2'
        }
      },
      zkSyncEraTestnet: {
        name: 'zkSync Era Testnet',
        id: 280,
        domainId: 2053862260,
        connextContract: '0xB0694fEcEdd88e5590A563aDb5f194d2dE30F0b6',
        ZCMFactory: '0x0000000000000000000000000000000000000000',
        safeMasterCopy: '0x0000000000000000000000000000000000000000',
        multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
        publicRpcProvider: 'https://testnet.era.zksync.dev',
        assets: {
          TEST: '0x7c1412e456ad60b8ee458c4eb3a9852c3e389353'
        }
      },
      lineaTestnet: {
        name: 'Linea Testnet',
        id: 59140,
        domainId: 1668247156,
        connextContract: '0xfdb6B853C1945Dbffe78A3091BeBB9A928234fA3',
        ZCMFactory: '0x0000000000000000000000000000000000000000',
        safeMasterCopy: '0x0000000000000000000000000000000000000000',
        multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
        publicRpcProvider: 'https://rpc.goerli.linea.build',
        assets: {
          TEST: '0xB706319D37b945727E71ae0d4353699d19112576'
        }
      }
      // polygonZkEvmTestnet: {
      //   name: "Polygon zkEVM Testnet",
      //   id: 1442,
      //   domainId: 1887071092,
      //   connextContract: "0x20b4789065DE09c71848b9A4FcAABB2c10006FA2",
      //   ZCMFactory: "0x0000000000000000000000000000000000000000",
      //   safeMasterCopy: "0x0000000000000000000000000000000000000000",
      //   multicallAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
      //   publicRpcProvider: "https://rpc.public.zkevm-test.net",
      //   assets: {
      //     TEST: "0x5f921E4DE609472632CEFc72a3846eCcfbed4ed8",
      //   },
      // },
    }
  };
};

export const findChainKeyById = (
  chains: ChainData,
  id: number
): string | null => {
  for (const [key, value] of Object.entries(chains)) {
    if (value.id === id) {
      return key;
    }
  }
  return null;
};

export const getAssetsByChainId = (
  chains: ChainData,
  id: number
): AssetDetails | null => {
  for (const chainKey in chains) {
    if (chains[chainKey].id === id) {
      return chains[chainKey].assets;
    }
  }
  return null; // Return null if no matching chain is found
};
