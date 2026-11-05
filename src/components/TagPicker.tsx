import React, { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react-native";
import { Pressable, Text, TextInput, View } from "react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type { TagCatalogEntry } from "../types";
import {
  normalizeTagKey,
  normalizeTagLabel,
  searchTagCatalog
} from "../utils/tagCatalog";

type TagPickerProps = {
  catalog: TagCatalogEntry[];
  hint: string;
  maxTags: number;
  onChange: (tags: string[]) => void;
  onCreateTag?: (label: string) => Promise<unknown> | unknown;
  selectedTags: string[];
  title: string;
};

function getUsageLabel(entry: TagCatalogEntry) {
  if (entry.creatorCount <= 0) return "Ainda não usada em publicações";
  const people =
    entry.creatorCount === 1 ? "1 pessoa" : `${entry.creatorCount} pessoas`;
  const posts =
    entry.postCount === 1 ? "1 publicação" : `${entry.postCount} publicações`;
  return `${people} usaram em ${posts}`;
}

export function TagPicker({
  catalog,
  hint,
  maxTags,
  onChange,
  onCreateTag,
  selectedTags,
  title
}: TagPickerProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalizeTagKey(query);
  const selectedKeys = useMemo(
    () => new Set(selectedTags.map(normalizeTagKey)),
    [selectedTags]
  );
  const suggestions = useMemo(
    () => searchTagCatalog(catalog, normalizedQuery),
    [catalog, normalizedQuery]
  );
  const exactEntry = catalog.find((entry) => entry.key === normalizedQuery);
  const newLabel = normalizeTagLabel(query);
  const canAdd = selectedTags.length < maxTags;

  function toggleTag(label: string) {
    const key = normalizeTagKey(label);
    const existing = selectedTags.find(
      (item) => normalizeTagKey(item) === key
    );
    if (existing) {
      onChange(selectedTags.filter((item) => item !== existing));
      return;
    }
    if (canAdd && key) onChange([...selectedTags, normalizeTagLabel(label)]);
  }

  function createLabel(label: string) {
    const cleanLabel = normalizeTagLabel(label);
    if (!canAdd || !cleanLabel || !normalizeTagKey(cleanLabel)) return;
    toggleTag(cleanLabel);
    setQuery("");
    void Promise.resolve(onCreateTag?.(cleanLabel)).catch(() => undefined);
  }

  function handleQueryChange(value: string) {
    if (/[,;]$/.test(value)) {
      createLabel(value.slice(0, -1));
      return;
    }
    setQuery(value);
  }

  return (
    <View style={styles.tagPicker}>
      <View style={styles.tagPickerHeader}>
        <View style={styles.tagPickerCopy}>
          <Text style={styles.tagPickerTitle}>{title}</Text>
          <Text style={styles.tagPickerHint}>{hint}</Text>
        </View>
        <Text style={styles.tagPickerCount}>
          {selectedTags.length}/{maxTags}
        </Text>
      </View>

      {selectedTags.length > 0 ? (
        <View style={styles.tagPickerSelectedRow}>
          {selectedTags.map((tag) => (
            <Pressable
              accessibilityLabel={`Remover #${tag}`}
              key={normalizeTagKey(tag)}
              onPress={() => toggleTag(tag)}
              style={styles.tagPickerSelectedChip}
            >
              <Text numberOfLines={1} style={styles.tagPickerSelectedText}>
                #{tag}
              </Text>
              <X color={colors.onPrimary} size={13} strokeWidth={2.5} />
            </Pressable>
          ))}
        </View>
      ) : null}

      <View style={styles.tagPickerInputRow}>
        <Search color={colors.muted} size={18} />
        <TextInput
          autoCapitalize="none"
          blurOnSubmit={false}
          maxLength={40}
          onChangeText={handleQueryChange}
          onSubmitEditing={() => createLabel(query)}
          placeholder="Busque ou crie uma hashtag"
          placeholderTextColor={colors.muted}
          returnKeyType="done"
          style={styles.tagPickerInput}
          value={query}
        />
      </View>

      <View style={styles.tagPickerSuggestionList}>
        {newLabel && normalizedQuery && !exactEntry ? (
          <Pressable
            accessibilityRole="button"
            disabled={!canAdd}
            onPress={() => createLabel(newLabel)}
            style={styles.tagPickerSuggestionRow}
          >
            <View style={styles.tagPickerCreateIcon}>
              <Plus color={colors.primaryText} size={17} strokeWidth={2.5} />
            </View>
            <View style={styles.tagPickerSuggestionCopy}>
              <Text style={styles.tagPickerSuggestionLabel}>
                Criar #{newLabel}
              </Text>
              <Text style={styles.tagPickerSuggestionMeta}>
                Ainda não usada em publicações
              </Text>
            </View>
          </Pressable>
        ) : null}
        {suggestions.map((entry) => {
          const selected = selectedKeys.has(entry.key);
          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{
                checked: selected,
                disabled: !selected && !canAdd
              }}
              disabled={!selected && !canAdd}
              key={entry.key}
              onPress={() => toggleTag(entry.label)}
              style={styles.tagPickerSuggestionRow}
            >
              <View style={styles.tagPickerSuggestionCopy}>
                <Text style={styles.tagPickerSuggestionLabel}>
                  #{entry.label}
                </Text>
                <Text style={styles.tagPickerSuggestionMeta}>
                  {getUsageLabel(entry)}
                </Text>
              </View>
              <View
                style={[
                  styles.tagPickerCheck,
                  selected ? styles.tagPickerCheckSelected : null
                ]}
              >
                {selected ? (
                  <Text style={styles.tagPickerCheckText}>✓</Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}