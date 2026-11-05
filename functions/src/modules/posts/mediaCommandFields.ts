export const mediaCommandFields = {
  create: ["fileName", "fileSize", "mediaType", "mimeType", "postId"],
  finalize: [
    "description",
    "durationMs",
    "height",
    "mentions",
    "tags",
    "title",
    "uploadId",
    "width",
  ],
  delete: ["postId"],
} as const;
