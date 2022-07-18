# Project Galaxy Plugin

**Project Galaxy Plugin is a plugin for Project Galaxy Campaign OATs**

### 1. Preparation

Create a snapshot proposal in [https://snapshot.org/](https://snapshot.org/ "https://snapshot.org/")
Create a campain in [https://galaxy.eco/](https://galaxy.eco/ "https://galaxy.eco/")

### 2. Add Project Galaxy Plugin to your space

In snapshot space setting, you can find Project Galaxy Plugin in plugins section, and add it to your space.

### 3. Set config JSON

Add JSON string to your space

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

*Here is a Demo JSON:* 
```javascript
{
	"oats": {
		"0x554ca2bd7d979e8b72c6ae6415946a7bb470da9f60a9cf931205f083c03632a3": "jokey/campaign/GCixQUUqfE"
	}
}
```
### More

For Production Enviroment, we are using API Base Url https://graphigo.prd.galaxy.eco/query and only allows domain snapshot.org.
For Local Enviroment or any other test purpose, you can switch the API Base Url(*file index.ts*) to https://graphigo.stg.galaxy.eco/query and change port to 3000(*file package.json*).

When you see "Access-Control-Allow-Origin" error on console, please check if you have set the correct API Base Url and correct port, then restart the server.