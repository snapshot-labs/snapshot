# SafeSnap

*This README does not reflect the current status quo but rather my personal "vision" for Safesnap, ~70% implemented.*

In the settings you can define safes (Gnosis and potentially others) and zero or more execution (zodiac) modules for each safe.

When creating a proposal, you can then attach any number of "execution sets" to it.
An execution set contains the information about the safe, the execution module, the transactions to execute (which can be an array of arrays, where each array of transactions can be converted to a single multisend transaction) and related contract ABIs for displaying purposes.

An execution module is connected to an oracle (currently Reality or UMA), telling it when to allow (or reject) execution and how to arbitrate disputes.

If no module is defined in an execution set, transactions can only be executed by connecting as the safe (e.g. via the Gnosis safe app).

## Transaction builder

The transaction builder becomes part of the proposal form once a safe is configured in the space settings.
You can add as many execution sets as you want, by chosing a configured safe, an execution module or manual execution,
and adding the transactions you want, a single one or multiple, groups of ordered transactions, via the provided forms.

You can add custom criteria for each execution set, as either JSON or freely formulated, unambiguous instructions. The execution of transactions, with the optimistic approach, is ultimately subject to human judgment, allowing full flexibility in setting the terms for execution.

Forms for common transaction types (ERC20, ERC721, contract calls) output raw transaction data, which gets stored in the proposal metadata.

The other way around, raw transaction data gets matched against common interfaces and displayed in the most appropriate form, e.g. when importing transactions in the builder or displaying them on the proposal page.

### Import

Transaction data can be imported as JSON, either in raw format:

```js
{ to, value, data, operation }
```

(`operation` can be either `CALL (0)` or `DELEGATECALL (1)`.)

...or alternative formats for common transaction types:

**Funds transfer:**

```js
{ to, amount, token? }
```

(`operation` defaults to `CALL`. Token can be omitted for native asset)

**NFT transfer:**

```js
{ to, id, token }
```

**Contract interaction:**

```js
{ contract, method, arguments[] }
```

## Execution

The proposal page displays the execution sets and handles the relevant "propose > dispute > execute" flow of the execution module.
The modules all support handling an array of transactions in a single execution process. These transactions can themselves be multisend transactions, so we end up with an array of arrays of transactions. And for maximum flexibility, a proposal can have multiple independent execution sets attached to it (using different oracles, if you want).

Once a proposal has ended, the process can be started by anyone. Transactions can to be proposed on chain, followed by a dispute phase. That phase is specific to the execution module and its oracle and defines the rules for arbitration and the incentives to propose valid transactions. After that phase transactions can either be executed or have been rejected.

### Reality

To propose transactions an initial, minimum bond is deposited. Dispute happens by doubling that required bond, each time the last answer gets challenged. A custom arbitration contract can be payed a fee to resolve the question instead, if bonds become higher than that fee.

[Read more.](https://)

[VIDEO]

### UMA

Proposed transactions only need to be challenged once. Both, proposer and disputer, have to pay the same bond. A dispute is then directly resolved by UMA token holders, incentivized economically to vote for the correct outcome.

[Read more.](https://docs.umaproject.org/protocol-overview/how-does-umas-oracle-work)

[VIDEO]

## Implementation details

- Components
- Composables