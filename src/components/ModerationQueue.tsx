import React, { useRef, useState, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import type { ModerationReport } from "../services/firebaseModerationService";
import { styles } from "../styles/appStyles";

const labels: Record<string, string> = {
  spam: "Spam",
  harassment: "Assédio",
  violence: "Violência",
  sexual: "Conteúdo sexual",
  fraud: "Fraude",
  other: "Outro motivo",
};

export function ModerationQueue({
  loadApi = () => import("../services/firebaseModerationService"),
}: {
  loadApi?: () => Promise<typeof import("../services/firebaseModerationService")>;
}) {
  const [reports, setReports] = useState<ModerationReport[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  async function load(next = false) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const api = await loadApi();
      const result = await api.loadModerationReports(next && cursor ? cursor : undefined);
      if (!alive.current) return;
      setReports((current) =>
        next
          ? [...current, ...result.reports.filter((r) => !current.some((c) => c.id === r.id))]
          : result.reports,
      );
      setCursor(result.nextCursor);
      setLoaded(true);
    } catch {
      if (alive.current)
        setError("Não foi possível abrir a fila. É necessário acesso de moderação autorizado.");
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  async function review(id: string, decision: "reviewed" | "no_violation") {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const api = await loadApi();
      await api.resolveModerationReport(id, decision);
      if (alive.current) setReports((current) => current.filter((r) => r.id !== id));
    } catch {
      if (alive.current) setError("A revisão não foi confirmada. Tente novamente.");
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  return (
    <View style={styles.infoPanel}>
      <Text style={styles.sectionTitle}>Denúncias de publicações</Text>
      <Text style={styles.bodyText}>
        Fila privada. A identidade de quem denunciou não aparece nesta tela.
      </Text>
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={() => void load()}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>
          {busy ? "Aguarde…" : loaded ? "Atualizar denúncias" : "Carregar denúncias"}
        </Text>
      </Pressable>
      {error ? (
        <Text accessibilityRole="alert" style={styles.bodyText}>
          {error}
        </Text>
      ) : null}
      {loaded && reports.length === 0 ? (
        <Text style={styles.bodyText}>Nenhuma denúncia aberta nesta página.</Text>
      ) : null}
      {reports.map((report) => (
        <View key={report.id} style={styles.adminItem}>
          <Text style={styles.submissionTitle}>{labels[report.reason] ?? "Outro motivo"}</Text>
          <Text style={styles.submissionMeta}>{report.postTitle}</Text>
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => void review(report.id, "reviewed")}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Marcar como revisada</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => void review(report.id, "no_violation")}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Registrar sem violação</Text>
          </Pressable>
        </View>
      ))}
      {cursor ? (
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          onPress={() => void load(true)}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Carregar mais denúncias</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
