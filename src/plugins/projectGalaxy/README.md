# Project Galaxy Plugin

Created time: July 21, 2022 5:51 PM

The **Project Galaxy Plugin is designed for Snapshot.org. This will incentive communities to participate in the proposal vote by rewarding them with OATs (On-Chain Achievement Tokens). Space Admin can add this plugin into your space. After users vote, they can claim an OAT directly from the Project Galaxy Plugin section on the proposal page.**

### 1. Preparation

1. Create a Snapshot proposal on [https://snapshot.org/](https://snapshot.org/)
2. Create a Snapshot Credential with the proposal ID created from step1 on [https://galaxy.eco/](https://galaxy.eco/)
3. Create an OAT campaign ONLY with the credential created from step2 on [https://galaxy.eco/](https://galaxy.eco/)

### 2. Add Project Galaxy Plugin to your space

In Snapshot space setting, you can search and find the Project Galaxy Plugin in the plugins section, and add it to your space.

### 3. Set config JSON

Add campaign and proposal info to your plugin.

First, click the plugin, then you will see an editor section. See example below: 

*Specific JSON format like this, and you could use more than 1 OAT in your space:* 
```javascript
{
	"oats": {
		"<proposal ID 1>": "<Space Name>/campain/<Campaign ID>",
		"<proposal ID 2>": "<Space Name>/campain/<Campaign ID>",
		"<proposal ID 3>": "<Space Name>/campain/<Campaign ID>",
	}
}
```
notice: The domain should not included in <Space Name>.

#### Usually you don't need to change api part unless you know which api you are using.
```javascript
{
	"api": "https://graphigo.stg.galaxy.eco/query",
	"oats": {
		"0x554ca2bd7d979e8b72c6ae6415946a7bb470da9f60a9cf931205f083c03632a3": "jokey/campaign/GCixQUUqfE"
	}
}

Second, fill it with the proposal ID and the information of the Campaign which you would like to link with the proposal. If you have multiple proposals which all distribute OATs to voters, you can also add multiple proposalID-campaignInfo pairs at one time.

**Notice:** if you delete a proposalID-campaignInfo pair, people won’t see the OAT information on the page of your proposal even if the proposal ends or the OATs have already been distributed.

*Here is a Demo:*
```javascript
{
	"oats": {
		"0x554ca2bd7d979e8b72c6ae6415946a7bb470da9f60a9cf931205f083c03632a3": "galaxy/campaign/GCcqvUtDaM"
	}
}
```
### More

For Production Enviroment, we are using API Base Url https://graphigo.prd.galaxy.eco/query and only allows domain snapshot.org.
For Local Enviroment or any other test purpose, you can switch the API Base Url(*file index.ts*) to https://graphigo.stg.galaxy.eco/query and change port to 3000(*file package.json*).

When you see "Access-Control-Allow-Origin" error on console, please check if you have set the correct API Base Url and correct port, then restart the server.