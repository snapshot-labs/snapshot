const requireFile = import.meta.glob('./*.json');

export default Object.fromEntries(
  await Promise.all(
    Object.keys(requireFile).map(async path => {
      const file = await requireFile[path]();
      return [path.replace('./', '').replace('.json', ''), file.abi];
    })
  )
);
