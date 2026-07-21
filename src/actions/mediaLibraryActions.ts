import * as MediaLibrary from "expo-media-library";
import { Platform } from "react-native";
import type { SubmissionMediaType } from "../types";

export type GalleryMediaPreview = {
  durationMs?: number;
  fileName: string;
  height?: number;
  mediaType: SubmissionMediaType;
  uri: string;
  width?: number;
};

const galleryPermissions: MediaLibrary.GranularPermission[] = [
  "photo",
  "video"
];

export async function getLatestGalleryMedia(): Promise<GalleryMediaPreview | null> {
  if (Platform.OS === "web" || !(await MediaLibrary.isAvailableAsync())) {
    return null;
  }

  const permission = await MediaLibrary.getPermissionsAsync(
    false,
    galleryPermissions
  );

  if (!permission.granted) {
    return null;
  }

  const { assets } = await MediaLibrary.getAssetsAsync({
    first: 1,
    mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
    sortBy: [[MediaLibrary.SortBy.creationTime, false]]
  });
  const asset = assets[0];

  if (!asset) {
    return null;
  }

  const mediaType: SubmissionMediaType =
    asset.mediaType === MediaLibrary.MediaType.video ? "video" : "image";

  return {
    durationMs:
      mediaType === "video" ? Math.round(asset.duration * 1000) : undefined,
    fileName: asset.filename,
    height: asset.height,
    mediaType,
    uri: asset.uri,
    width: asset.width
  };
}
