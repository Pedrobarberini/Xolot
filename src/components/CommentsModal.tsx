import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CornerUpLeft,
  MessageCircle,
  Send,
  Trash2,
  X
} from "lucide-react-native";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type { AppUser, PostComment, ProfileAvatarsByProfile } from "../types";
import {
  buildPostCommentThreads,
  formatPostCommentAge,
  MAX_POST_COMMENT_LENGTH
} from "../utils/postComments";
import {
  findActiveMention,
  insertMentionSuggestion,
  selectMentionCandidates
} from "../utils/submissionMetadata";
import { MentionSuggestionsPopover } from "./MentionSuggestionsPopover";
import { ProfileAvatarImage } from "./ProfileAvatarImage";

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function renderMentionedCommentBody(
  body: string,
  users: AppUser[],
  onOpenAuthor: (userId: string) => void
) {
  const nodes: React.ReactNode[] = [];
  const pattern = /(^|[\s([{])@([\p{L}\p{N}._-]+)/gu;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(body))) {
    const boundary = match[1] ?? "";
    const username = match[2] ?? "";
    const mentionStart = match.index + boundary.length;
    if (mentionStart > cursor) nodes.push(body.slice(cursor, mentionStart));

    const account = users.find(
      (user) =>
        user.username.toLocaleLowerCase("pt-BR") ===
        username.toLocaleLowerCase("pt-BR")
    );
    const token = `@${username}`;
    nodes.push(
      <Text
        key={`${mentionStart}-${username}`}
        onPress={account ? () => onOpenAuthor(account.id) : undefined}
        style={account ? styles.commentReplyMention : undefined}
      >
        {token}
      </Text>
    );
    cursor = mentionStart + token.length;
  }

  if (cursor < body.length) nodes.push(body.slice(cursor));
  return nodes.length > 0 ? nodes : body;
}

export function CommentsModal({
  comments,
  currentUserId,
  onAddComment,
  onClose,
  onDeleteComment,
  onOpenAuthor,
  profileAvatars,
  users,
  videoId,
  videoTitle,
  visible
}: {
  comments: PostComment[];
  currentUserId: string;
  onAddComment: (body: string, replyToCommentId?: string) => boolean;
  onClose: () => void;
  onDeleteComment: (commentId: string) => void;
  onOpenAuthor: (userId: string) => void;
  profileAvatars: ProfileAvatarsByProfile;
  users: AppUser[];
  videoId: string;
  videoTitle: string;
  visible: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [pendingDeleteComment, setPendingDeleteComment] =
    useState<PostComment | null>(null);
  const [replyTarget, setReplyTarget] = useState<PostComment | null>(null);
  const [expandedThreadIds, setExpandedThreadIds] = useState<string[]>([]);
  const [selection, setSelection] = useState({ end: 0, start: 0 });
  const inputRef = useRef<TextInput | null>(null);
  const canSubmit = draft.trim().length > 0;
  const activeMention = useMemo(
    () => findActiveMention(draft, selection.start),
    [draft, selection.start]
  );
  const mentionCandidates = useMemo(
    () =>
      activeMention
        ? selectMentionCandidates(
            users,
            currentUserId,
            activeMention.query,
            50,
            true
          )
        : [],
    [activeMention, currentUserId, users]
  );
  const commentThreads = useMemo(
    () => buildPostCommentThreads(comments),
    [comments]
  );
  const repliesByParent = useMemo(
    () =>
      Object.fromEntries(
        commentThreads.map(({ comment, replies }) => [comment.id, replies])
      ) as Record<string, PostComment[]>,
    [commentThreads]
  );
  const orderedComments = useMemo(
    () =>
      commentThreads.flatMap(({ comment, replies }) => [
        comment,
        ...(expandedThreadIds.includes(comment.id) ? replies : [])
      ]),
    [commentThreads, expandedThreadIds]
  );

  useEffect(() => {
    if (!visible) {
      setDraft("");
      setSelection({ end: 0, start: 0 });
      setPendingDeleteComment(null);
      setReplyTarget(null);
      setExpandedThreadIds([]);
    }
  }, [videoId, visible]);

  function submitComment() {
    const replyThreadId =
      replyTarget?.parentCommentId ?? replyTarget?.id;

    if (canSubmit && onAddComment(draft, replyTarget?.id)) {
      setDraft("");
      setSelection({ end: 0, start: 0 });
      setReplyTarget(null);
      if (replyThreadId) {
        setExpandedThreadIds((current) =>
          current.includes(replyThreadId)
            ? current
            : [...current, replyThreadId]
        );
      }
    }
  }

  function startReply(comment: PostComment) {
    setReplyTarget(comment);
    inputRef.current?.focus();
  }

  function selectMention(account: { username: string }) {
    if (!activeMention) return;
    const insertion = insertMentionSuggestion(
      draft,
      account.username,
      activeMention
    );
    setDraft(insertion.value);
    setSelection({ end: insertion.cursor, start: insertion.cursor });
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function toggleThread(commentId: string) {
    setExpandedThreadIds((current) =>
      current.includes(commentId)
        ? current.filter((id) => id !== commentId)
        : [...current, commentId]
    );
  }

  function deletePendingComment() {
    if (!pendingDeleteComment) {
      return;
    }

    onDeleteComment(pendingDeleteComment.id);
    if (replyTarget?.id === pendingDeleteComment.id) {
      setReplyTarget(null);
    }
    setPendingDeleteComment(null);
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.commentsModalRoot}>
        <Pressable
          accessibilityLabel="Fechar comentários"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.commentsBackdrop}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.commentsKeyboardArea}
        >
          <View accessibilityViewIsModal style={styles.commentsSheet}>
            <View style={styles.commentsHeader}>
              <View style={styles.commentsHeaderIcon}>
                <MessageCircle color={colors.primaryText} size={19} />
              </View>
              <View style={styles.commentsHeaderText}>
                <Text style={styles.commentsTitle}>Comentários</Text>
                <Text numberOfLines={1} style={styles.commentsSubtitle}>
                  {comments.length} {comments.length === 1 ? "comentário" : "comentários"} · {videoTitle}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Fechar"
                hitSlop={8}
                onPress={onClose}
                style={styles.commentsCloseButton}
              >
                <X color={colors.muted} size={20} />
              </Pressable>
            </View>

            {comments.length > 0 ? (
              <ScrollView
                contentContainerStyle={styles.commentsList}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                style={styles.commentsScroll}
              >
                {orderedComments.map((comment) => {
                  const avatar = profileAvatars[comment.authorProfileId];
                  const isOwner = comment.authorUserId === currentUserId;
                  const isReply = Boolean(comment.parentCommentId);
                  const replyCount = repliesByParent[comment.id]?.length ?? 0;
                  const isThreadExpanded = expandedThreadIds.includes(comment.id);
                  const replyToggleLabel = isThreadExpanded
                    ? "Ocultar respostas"
                    : replyCount === 1
                      ? "Ver 1 resposta"
                      : `Ver ${replyCount} respostas`;

                  return (
                    <View
                      key={comment.id}
                      style={[
                        styles.commentRow,
                        isReply ? styles.commentReplyRow : null
                      ]}
                    >
                      <Pressable
                        accessibilityLabel={`Abrir perfil de ${comment.authorName}`}
                        accessibilityRole="button"
                        onPress={() => onOpenAuthor(comment.authorUserId)}
                        style={[
                          styles.commentAvatar,
                          isReply ? styles.commentReplyAvatar : null
                        ]}
                      >
                        {avatar ? (
                          <ProfileAvatarImage avatar={avatar} />
                        ) : (
                          <Text style={styles.commentAvatarText}>
                            {getInitials(comment.authorName)}
                          </Text>
                        )}
                      </Pressable>
                      <View style={styles.commentBody}>
                        <View style={styles.commentIdentityRow}>
                          <Pressable
                            accessibilityLabel={`Abrir perfil de ${comment.authorName}`}
                            accessibilityRole="button"
                            onPress={() => onOpenAuthor(comment.authorUserId)}
                            style={styles.commentIdentityButton}
                          >
                            <Text numberOfLines={1} style={styles.commentUsername}>
                              {comment.authorUsername
                                ? `@${comment.authorUsername}`
                                : comment.authorName}
                            </Text>
                            {comment.authorUsername ? (
                              <Text numberOfLines={1} style={styles.commentAuthorName}>
                                {comment.authorName}
                              </Text>
                            ) : null}
                          </Pressable>
                          <Text style={styles.commentTime}>
                            {formatPostCommentAge(comment.createdAt)}
                          </Text>
                        </View>
                        <Text style={styles.commentText}>
                          {comment.replyToUsername ? (
                            <Text
                              onPress={() =>
                                comment.replyToUserId
                                  ? onOpenAuthor(comment.replyToUserId)
                                  : undefined
                              }
                              style={styles.commentReplyMention}
                            >
                              @{comment.replyToUsername}{" "}
                            </Text>
                          ) : null}
                          {renderMentionedCommentBody(comment.body, users, onOpenAuthor)}
                        </Text>
                        <Pressable
                          accessibilityLabel={`Responder a ${comment.authorName}`}
                          accessibilityRole="button"
                          hitSlop={6}
                          onPress={() => startReply(comment)}
                          style={styles.commentReplyButton}
                        >
                          <CornerUpLeft color={colors.primaryText} size={13} />
                          <Text style={styles.commentReplyButtonText}>Responder</Text>
                        </Pressable>
                        {replyCount > 0 ? (
                          <Pressable
                            accessibilityLabel={replyToggleLabel}
                            accessibilityRole="button"
                            hitSlop={6}
                            onPress={() => toggleThread(comment.id)}
                            style={styles.commentThreadToggle}
                          >
                            <View style={styles.commentThreadToggleLine} />
                            <Text style={styles.commentThreadToggleText}>
                              {replyToggleLabel}
                            </Text>
                          </Pressable>
                        ) : null}
                      </View>
                      {isOwner ? (
                        <Pressable
                          accessibilityLabel="Excluir comentário"
                          accessibilityRole="button"
                          hitSlop={7}
                          onPress={() => setPendingDeleteComment(comment)}
                          style={styles.commentDeleteButton}
                        >
                          <Trash2 color={colors.muted} size={17} />
                        </Pressable>
                      ) : null}
                    </View>
                  );
                })}
              </ScrollView>
            ) : (
              <View style={styles.commentsEmptyState}>
                <View style={styles.commentsEmptyIcon}>
                  <MessageCircle color={colors.primaryText} size={25} />
                </View>
                <Text style={styles.commentsEmptyTitle}>Inicie a conversa</Text>
                <Text style={styles.commentsEmptyBody}>
                  Seja a primeira pessoa a comentar nesta publicação.
                </Text>
              </View>
            )}

            {replyTarget ? (
              <View style={styles.commentReplyTarget}>
                <Text numberOfLines={1} style={styles.commentReplyTargetText}>
                  Respondendo a @{replyTarget.authorUsername || replyTarget.authorName}
                </Text>
                <Pressable
                  accessibilityLabel="Cancelar resposta"
                  hitSlop={7}
                  onPress={() => setReplyTarget(null)}
                  style={styles.commentReplyTargetClose}
                >
                  <X color={colors.muted} size={16} />
                </Pressable>
              </View>
            ) : null}

            <View style={styles.commentComposerArea}>
              <MentionSuggestionsPopover
                candidates={mentionCandidates}
                onSelect={selectMention}
                placement="above"
                profileAvatars={profileAvatars}
                visible={Boolean(activeMention)}
              />
              <View style={styles.commentComposer}>
              <TextInput
                accessibilityLabel="Escrever comentário"
                maxLength={MAX_POST_COMMENT_LENGTH}
                multiline
                onChangeText={setDraft}
                onSelectionChange={(event) =>
                  setSelection(event.nativeEvent.selection)
                }
                onKeyPress={(event) => {
                  const isShiftPressed =
                    "shiftKey" in event.nativeEvent &&
                    Boolean(event.nativeEvent.shiftKey);

                  if (
                    Platform.OS === "web" &&
                    event.nativeEvent.key === "Enter" &&
                    !isShiftPressed
                  ) {
                    event.preventDefault();
                    submitComment();
                  }
                }}
                onSubmitEditing={submitComment}
                placeholder={replyTarget ? "Escreva sua resposta..." : "Adicione um comentário..."}
                ref={inputRef}
                selection={selection}
                placeholderTextColor={colors.muted}
                returnKeyType="send"
                style={styles.commentInput}
                submitBehavior="submit"
                value={draft}
              />
              <Pressable
                accessibilityLabel="Publicar comentário"
                accessibilityRole="button"
                disabled={!canSubmit}
                onPress={submitComment}
                style={[
                  styles.commentSendButton,
                  !canSubmit ? styles.commentSendButtonDisabled : null
                ]}
              >
                <Send color={colors.onPrimary} size={18} />
              </Pressable>
              </View>
            </View>

            {pendingDeleteComment ? (
              <View style={styles.commentDeleteConfirmationOverlay}>
                <Pressable
                  accessibilityLabel="Cancelar exclusão"
                  onPress={() => setPendingDeleteComment(null)}
                  style={styles.commentDeleteConfirmationBackdrop}
                />
                <View style={styles.commentDeleteConfirmationCard}>
                  <Text style={styles.commentDeleteConfirmationTitle}>
                    Excluir comentário?
                  </Text>
                  <Text style={styles.commentDeleteConfirmationBody}>
                    Esta ação remove definitivamente o comentário desta publicação.
                  </Text>
                  <View style={styles.commentDeleteConfirmationActions}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setPendingDeleteComment(null)}
                      style={styles.commentDeleteCancelButton}
                    >
                      <Text style={styles.commentDeleteCancelText}>Cancelar</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      onPress={deletePendingComment}
                      style={styles.commentDeleteConfirmButton}
                    >
                      <Trash2 color={colors.onPrimary} size={16} />
                      <Text style={styles.commentDeleteConfirmText}>Excluir</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}