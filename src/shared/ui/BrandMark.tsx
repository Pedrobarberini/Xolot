import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { BRAND } from "../../config/brand";
import {
  FOLKO_PRIMARY,
  FOLKO_PRIMARY_ASPECT_RATIO,
  FOLKO_HORIZONTAL,
  FOLKO_HORIZONTAL_ASPECT_RATIO,
  FOLKO_SYMBOL,
} from "../../constants/assets";

export function BrandMark({
  hero = false,
  symbolOnly = false,
}: {
  hero?: boolean;
  symbolOnly?: boolean;
}) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Logo ${BRAND.name}`}
      style={[styles.mark, hero && styles.hero, symbolOnly && styles.symbol]}
    >
      <Image
        accessible={false}
        source={symbolOnly ? FOLKO_SYMBOL : hero ? FOLKO_PRIMARY : FOLKO_HORIZONTAL}
        resizeMode="contain"
        style={styles.image}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  mark: { alignSelf: "flex-start", width: 76, aspectRatio: FOLKO_HORIZONTAL_ASPECT_RATIO },
  image: { width: "100%", height: "100%" },
  symbol: { width: 48, aspectRatio: 1 },
  hero: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 140,
    aspectRatio: FOLKO_PRIMARY_ASPECT_RATIO,
    marginVertical: 8,
  },
});
