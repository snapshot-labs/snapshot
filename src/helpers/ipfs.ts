class Client {
  get(ipfsHash, protocolType = 'ipfs') {
    const url = `https://${process.env.VUE_APP_IPFS_NODE}/${protocolType}/${ipfsHash}`;
    return fetch(url).then(res => res.json());
  }
}

const client = new Client();

export default client;
