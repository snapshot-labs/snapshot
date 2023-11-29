# oSnap Snapshot Plugin

This is a Snapshot plugin that facilitates using the Optimistic Governor to execute a set of transactions.

See https://docs.snapshot.org/user-guides/plugins for general info about Snapshot plugin development.

## Terms

There are some terms that can be confusing in this plugin, because they are used to mean different things in different contexts.

* Proposal — in the context of a normal Snapshot vote, regardless of plugins, "Proposal" refers to the set of questions that gets submitted to Snapshot and presented to voters. In the context of the Optimistic Governor, "Proposal" refers to the set of transactions that are submitted to the Optimistic Governor contract to be executed. This can be confusing because a Snapshot "Proposal" that uses the oSnap plugin will itself have an Optimistic Governor "Proposal" for the transactions that it aims to execute. As far as possible we have prefixed Optimistic Governor proposals with "OG" in the code to avoid confusion.

* Assertion — Optimistic Oracle V3 calls a piece of information that is asserted as true an "assertion". In the context of the Optimistic Governor, an assertion is made on the Optimistic Oracle which states that the specified set of transactions is valid and should be executed. Some key information about the Optimistic Governor proposal can only be found in the context of assertions, such as the assertion transaction hash and log index which are used to generate links to the Optimistic Oracle UI.

* SafeSnap and oSnap — oSnap was originally part of the SafeSnap plugin, hence the similar names. SafeSnap uses the Reality oracle, while oSnap provides the option to use the Optimistic Oracle instead. Eventually it was decided that oSnap deserves to be its own plugin, and so it was split off from SafeSnap. However, for legacy support reasons, the oSnap functionality in the SafeSnap plugin is still available.

* Votes — both Snapshot and the Optimistic Oracle use votes for their function. The _Snapshot_ vote takes place first in the context of oSnap. When creating a Snapshot Proposal with oSnap, the Snapshot vote takes place first. Only if the Snapshot vote passes can transactions be proposed to the Optimistic Governor. In fact, if the assertion for an Optimistic Governor proposal is disputed, the Optimistic Governor proposal is immediately deleted by the contract. This means that the Optimistic Oracle vote that proceeds from the dispute has no bearing on the Optimistic Governor proposal. The Optimistic Oracle vote is only used to determine whether the disputer or the proposer loses their bond.