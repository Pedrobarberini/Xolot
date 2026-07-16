import React, { useEffect, useMemo, useState } from "react";
import { Image, ImageStyle, StyleProp } from "react-native";
import { ProfileAvatar } from "../types";
import { AVATAR_DISPLAY_SCALE } from "../utils/avatarFocus";

function getStoredAspectRatio(avatar: ProfileAvatar) {
  if (avatar.sourceWidth && avatar.sourceHeight) {
    return avatar.sourceWidth / avatar.sourceHeight;
  }

  return 1;
}

export function ProfileAvatarImage({
  avatar,
  style
}: {
  avatar: ProfileAvatar;
  style?: StyleProp<ImageStyle>;
}) {
  const [aspectRatio, setAspectRatio] = useState(() =>
    getStoredAspectRatio(avatar)
  );

  useEffect(() => {
    const storedAspectRatio = getStoredAspectRatio(avatar);

    if (avatar.sourceWidth && avatar.sourceHeight) {
      setAspectRatio(storedAspectRatio);
      return;
    }

    let isMounted = true;

    Image.getSize(
      avatar.uri,
      (width, height) => {
        if (isMounted && width > 0 && height > 0) {
          setAspectRatio(width / height);
        }
      },
      () => undefined
    );

    return () => {
      isMounted = false;
    };
  }, [avatar.sourceHeight, avatar.sourceWidth, avatar.uri]);

  const positionedStyle = useMemo<ImageStyle>(() => {
    const safeAspectRatio = Math.max(aspectRatio, 0.01);
    const widthPercent =
      (safeAspectRatio >= 1 ? safeAspectRatio * 100 : 100) *
      AVATAR_DISPLAY_SCALE;
    const heightPercent =
      (safeAspectRatio >= 1 ? 100 : (1 / safeAspectRatio) * 100) *
      AVATAR_DISPLAY_SCALE;
    const horizontalOverflow = Math.max(widthPercent - 100, 0);
    const verticalOverflow = Math.max(heightPercent - 100, 0);

    return {
      height: `${heightPercent}%`,
      left: `${-(horizontalOverflow * avatar.focusX) / 100}%`,
      position: "absolute",
      top: `${-(verticalOverflow * avatar.focusY) / 100}%`,
      width: `${widthPercent}%`
    };
  }, [aspectRatio, avatar.focusX, avatar.focusY]);

  return (
    <Image
      accessibilityIgnoresInvertColors
      resizeMode="stretch"
      source={{ uri: avatar.uri }}
      style={[positionedStyle, style]}
    />
  );
}
