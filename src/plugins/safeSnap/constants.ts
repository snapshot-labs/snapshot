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
  '100': 'https://blockscout.com/xdai/mainnet/api',
  '73799': 'https://volta-explorer.energyweb.org/api',
  '246': 'https://explorer.energyweb.org/api',
  '137': 'https://api.polygonscan.com/api',
  '56': 'https://api.bscscan.com/api',
  '42161': 'https://api.arbiscan.io/api'
};

export const GNOSIS_SAFE_TRANSACTION_API_URLS = {
  '1': 'https://safe-transaction-mainnet.safe.global/api/v1',
  '5': 'https://safe-transaction-goerli.safe.global/api/v1',
  '100': 'https://safe-transaction-gnosis-chain.safe.global/api/v1',
  '73799': 'https://safe-transaction-volta.safe.global/api/v1',
  '246': 'https://safe-transaction-ewc.safe.global//api/v1',
  '137': 'https://safe-transaction-polygon.safe.global//api/v1',
  '56': 'https://safe-transaction-bsc.safe.global//api/v1',
  '42161': 'https://safe-transaction-arbitrum.safe.global/api/v1'
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
  'event AvatarSet(address indexed previousAvatar, address indexed newAvatar)',
  'event ChangedGuard(address guard)',
  'event OptimisticGovernorDeployed(address indexed owner, address indexed avatar, address target)',
  'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
  'event ProposalDeleted(bytes32 indexed proposalHash, address indexed sender, bytes32 indexed status)',
  'event SetBond(address indexed collateral, uint256 indexed bondAmount)',
  'event SetCollateral(address indexed collateral)',
  'event SetIdentifier(bytes32 indexed identifier)',
  'event SetLiveness(uint64 indexed liveness)',
  'event SetRules(string indexed rules)',
  'event TargetSet(address indexed previousTarget, address indexed newTarget)',
  'event TransactionExecuted(bytes32 indexed proposalHash, uint256 indexed transactionIndex)',
  'event ProposalExecuted(bytes32 indexed proposalHash, uint256 indexed proposalTime)',
  'event TransactionsProposed(address indexed proposer, uint256 indexed proposalTime, tuple(tuple(address to, uint8 operation, uint256 value, bytes data)[] transactions, uint256 requestTime) proposal, bytes32 proposalHash, bytes explanation, uint256 challengeWindowEnds)',
  'function PROPOSAL_HASH_KEY() view returns (bytes)',
  'function PROPOSAL_VALID_RESPONSE() view returns (int256)',
  'function avatar() view returns (address)',
  'function bondAmount() view returns (uint256)',
  'function collateral() view returns (address)',
  'function deleteDisputedProposal(bytes32 _proposalHash)',
  'function deleteProposal(bytes32 _proposalHash)',
  'function deleteRejectedProposal(bytes32 _proposalHash)',
  'function executeProposal(tuple(address to, uint8 operation, uint256 value, bytes data)[] _transactions) payable',
  'function finder() view returns (address)',
  'function getCurrentTime() view returns (uint256)',
  'function getGuard() view returns (address _guard)',
  'function guard() view returns (address)',
  'function identifier() view returns (bytes32)',
  'function liveness() view returns (uint64)',
  'function optimisticOracle() view returns (address)',
  'function owner() view returns (address)',
  'function proposalHashes(bytes32) view returns (uint256)',
  'function proposeTransactions(tuple(address to, uint8 operation, uint256 value, bytes data)[] _transactions, bytes _explanation)',
  'function renounceOwnership()',
  'function rules() view returns (string)',
  'function setAvatar(address _avatar)',
  'function setCollateralAndBond(address _collateral, uint256 _bondAmount)',
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
  'constructor(uint256 _liveness, address _finderAddress, address _timerAddress)',
  'event DisputePrice(address indexed requester, address indexed proposer, address indexed disputer, bytes32 identifier, uint256 timestamp, bytes ancillaryData, int256 proposedPrice)',
  'event ProposePrice(address indexed requester, address indexed proposer, bytes32 identifier, uint256 timestamp, bytes ancillaryData, int256 proposedPrice, uint256 expirationTimestamp, address currency)',
  'event RequestPrice(address indexed requester, bytes32 identifier, uint256 timestamp, bytes ancillaryData, address currency, uint256 reward, uint256 finalFee)',
  'event Settle(address indexed requester, address indexed proposer, address indexed disputer, bytes32 identifier, uint256 timestamp, bytes ancillaryData, int256 price, uint256 payout)',
  'function ancillaryBytesLimit() view returns (uint256)',
  'function defaultLiveness() view returns (uint256)',
  'function disputePrice(address requester, bytes32 identifier, uint256 timestamp, bytes ancillaryData) returns (uint256 totalBond)',
  'function disputePriceFor(address disputer, address requester, bytes32 identifier, uint256 timestamp, bytes ancillaryData) returns (uint256 totalBond)',
  'function finder() view returns (address)',
  'function getCurrentTime() view returns (uint256)',
  'function getRequest(address requester, bytes32 identifier, uint256 timestamp, bytes ancillaryData) view returns (tuple(address proposer, address disputer, address currency, bool settled, bool refundOnDispute, int256 proposedPrice, int256 resolvedPrice, uint256 expirationTime, uint256 reward, uint256 finalFee, uint256 bond, uint256 customLiveness))',
  'function getState(address requester, bytes32 identifier, uint256 timestamp, bytes ancillaryData) view returns (uint8)',
  'function hasPrice(address requester, bytes32 identifier, uint256 timestamp, bytes ancillaryData) view returns (bool)',
  'function proposePrice(address requester, bytes32 identifier, uint256 timestamp, bytes ancillaryData, int256 proposedPrice) returns (uint256 totalBond)',
  'function proposePriceFor(address proposer, address requester, bytes32 identifier, uint256 timestamp, bytes ancillaryData, int256 proposedPrice) returns (uint256 totalBond)',
  'function requestPrice(bytes32 identifier, uint256 timestamp, bytes ancillaryData, address currency, uint256 reward) returns (uint256 totalBond)',
  'function requests(bytes32) view returns (address proposer, address disputer, address currency, bool settled, bool refundOnDispute, int256 proposedPrice, int256 resolvedPrice, uint256 expirationTime, uint256 reward, uint256 finalFee, uint256 bond, uint256 customLiveness)',
  'function setBond(bytes32 identifier, uint256 timestamp, bytes ancillaryData, uint256 bond) returns (uint256 totalBond)',
  'function setCurrentTime(uint256 time)',
  'function setCustomLiveness(bytes32 identifier, uint256 timestamp, bytes ancillaryData, uint256 customLiveness)',
  'function setRefundOnDispute(bytes32 identifier, uint256 timestamp, bytes ancillaryData)',
  'function settle(address requester, bytes32 identifier, uint256 timestamp, bytes ancillaryData) returns (uint256 payout)',
  'function settleAndGetPrice(bytes32 identifier, uint256 timestamp, bytes ancillaryData) returns (int256)',
  'function stampAncillaryData(bytes ancillaryData, address requester) pure returns (bytes)',
  'function timerAddress() view returns (address)'
];

