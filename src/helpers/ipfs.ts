class Client {
  get(ipfsHash) {
    const url = `https://${process.env.VUE_APP_IPFS_NODE}/ipfs/${ipfsHash}`;
    return fetch(url).then(res => res.json());
  }
}

const client = new Client();

export default client;
