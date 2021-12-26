<div align="center">
    <img src="public/icon.svg" height="70" alt="Snapshot Logo">
    <h1>Snapshot</h1>
    <strong>Snapshot is an off-chain gasless multi-governance client with easy to verify and hard to contest results.</strong>
</div>
<br>
<div align="center">
    <a href="https://github.com/snapshot-labs/snapshot/actions/workflows/nodejs.yml">
        <img src="https://github.com/snapshot-labs/snapshot/actions/workflows/nodejs.yml/badge.svg" alt="Node CI">
    </a>
    <img src="https://img.shields.io/github/commit-activity/w/snapshot-labs/snapshot" alt="GitHub commit activity">
    <a href="https://github.com/snapshot-labs/snapshot/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22">
        <img src="https://img.shields.io/github/issues/snapshot-labs/snapshot/help wanted" alt="GitHub issues help wanted">
    </a>
    <a href="https://telegram.snapshot.org">
        <img src="https://img.shields.io/badge/Telegram-white?logo=telegram" alt="Telegram">
    </a>
    <a href="https://discord.snapshot.org">
        <img src="https://img.shields.io/discord/707079246388133940.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2" alt="Discord">
    </a>
    <a href="https://twitter.com/SnapshotLabs">
        <img src="https://img.shields.io/twitter/follow/SnapshotLabs?label=SnapshotLabs&style=flat&logo=twitter&color=1DA1F2" alt="Twitter">
    </a>
</div>
<div align="center">
    <br>
    <a href="https://snapshot.org"><b>snapshot.org »</b></a>
    <br><br>
    <a href="https://docs.snapshot.org"><b>Documentation</b></a>
    •
    <a href="https://features.snapshot.org/feature-requests"><b>Feature requests</b></a>
    •
    <a href="https://translate.snapshot.org"><b>Translate</b></a>
</div>

## Development Guide

You need to have Node.js >= 14 installed. If you use [nvm](https://github.com/nvm-sh/nvm), run `nvm install` to install and/or switch to the recommended version.

The UI is built with [Vue 3](https://v3.vuejs.org/) (using [composition API](https://v3.vuejs.org/api/composition-api.html)) and [Tailwind CSS](https://tailwindcss.com/).

If you use VSCode, you might want to install [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar), [Volar TypeScript Plugin](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.vscode-typescript-vue-plugin)  and [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) extensions.

### Setup

Fork the repository and clone it:

```sh
git clone git@github.com:<YOUR_USERNAME>/snapshot.git
cd snapshot

# init submodules, install dependencies, install git hooks
yarn

# compile and run dev server with hot-reload
yarn dev

# compile and minify for production
yarn build

# fix linting issues
yarn run lint
```

By default your local instance will connect to the hub at `https://testnet.snapshot.org` and you can use `http://localhost:3000/#/fabien.eth` for testing.

You can create a `.env.local` and overwrite the values from `.env`, e.g. to connect to your own local [hub](https://github.com/snapshot-labs/snapshot-hub) and [score API](https://github.com/snapshot-labs/snapshot-score).

### Overview

Here is an overview of our main repositories.

![image](https://user-images.githubusercontent.com/6792578/141847491-13251979-457d-4f4d-8f2a-39516a45332d.png)

#### Git Submodules

Plugins for the proposal page and some configuration for spaces are split out into two submodules, [snapshot-plugins](https://github.com/snapshot-labs/snapshot-plugins) and [snapshot-spaces](https://github.com/snapshot-labs/snapshot-spaces). When updating these repositories, there will be an automated pull request in this repository to update these submodules.

Git hooks will take care of pointing the submodules to the correct commit, whenever you do a `git pull/merge/checkout`.

#### Space Explorer or single DAO instance

By default, all spaces from the hub your frontend is connected too, are listed on the frontpage. But DAOs can also set their own custom domain to point to snapshot.org and get it listed [here](https://github.com/snapshot-labs/snapshot-spaces/blob/master/spaces/domains.json). If accessed via such a domain, the UI will be limited to this space only.

You can test this by setting `VITE_VIEW_AS_SPACE` in your `.env.local` to one of the spaces in your hub.

```
VITE_HUB_URL=https://testnet.snapshot.org
VITE_VIEW_AS_SPACE=fabien.eth
```

#### Rinkeby ENS Domain

To create a new space you need to have an ENS domain and set a `snapshot` TEXT record, pointing to a file on IPFS, containing your space settings.

If you don't have an ENS domain on the Ethereum mainnet or you don't want to use it for development, you can also register one on Rinkeby. Open the [ENS web interface](https://app.ens.domains), connect your wallet to Rinkeby and register your test domain.

Set `VITE_DEFAULT_NETWORK=4` in your `.env.local`. You will also have to [run your own local hub](https://github.com/snapshot-labs/snapshot-hub) and configure it to check ENS domains on Rinkeby as well.

## License

Snapshot is open-sourced software licensed under the © [MIT license](LICENSE).
