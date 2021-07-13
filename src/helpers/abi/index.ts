const requireFile = import.meta.glob('./*.json');

const files = {};

for (const path in requireFile) {
  requireFile[path]().then(file => {
    files[path.replace('./', '').replace('.json', '')] = file.abi;
  });
}

export default files;
