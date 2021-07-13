// const requireFile = import.meta.glob(
//   '@snapshot-labs/snapshot.js/src/strategies/index.ts'
// );

// const requireReadmeFile = import.meta.glob(
//   '@snapshot-labs/snapshot.js/src/strategies/README.md'
// );

// const requireExamplesJson = import.meta.glob(
//   '@snapshot-labs/snapshot.js/src/strategies/*.json'
// );

// export default Object.fromEntries(
//   requireFile
//     .keys()
//     .filter(fileName => fileName !== './index.ts')
//     .map(fileName => {
//       const key = fileName.replace('./', '').replace('/index.ts', '');
//       const strategy = requireFile(fileName);
//       strategy.key = key;
//       try {
//         strategy.examples = requireExamplesJson(
//           fileName.replace('index.ts', 'examples.json')
//         ).default;
//         strategy.about = requireReadmeFile(
//           fileName.replace('index.ts', 'README.md')
//         ).default;
//       } catch (error) {
//         strategy.about = '';
//       }
//       try {
//         strategy.examples = requireExamplesJson(
//           fileName.replace('index.ts', 'examples.json')
//         );
//       } catch (error) {
//         strategy.examples = null;
//       }
//       return [key, strategy];
//     })
// );

export default {};
