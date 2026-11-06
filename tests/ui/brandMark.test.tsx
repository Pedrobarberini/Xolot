import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Image, StyleSheet } from "react-native";
import { BrandMark } from "../../src/shared/ui/BrandMark";
import {
  FOLKO_PRIMARY,
  FOLKO_PRIMARY_ASPECT_RATIO,
  FOLKO_HORIZONTAL,
  FOLKO_HORIZONTAL_ASPECT_RATIO,
  FOLKO_SYMBOL,
} from "../../src/constants/assets";
import { ThemeContext } from "../../src/shared/theme/context";
import { getThemeColors } from "../../src/shared/theme/legacy";

test("cabeçalho compacto usa apenas o mascote transparente", () => {
  const view = render(<BrandMark symbolOnly />);
  expect(view.UNSAFE_getByType(Image).props.source).toBe(FOLKO_SYMBOL);
  expect(screen.getByRole("image", { name: "Logo Folko" })).toHaveStyle({
    width: 48,
    aspectRatio: 1,
  });
});

test.each(["light", "dark"] as const)(
  "header usa assinatura original sem texto recriado no tema %s",
  (mode) => {
    const colors = getThemeColors(mode);
    const view = render(
      <ThemeContext.Provider value={{ colors, themeMode: mode, setThemeMode: jest.fn() }}>
        <BrandMark />
      </ThemeContext.Provider>,
    );
    expect(screen.getByRole("image", { name: "Logo Folko" })).toBeTruthy();
    expect(screen.queryByText("Folko")).toBeNull();
    const image = view.UNSAFE_getByType(Image);
    expect(image.props.source).toBe(FOLKO_HORIZONTAL);
    expect(image.props.resizeMode).toBe("contain");
    expect(StyleSheet.flatten(image.props.style)).toEqual({ width: "100%", height: "100%" });
    expect(screen.getByRole("image", { name: "Logo Folko" })).toHaveStyle({
      aspectRatio: FOLKO_HORIZONTAL_ASPECT_RATIO,
    });
  },
);

test.each(["light", "dark"] as const)(
  "entrada usa o logo completo sem fundo e sem filtros no tema %s",
  (mode) => {
    const view = render(
      <ThemeContext.Provider
        value={{ colors: getThemeColors(mode), themeMode: mode, setThemeMode: jest.fn() }}
      >
        <BrandMark hero />
      </ThemeContext.Provider>,
    );
    expect(screen.getByRole("image", { name: "Logo Folko" })).toBeTruthy();
    const image = view.UNSAFE_getByType(Image);
    expect(image.props.source).toBe(FOLKO_PRIMARY);
    expect(image.props.resizeMode).toBe("contain");
    expect(StyleSheet.flatten(image.props.style)).toMatchObject({ width: "100%", height: "100%" });
    expect(screen.getByRole("image", { name: "Logo Folko" })).toHaveStyle({
      aspectRatio: FOLKO_PRIMARY_ASPECT_RATIO,
    });
    expect(screen.queryByText("Folko")).toBeNull();
  },
);
