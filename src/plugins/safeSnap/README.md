# SafeSnap

In the settings you can define safes and zero or more execution (zodiac) modules for each safe.

When creating a proposal, you can then attach any number of execution sets to it.
An execution set contains the information about the safe, the execution module and the transactions to execute, which can be an array of arrays, where each array of transactions will be converted to a single multisend transaction.

An execution module is connected to an oracle (currently Reality, UMA or Tellor), telling it when to allow (or reject) execution and how to arbitrate disputes.

If no module is defined/used in an execution set, transactions can only be executed by connecting as the safe (e.g. via the gnosis safe app).

# Transaction builder

The transaction builder is part of the proposal form once a safe is configured in the settings.
You can add as many execution sets as you want, by chosing a configured safe, a module or manual execution,
and the respective transactions to execute, a single one or multiple, ordered groups of transactions.

Forms for common transaction types (ERC20, ERC721) or custom contract interactions output raw transaction data, which gets stored in the proposal metadata.

The other way around, raw transaction data (e.g. from import) will be matched against common interfaces and displayed in the most appropriate form.
For custom contract interactions the abi of the contract is stored in the proposal metadata as well.

# Execution

The proposal page displays the execution sets and handles the relevant "propose > dispute > execute" flow or the execution module.

