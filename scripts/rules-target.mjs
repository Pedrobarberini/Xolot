export const rulesProject = "demo-xolot-rules";

export function assertRulesTarget(environment, requireHosts = true) {
  for (const name of ["GCLOUD_PROJECT", "GOOGLE_CLOUD_PROJECT", "FIREBASE_PROJECT_ID"]) {
    if (environment[name] && environment[name] !== rulesProject)
      throw new Error(`Alvo não autorizado em ${name}; somente ${rulesProject}.`);
  }
  for (const [name, expected] of [
    ["FIRESTORE_EMULATOR_HOST", "127.0.0.1:8085"],
    ["FIREBASE_STORAGE_EMULATOR_HOST", "127.0.0.1:9195"],
    ["FIREBASE_AUTH_EMULATOR_HOST", "127.0.0.1:9095"],
  ]) {
    if ((requireHosts || environment[name]) && environment[name] !== expected)
      throw new Error(`Emulador local obrigatório em ${name}: ${expected}.`);
  }
}
