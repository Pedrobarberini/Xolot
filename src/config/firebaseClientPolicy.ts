export function firebaseApiKeyForPlatform(
  platform: string,
  sharedApiKey: string | undefined,
  webApiKey: string | undefined,
) {
  const shared = sharedApiKey?.trim();
  return platform === "web" ? webApiKey?.trim() || shared : shared;
}

export function appCheckRequiredForPlatform(
  platform: string,
  requiredEverywhere: boolean,
  requiredOnWeb: boolean,
) {
  return requiredEverywhere || (platform === "web" && requiredOnWeb);
}