export const UMA_VOTING_ABI = [
  'constructor(uint256 _emissionRate, uint256 _spamDeletionProposalBond, uint64 _unstakeCoolDown, uint64 _phaseLength, uint64 _minRollToNextRoundLength, uint256 _gat, uint64 _startingRequestIndex, address _votingToken, address _finder, address _slashingLibrary, address _previousVotingContract)',
  'event DelegateSet(address indexed delegator, address indexed delegate)',
  'event DelegatorSet(address indexed delegate, address indexed delegator)',
  'event EncryptedVote(address indexed caller, uint256 indexed roundId, bytes32 indexed identifier, uint256 time, bytes ancillaryData, bytes encryptedVote)',
  'event ExecutedSpamDeletion(uint256 indexed proposalId, bool indexed executed)',
  'event ExecutedUnstake(address indexed voter, uint256 tokensSent, uint256 voterStake)',
  'event GatChanged(uint256 newGat)',
  'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
  'event PriceRequestAdded(address indexed requester, uint256 indexed roundId, uint256 priceRequestIndex, bytes32 indexed identifier, uint256 time, bytes ancillaryData, bool isGovernance)',
  'event PriceResolved(uint256 indexed roundId, uint256 priceRequestIndex, bytes32 indexed identifier, uint256 time, bytes ancillaryData, int256 price)',
  'event RequestedUnstake(address indexed voter, uint256 amount, uint256 unstakeTime, uint256 voterStake)',
  'event SetNewEmissionRate(uint256 newEmissionRate)',
  'event SetNewUnstakeCoolDown(uint256 newUnstakeCoolDown)',
  'event SignaledRequestsAsSpamForDeletion(uint256 indexed proposalId, address indexed sender, uint256[2][] spamRequestIndices)',
  'event SlashingLibraryChanged(address newAddress)',
  'event SpamDeletionProposalBondChanged(uint256 newBond)',
  'event Staked(address indexed voter, address indexed from, uint256 amount, uint256 voterStake, uint256 voterPendingUnstake, uint256 cumulativeStake)',
  'event UpdatedReward(address indexed voter, uint256 newReward, uint256 lastUpdateTime)',
  'event VoteCommitted(address indexed voter, address indexed caller, uint256 roundId, uint256 priceRequestIndex, bytes32 indexed identifier, uint256 time, bytes ancillaryData)',
  'event VoteRevealed(address indexed voter, address indexed caller, uint256 roundId, uint256 priceRequestIndex, bytes32 indexed identifier, uint256 time, bytes ancillaryData, int256 price, uint256 numTokens)',
  'event VoterSlashed(address indexed voter, int256 slashedTokens, uint256 postActiveStake)',
  'event VotingContractMigrated(address newAddress)',
  'event WithdrawnRewards(address indexed voter, address indexed delegate, uint256 tokensWithdrawn)',
  'function ANCILLARY_BYTES_LIMIT() view returns (uint256)',
  'function commitAndEmitEncryptedVote(bytes32 identifier, uint256 time, bytes ancillaryData, bytes32 hash, bytes encryptedVote)',
  'function commitVote(bytes32 identifier, uint256 time, bytes ancillaryData, bytes32 hash)',
  'function cumulativeStake() view returns (uint256)',
  'function currentActiveRequests() view returns (bool)',
  'function delegateToStaker(address) view returns (address)',
  'function emissionRate() view returns (uint256)',
  'function executeSpamDeletion(uint256 proposalId)',
  'function executeUnstake()',
  'function gat() view returns (uint256)',
  'function getCurrentRoundId() view returns (uint256)',
  'function getCurrentTime() view returns (uint256)',
  'function getNumberOfPriceRequests() view returns (uint256)',
  'function getPendingRequests() view returns (tuple(bytes32 identifier, uint256 time, bytes ancillaryData, uint64 priceRequestIndex)[])',
  'function getPrice(bytes32 identifier, uint256 time, bytes ancillaryData) view returns (int256)',
  'function getPrice(bytes32 identifier, uint256 time) view returns (int256)',
  'function getPriceRequestStatuses(tuple(bytes32 identifier, uint256 time, bytes ancillaryData)[] requests) view returns (tuple(uint8 status, uint256 lastVotingRound)[])',
  'function getRoundEndTime(uint256 roundId) view returns (uint256)',
  'function getSpamDeletionRequest(uint256 spamDeletionRequestId) view returns (tuple(uint256[2][] spamRequestIndices, uint256 requestTime, bool executed, address proposer, uint256 bond))',
  'function getVotePhase() view returns (uint8)',
  'function getVoterFromDelegate(address caller) view returns (address)',
  'function getVoterPendingStake(address voterAddress, uint256 roundId) view returns (uint256)',
  'function getVoterStakePostUpdate(address voterAddress) returns (uint256)',
  'function hasPrice(bytes32 identifier, uint256 time) view returns (bool)',
  'function hasPrice(bytes32 identifier, uint256 time, bytes ancillaryData) view returns (bool)',
  'function lastUpdateTime() view returns (uint64)',
  'function migratedAddress() view returns (address)',
  'function multicall(bytes[] data) payable returns (bytes[] results)',
  'function outstandingRewards(address voterAddress) view returns (uint256)',
  'function owner() view returns (address)',
  'function pendingPriceRequests(uint256) view returns (bytes32)',
  'function previousVotingContract() view returns (address)',
  'function priceRequestIds(uint256) view returns (bytes32)',
  'function priceRequests(bytes32) view returns (uint32 lastVotingRound, bool isGovernance, uint64 pendingRequestIndex, uint64 priceRequestIndex, uint64 time, bytes32 identifier, bytes ancillaryData)',
  'function renounceOwnership()',
  'function requestGovernanceAction(bytes32 identifier, uint256 time, bytes ancillaryData)',
  'function requestPrice(bytes32 identifier, uint256 time, bytes ancillaryData)',
  'function requestPrice(bytes32 identifier, uint256 time)',
  'function requestSlashingTrackers(uint256 requestIndex) view returns (tuple(uint256 wrongVoteSlashPerToken, uint256 noVoteSlashPerToken, uint256 totalSlashed, uint256 totalCorrectVotes))',
  'function requestUnstake(uint256 amount)',
  'function retrieveRewardsOnMigratedVotingContract(address voterAddress, uint256 roundId, tuple(bytes32 identifier, uint256 time, bytes ancillaryData)[] toRetrieve) returns (uint256)',
  'function revealVote(bytes32 identifier, uint256 time, int256 price, bytes ancillaryData, int256 salt)',
  'function rewardPerToken() view returns (uint256)',
  'function rewardPerTokenStored() view returns (uint256)',
  'function rounds(uint256) view returns (uint256 gat, uint256 cumulativeActiveStakeAtRound)',
  'function setDelegate(address delegate)',
  'function setDelegator(address delegator)',
  'function setEmissionRate(uint256 newEmissionRate)',
  'function setGat(uint256 newGat)',
  'function setMigrated(address newVotingAddress)',
  'function setRewardsExpirationTimeout(uint256 NewRewardsExpirationTimeout)',
  'function setSlashingLibrary(address _newSlashingLibrary)',
  'function setSpamDeletionProposalBond(uint256 _spamDeletionProposalBond)',
  'function setUnstakeCoolDown(uint64 newUnstakeCoolDown)',
  'function signalRequestsAsSpamForDeletion(uint256[2][] spamRequestIndices)',
  'function skippedRequestIndexes(uint64) view returns (uint64)',
  'function slashingLibrary() view returns (address)',
  'function spamDeletionProposalBond() view returns (uint256)',
  'function stake(uint256 amount)',
  'function stakeTo(address recipient, uint256 amount)',
  'function transferOwnership(address newOwner)',
  'function unstakeCoolDown() view returns (uint64)',
  'function updateTrackers(address voterAddress)',
  'function updateTrackersRange(address voterAddress, uint256 indexTo)',
  'function voteTiming() view returns (uint256 phaseLength, uint256 minRollToNextRoundLength)',
  'function voterStakes(address) view returns (uint256 stake, uint256 pendingUnstake, uint256 rewardsPaidPerToken, uint256 outstandingRewards, int256 unappliedSlash, uint64 nextIndexToProcess, uint64 unstakeRequestTime, address delegate)',
  'function votingToken() view returns (address)',
  'function withdrawAndRestake() returns (uint256)',
  'function withdrawRewards() returns (uint256)'
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
