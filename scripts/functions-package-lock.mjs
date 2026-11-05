export function functionsPackageLock(lockfile) {
  if (lockfile.lockfileVersion !== "9.0" || !lockfile.importers?.functions)
    throw new Error("Formato de lockfile ou importer Functions não suportado.");
  const functions = structuredClone(lockfile.importers.functions);
  for (const section of ["dependencies", "devDependencies", "optionalDependencies"])
    for (const dependency of Object.values(functions[section] ?? {}))
      if (/^(?:workspace:|link:|file:)/.test(dependency.specifier))
        throw new Error("Dependência local precisa de empacotamento explícito antes do deploy.");
  return { ...lockfile, importers: { ".": functions } };
}
