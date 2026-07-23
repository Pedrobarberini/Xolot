import React, { useMemo, useState } from "react";
import { AtSign, Check, X } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type { AppUser } from "../types";
import {
  selectMentionCandidates,
  toggleSubmissionMention
} from "../utils/submissionMetadata";
import { LabeledInput } from "./Navigation";

const MAX_MENTIONS = 8;

export function SubmissionMentionPicker({
  accounts,
  currentUserId,
  onChange,
  value
}: {
  accounts: AppUser[];
  currentUserId: string;
  onChange: (usernames: string[]) => void;
  value: string[];
}) {
  const [query, setQuery] = useState("");
  const candidates = useMemo(
    () => selectMentionCandidates(accounts, currentUserId, query),
    [accounts, currentUserId, query]
  );
  const selectedUsernames = new Set(
    value.map((username) => username.toLocaleLowerCase("pt-BR"))
  );
  const hasQuery = query.trim().length > 0;

  function toggleMention(username: string) {
    onChange(toggleSubmissionMention(value, username, MAX_MENTIONS));
    setQuery("");
  }

  return (
    <View style={styles.submissionMentionPicker}>
      <LabeledInput
        autoCapitalize="none"
        autoCorrect={false}
        label="Marcar usuários"
        onChangeText={setQuery}
        placeholder="Busque por nome ou @usuario"
        value={query}
      />
      <Text style={styles.submissionMentionHint}>
        Selecione até {MAX_MENTIONS} perfis cadastrados.
      </Text>

      {value.length > 0 ? (
        <View style={styles.submissionMentionSelectedRow}>
          {value.map((username) => (
            <Pressable
              accessibilityLabel={"Remover marcação de @" + username}
              accessibilityRole="button"
              key={username}
              onPress={() => toggleMention(username)}
              style={styles.submissionMentionChip}
            >
              <Text numberOfLines={1} style={styles.submissionMentionChipText}>
                {"@" + username}
              </Text>
              <X color={colors.primary} size={14} strokeWidth={2.5} />
            </Pressable>
          ))}
        </View>
      ) : null}

      {hasQuery ? (
        <View style={styles.submissionMentionResults}>
          {candidates.length > 0 ? (
            candidates.map((account) => {
              const isSelected = selectedUsernames.has(
                account.username.toLocaleLowerCase("pt-BR")
              );

              return (
                <Pressable
                  accessibilityLabel={
                    (isSelected ? "Remover " : "Marcar ") +
                    "@" +
                    account.username
                  }
                  accessibilityRole="button"
                  key={account.id}
                  onPress={() => toggleMention(account.username)}
                  style={({ pressed }) => [
                    styles.submissionMentionResult,
                    pressed ? styles.buttonPressed : null
                  ]}
                >
                  <View style={styles.submissionMentionResultIcon}>
                    <AtSign color={colors.primary} size={17} />
                  </View>
                  <View style={styles.submissionMentionResultIdentity}>
                    <Text
                      numberOfLines={1}
                      style={styles.submissionMentionResultUsername}
                    >
                      {"@" + account.username}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={styles.submissionMentionResultName}
                    >
                      {account.name}
                    </Text>
                  </View>
                  {isSelected ? (
                    <Check color={colors.primary} size={18} strokeWidth={2.6} />
                  ) : null}
                </Pressable>
              );
            })
          ) : (
            <Text style={styles.submissionMentionEmpty}>
              Nenhum perfil encontrado.
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
}
