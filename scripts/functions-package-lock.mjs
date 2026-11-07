export function functionsPackageWorkspace(lockfile, workspace) {
  if (!workspace || typeof workspace !== "object")
    throw new Error("Política do workspace ausente.");
  return {
    packages: ["."],
    nodeLinker: "isolated",
    overrides: structuredClone(lockfile.overrides ?? {}),
    allowBuilds: structuredClone(workspace.allowBuilds ?? {}),
    strictDepBuilds: true,
    minimumReleaseAge: workspace.minimumReleaseAge ?? 10080,
  };
}

export function functionsPackageLock(lockfile) {
  if (lockfile.lockfileVersion !== "9.0" || !lockfile.importers?.functions)
    throw new Error("Formato de lockfile ou importer Functions não suportado.");
  const functions = structuredClone(lockfile.importers.functions);
  for (const section of ["dependencies", "devDependencies", "optionalDependencies"])
    for (const dependency of Object.values(functions[section] ?? {}))
      if (/^(?:workspace:|link:|file:)/.test(dependency.specifier))
        throw new Error("Dependência local precisa de empacotamento explícito antes do deploy.");
  const pending = [];
  const reachable = new Set();
  const enqueue = (name, version) => {
    const normal = `${name}@${version}`;
    const key = lockfile.snapshots?.[normal] ? normal : version;
    if (lockfile.snapshots?.[key] && !reachable.has(key)) pending.push(key);
  };
  for (const section of ["dependencies", "devDependencies", "optionalDependencies"])
    for (const [name, dependency] of Object.entries(functions[section] ?? {}))
      enqueue(name, dependency.version);
  while (pending.length) {
    const key = pending.pop();
    if (reachable.has(key)) continue;
    reachable.add(key);
    const snapshot = lockfile.snapshots[key];
    for (const section of ["dependencies", "optionalDependencies"])
      for (const [name, version] of Object.entries(snapshot[section] ?? {})) enqueue(name, version);
  }
  for (const patch of Object.keys(lockfile.patchedDependencies ?? {}))
    if ([...reachable].some((key) => key === patch || key.startsWith(patch + "(")))
      throw new Error(
        "Patch de dependência do backend precisa ser incluído explicitamente no pacote portátil.",
      );
  // App-only patches must not make the backend depend on files outside its package.
  const portable = { ...lockfile, importers: { ".": functions } };
  delete portable.patchedDependencies;
  return portable;
}
