import { createRequire } from "node:module";
const hosts = {
  firestore: "firestore.googleapis.com",
  monitoring: "monitoring.googleapis.com",
  resourceManager: "cloudresourcemanager.googleapis.com",
  serviceUsage: "serviceusage.googleapis.com",
  billing: "cloudbilling.googleapis.com",
  budgets: "billingbudgets.googleapis.com",
  rules: "firebaserules.googleapis.com",
};
export async function googleOperatorClient() {
  const require = createRequire(import.meta.url);
  const { getGlobalDefaultAccount, getAccessToken } = require("firebase-tools/lib/auth");
  const account = getGlobalDefaultAccount();
  if (!account?.tokens?.refresh_token) throw new Error("Sessão Firebase do operador indisponível.");
  const token = await getAccessToken(account.tokens.refresh_token, []);
  return async function request(service, path, method = "GET", body) {
    if (
      !hosts[service] ||
      (!path.startsWith("/v1/") && !path.startsWith("/v3/")) ||
      path.includes("\\") ||
      path.includes("#")
    )
      throw new Error("Destino de operação inválido.");
    const response = await fetch(`https://${hosts[service]}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json",
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(30000),
    });
    const text = await response.text();
    request.serverDate = response.headers.get("date");
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(`Resposta operacional inválida (HTTP ${response.status}).`);
    }
    if (!response.ok) {
      const error = new Error(
        `Operação ${service} recusada: HTTP ${response.status}, ${data.error?.status ?? "unknown"}.`,
      );
      error.status = response.status;
      error.reason = data.error?.details?.find((item) => item.reason)?.reason;
      throw error;
    }
    return data;
  };
}
