import React from "react";
import { Check, RefreshCw, X } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { StatusPill, SubmissionVideoPreview } from "../components/SubmissionComponents";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { VideoSubmission, VideoSubmissionStatus } from "../types";

export function AdminScreen({
  onReview,
  submissions
}: {
  onReview: (
    submissionId: string,
    status: VideoSubmissionStatus,
    reviewNote: string
  ) => void;
  submissions: VideoSubmission[];
}) {
  const reviewQueue = submissions.filter(
    (item) => item.status === "Em revisão"
  );
  const pending = reviewQueue.length;
  const approved = submissions.filter((item) => item.status === "Aprovado").length;
  const changes = submissions.filter(
    (item) => item.status === "Ajustes solicitados"
  ).length;

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <View style={styles.adminHero}>
        <Text style={styles.heroKicker}>Painel admin</Text>
        <Text style={styles.heroTitle}>Moderacao de videos.</Text>
        <Text style={styles.heroBody}>
          Revise os envios dos atletas e publique somente os videos que atendem
          aos criterios da plataforma.
        </Text>
      </View>

      <View style={styles.metricGrid}>
        <SummaryMetric label="Pendentes" value={String(pending)} />
        <SummaryMetric label="Aprovados" value={String(approved)} />
        <SummaryMetric label="Ajustes" value={String(changes)} />
      </View>

      <View style={styles.infoPanel}>
        <Text style={styles.sectionTitle}>Fila de revisão</Text>
        {reviewQueue.length === 0 ? (
          <Text style={styles.bodyText}>Nenhuma solicitacao pendente.</Text>
        ) : (
          reviewQueue.map((submission) => (
            <View key={submission.id} style={styles.adminItem}>
              <View style={styles.submissionTopRow}>
                <View style={styles.submissionTextBlock}>
                  <Text style={styles.submissionTitle}>
                    {submission.athleteName}
                  </Text>
                  <Text style={styles.submissionMeta}>
                    {submission.age} anos | {submission.position} |{" "}
                    {submission.city}
                  </Text>
                </View>
                <StatusPill status={submission.status} />
              </View>

              {submission.videoLink ? (
                <SubmissionVideoPreview
                  compact
                  mediaType={submission.mediaType}
                  uri={submission.videoLink}
                />
              ) : null}
              <Text style={styles.submissionBody}>{submission.highlight}</Text>
              <Text style={styles.adminFinePrint}>
                Video: {submission.videoTitle} | Consentimento:{" "}
                {submission.hasGuardianConsent ? "Sim" : "Não aplicavel"}
              </Text>
              {submission.reviewNote ? (
                <Text style={styles.reviewNote}>{submission.reviewNote}</Text>
              ) : null}

              <View style={styles.actionRow}>
                <Pressable
                  onPress={() =>
                    onReview(
                      submission.id,
                      "Aprovado",
                      "Aprovado pela moderação e publicado no feed."
                    )
                  }
                  style={[styles.smallButton, styles.approveButton]}
                >
                  <Check color={colors.onPrimary} size={17} />
                  <Text style={styles.smallButtonText}>Aprovar</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    onReview(
                      submission.id,
                      "Ajustes solicitados",
                      "Pedir video com mais contexto de jogo e dados do responsavel."
                    )
                  }
                  style={[styles.smallButton, styles.adjustButton]}
                >
                  <RefreshCw color={colors.onPrimary} size={16} />
                  <Text style={styles.smallButtonTextDark}>Ajustes</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    onReview(
                      submission.id,
                      "Reprovado",
                      "Reprovado por falta de informacoes suficientes."
                    )
                  }
                  style={[styles.smallButton, styles.rejectButton]}
                >
                  <X color={colors.onPrimary} size={17} />
                  <Text style={styles.smallButtonText}>Reprovar</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}
