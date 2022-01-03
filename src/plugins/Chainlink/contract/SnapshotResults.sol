// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract SnapshotResults is ChainlinkClient, ConfirmedOwner {
  using Chainlink for Chainlink.Request;
  uint256 constant private ORACLE_PAYMENT = 1 * LINK_DIVISIBILITY / 100;

  mapping (string => bool) public results;
  mapping (bytes32 => string) private requests;

  constructor(address _link) ConfirmedOwner(msg.sender){
    setChainlinkToken(_link);
  }

  function requestResult(address _oracle, string calldata _jobId, string calldata _proposalId)
    public
    onlyOwner
  {
    Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(_jobId), address(this), this.fulfillResult.selector);
    req.add("proposalId", _proposalId);
    bytes32 requestId = sendChainlinkRequestTo(_oracle, req, ORACLE_PAYMENT);
    requests[requestId] = _proposalId;
  }

  function fulfillResult(bytes32 _requestId, bool _result)
    public
    recordChainlinkFulfillment(_requestId)
  {
    results[requests[_requestId]] = _result;
  }

  function withdrawLink() public onlyOwner {
    LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
    require(link.transfer(msg.sender, link.balanceOf(address(this))), "Unable to transfer");
  }

  function cancelRequest(
    bytes32 _requestId,
    uint256 _payment,
    bytes4 _callbackFunctionId,
    uint256 _expiration
  )
    public
    onlyOwner
  {
    cancelChainlinkRequest(_requestId, _payment, _callbackFunctionId, _expiration);
  }

  function stringToBytes32(string memory source) private pure returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(source);
    if (tempEmptyStringTest.length == 0) {
      return 0x0;
    }

    assembly { // solhint-disable-line no-inline-assembly
      result := mload(add(source, 32))
    }
  }
}