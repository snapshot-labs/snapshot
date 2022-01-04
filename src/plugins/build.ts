import fs from 'fs';
import path from 'path';

export default () => {
  // create list of plugins from plugin.json files in src/plugins
  const plugins: string[] = [];
  const indexFile = path.resolve(__dirname, './_index.json');
  const oldContent = fs.readFileSync(indexFile, 'utf-8');
  const newContent = JSON.stringify(
    Object.fromEntries(
      fs.readdirSync(__dirname, { withFileTypes: true })
        .filter(file => file.isDirectory() && file.name !== 'template')
        .map(dir => {
          try {
            plugins.push(dir.name)
            return [
              dir.name,
              JSON.parse(
                fs.readFileSync(
                  path.resolve(__dirname, `./${dir.name}/plugin.json`),
                  'utf-8'
                )
              )
            ];
          } catch {
            return [];
          }
        })
        .filter(plugin => plugin)
    ),
    null,
    2
  );

  if (oldContent !== newContent) {
    fs.writeFileSync(indexFile, newContent);
    console.log('Snapshot plugins indexed: ', plugins);
  }
}