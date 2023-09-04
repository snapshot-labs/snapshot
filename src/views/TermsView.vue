<script setup lang="ts">
const terms = `# Snapshot.org Disclaimers

Please read this disclaimer of Snapshot Labs, Inc ("**Snapshot Labs**”) carefully before accessing, interacting with, or using snapshot.org, consisting of the Snapshot off-chain voting platform, its respective web 2.0 user interface, as well as any other functionalities and/or applications developed in the future (together “**Snapshot Voting Platform**”).

This disclaimer relates to the use of Snapshot Voting Platform. Snapshot Voting Platform enables decentralized autonomous organizations (DAO), DeFi protocols, Web3 projects and other Web3 respective communities (together referred as “**Users**”) to each organize their governances in a hub (“**Space(s)**”) by offering them tools to create and to vote on governance proposals ("**Proposals**”) in the Spaces, in an off-chain environment. Any and all functionalities of the Snapshot Voting Tool Platform are of purely technical nature and there is no claim towards any private individual or legal entity in this regard.

This disclaimer may be updated and modified from time to time. The disclaimer as so updated and modified are deemed effective as of the date they are published on snapshot.org. It is the User’s responsibility to periodically check for the most recent version of the disclaimer. By signing this message with his wallet, User confirms that he has carefully read and understood the content of this disclaimer.


1. **General Considerations**
   Snapshot Voting Platform allows peer-to-peer user interaction via a (partially) decentralised infrastructure. By accessing and/or using the Snapshot Voting Platform, User agrees that the Snapshot Voting Platform operates “as is” and that any User interaction remain outside the control and liability of Snapshot Labs.
   
   Snapshot Labs has no access to Users’ wallets and respective private keys and does not provide any wallet service.
   
   Snapshot Labs may therefore not be held liable for any acts and/or omissions by Users when interacting with other Users via the Snapshot Voting Platform. Snapshot Labs is also not liable to any User for any damages, including any general, special, incidental or consequential damages and/or loss of data, business interruption, data being rendered inaccurate, loss or profit or other damages, arising out of or in connection to the use, misuse, inability to use or any misfunction of the Snapshot Voting Platform. (See also section 6 et.al. below).

2. **Purpose of Spaces**
   Snapshot Voting Platform allows Users to create a Space which is managed by one or multiple admins (“**Admin**”). Solely Space’s Admin defines the voting requirements for the Space voting power, voting system, governance token to be used and delegation voting system. User acknowledges and accepts that Snapshot Labs cannot influence and/or change the voting requirements defined by the Space’s Admin.
   
   User undertakes not to create a Space for any purpose that is fraudulent, illegal, offensive, defamatory, or otherwise tortious or unlawful, including but not limited to illegal gambling, money laundering, fraud, blackmail, extortion, ransoming data or the financing of terrorism, intellectual property infringement, or violent or abusive activities. Snapshot Labs reserves the right to hide such Spaces on snapshot.org.

3. **Content of Proposals**
   User undertakes not to create, submit, and vote on Proposals, whose content may be illegal, fraudulent, offensive, abusive, indecent, harmful, defamatory, obscene, or menacing, abusive, threatening, objectionable, invasive of privacy, in breach of confidentiality toward a third party, infringing of intellectual property rights, or is a threat to any User’s or third-party’s safety. Snapshot Labs reserves the right to hide such Proposals on snapshot.org.

4. **No Interference with Users’ Space and Proposals**
   Snapshot Labs is not involved in management and/or customisation of Spaces and in the process around Proposals’ creation and voting.

   User understands and acknowledges that Snapshot Labs - as well as any other private individual and/or legal entity related to Snapshot Labs - has neither access to, nor any other possibility to control and/or influence Spaces and their corresponding Proposals created and voted on by Users. User also understands and acknowledges that the passing of a Proposal does not automatically lead to the execution of the Proposal. The execution of Proposals lies in the discretion of Users and/or Admins.Consequently, Snapshot Labs as well as any other private individual and/or legal entity related to Snapshot Labs, cannot be held liable for the voting requirements that are chosen by the Space’s Admin, as well as the content the outcome and/or non-execution of Proposals.

   Admins and Users solely bear any and all liability in connection with the management of the Space and its respective Proposals. Snapshot Labs reserves the right to hide Proposals and Spaces in violation with Section 2 and Section 3 above on snapshot.org.

5. **Use of Snapshot Voting Platform at User’s Own Risk**
   By accessing, interacting with, or using Snapshot Voting Platform, User agrees and acknowledges that he uses Snapshot Voting Platform at his own risk.

   As Snapshot Voting Platform is of experimental nature it may contain bugs, defects, or errors (including any bug, defect, or error relating to or resulting from the display, manipulation, processing, storage, transmission, or use of data) that may materially and ad versely affect the use, functionality, or performance of Snapshot Voting Platform or any product or system containing or used in conjunction with Snapshot Voting Platform.

   Snapshot Voting Platform has been provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement.

   There are risks associated with using internet and blockchain based products, including but not limited to, the risk associated with hardware, software and internet connections, the risk of malicious software introduction, and the risk that third parties may obtain unauthorized access to information stored within Users’ wallets. Users are responsible for any communication failures, disruptions, errors, distortions or delays Users may experience when using Snapshot Voting Platform or any blockchain network for transactions, however caused.

6. **No warranties, Limitation of Liability**
   User understands that the Snapshot Voting Platform is provided as is and that he uses the Snapshot Voting Platform at his own risk and without any warranties provided by Snapshot Labs.

   Any liability of Snapshot Labs is excluded to the maximal extent permitted under Swiss law. User is therefore solely responsible for any damages or losses he may incur or cause to any other user, including any special, incidental or consequential damages arising out of his use, or inability to use, or the misfunctioning of the Snapshot Voting Platform (including but not limited to loss of Spaces’ features (voting strategy set-up and moderation method, business interruption, data being rendered inaccurate or losses sustained by User or third parties or a failure to interact with any other software or the nonexecution of a Proposal).

   Snapshot reserves the right to modify, suspend, or discontinue, temporarily or permanently at its sole discretion, Snapshot Voting Platform (or any features or parts thereof) at any time and without liability as a result.

7. **User Data Storage / Security / Wallet**
   Users are responsible for the security of their wallet and their corresponding data such as, wallets’ private key, as well as ENS domain name, that Users need to access the functionalities of Snapshot Voting Platform. Snapshot Labs or any other (third) party is not responsible for managing or maintaining the security of Users’ data.

   Users are responsible for implementing reasonable measures for securing their wallets and ENS domain names. Users shall protect their data from being accessible by third parties and shall not pass them on to unauthorized third party. Users remain responsible for any and all use and activities performed with their data.

   Users shall immediately notify snapshot.org, if Users discover or otherwise suspect any security breaches related to snapshot.org or Users’ data.

8. **Risk of Regulatory Actions and Compliance with Laws**
   The use of Snapshot Voting Platform is prohibited for persons or entities are listed, or associated with any person or entity listed, on any sanction list of the governments of the United States, United Kingdom and/or any member state of the European Union.

   Users are solely responsible for complying with applicable laws when interacting with Snapshot Voting Platform whatsoever. In that regard, Users shall not use any device, software or routine to interfere or attempt to interfere with the proper working of Snapshot Voting Tool.

9. **Governing Law**
   This Disclaimer shall be construed and interpreted in accordance with the substantive laws of Switzerland, excluding the Swiss conflict of law rules.

   Any dispute arising out of or in conjunction with these Terms shall be submitted to the exclusive jurisdiction of the ordinary courts of the city of Zug, Switzerland
`;
</script>

<template>
  <div>
    <BaseContainer class="mb-[100px] max-w-[760px]">
      <BaseMarkdown :body="terms" />
    </BaseContainer>
  </div>
</template>
