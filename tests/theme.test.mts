import assert from "node:assert/strict";
import test from "node:test";
import {
  colors,
  createThemedStyles,
  darkColors,
  lightColors,
  normalizeThemeMode,
  setActiveThemeMode
} from "../src/theme.ts";

test("normaliza a preferência persistida de tema", () => {
  assert.equal(normalizeThemeMode("dark"), "dark");
  assert.equal(normalizeThemeMode("light"), "light");
  assert.equal(normalizeThemeMode("desconhecido"), "dark");
  assert.equal(normalizeThemeMode(null), "dark");
});

test("troca cores diretas e estilos compartilhados com a paleta ativa", () => {
  const themedStyles = createThemedStyles({
    action: {
      color: lightColors.onPrimary
    },
    panel: {
      backgroundColor: lightColors.surface,
      borderColor: lightColors.border,
      color: lightColors.text
    }
  });

  try {
    setActiveThemeMode("dark");
    assert.equal(colors.background, darkColors.background);
    assert.deepEqual(themedStyles.panel, {
      backgroundColor: darkColors.surface,
      borderColor: darkColors.border,
      color: darkColors.text
    });
    assert.equal(themedStyles.action.color, darkColors.onPrimary);

    setActiveThemeMode("light");
    assert.equal(colors.background, lightColors.background);
    assert.deepEqual(themedStyles.panel, {
      backgroundColor: lightColors.surface,
      borderColor: lightColors.border,
      color: lightColors.text
    });
  } finally {
    setActiveThemeMode("light");
  }
});
