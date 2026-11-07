export function appCheckPolicy(platform: string, siteKey: string | undefined, required: boolean) {
  const key = siteKey?.trim() ?? "";
  if (required && (platform !== "web" || !key))
    throw new Error("A verificação de segurança não foi configurada para este aplicativo.");
  return platform === "web" && key ? { siteKey: key } : null;
}

export function createAppCheckInitializer(initialize: (siteKey: string) => void) {
  let initialized = false;
  return (configuration: ReturnType<typeof appCheckPolicy>) => {
    if (!configuration || initialized) return;
    try {
      initialize(configuration.siteKey);
      initialized = true;
    } catch {
      // Falha real não pode ser confundida com sucesso/hot reload.
      throw new Error(
        "Não foi possível iniciar a verificação de segurança. Recarregue e tente novamente.",
      );
    }
  };
}
