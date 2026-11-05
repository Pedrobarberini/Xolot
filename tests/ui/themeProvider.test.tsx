import React from "react";
import { Button, Text } from "react-native";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider, useTheme } from "../../src/ThemeProvider";
import * as legacy from "../../src/shared/theme/legacy";
import {
  themePreferences,
  THEME_STORAGE_KEY,
  type ThemePreferences,
} from "../../src/shared/theme/preferences";
import type { ThemeMode } from "../../src/shared/theme/tokens";
import { LabeledInput } from "../../src/shared/ui/LabeledInput";

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async () => "dark"),
    setItem: jest.fn(async () => undefined),
  },
}));

function Probe() {
  const { themeMode, setThemeMode } = useTheme();
  return (
    <>
      <Text>Modo {themeMode}</Text>
      <LabeledInput label="Nome" accessibilityLabel="Seu nome" />
      <Button title="Usar claro" onPress={() => setThemeMode("light")} />
      <Button title="Usar escuro" onPress={() => setThemeMode("dark")} />
    </>
  );
}

test("restaura antes de exibir e rerender não altera singleton durante render", async () => {
  let restore!: (mode: string) => void;
  const preferences: ThemePreferences = {
    load: () =>
      new Promise((resolve) => {
        restore = resolve;
      }),
    save: jest.fn(async () => undefined),
  };
  const sync = jest.spyOn(legacy, "setActiveThemeMode");
  const view = render(
    <ThemeProvider preferences={preferences}>
      <Probe />
    </ThemeProvider>,
  );
  expect(screen.queryByText("Modo dark")).toBeNull();
  expect(sync).not.toHaveBeenCalled();
  await act(async () => restore("dark"));
  expect(screen.getByText("Modo dark")).toBeTruthy();
  expect(screen.getByLabelText("Seu nome")).toHaveStyle({
    backgroundColor: legacy.darkColors.surface,
  });
  expect(sync).toHaveBeenCalledTimes(1);
  view.rerender(
    <ThemeProvider preferences={preferences}>
      <Probe />
    </ThemeProvider>,
  );
  expect(sync).toHaveBeenCalledTimes(1);
  fireEvent.press(screen.getByText("Usar claro"));
  expect(screen.getByText("Modo light")).toBeTruthy();
  expect(screen.getByLabelText("Seu nome")).toHaveStyle({
    backgroundColor: legacy.lightColors.surface,
  });
  expect(preferences.save).toHaveBeenCalledWith("light");
});

test("escolha persiste e é restaurada em nova montagem", async () => {
  let stored: ThemeMode = "dark";
  const preferences: ThemePreferences = {
    load: async () => stored,
    save: jest.fn(async (mode) => {
      stored = mode;
    }),
  };
  const view = render(
    <ThemeProvider preferences={preferences}>
      <Probe />
    </ThemeProvider>,
  );
  await screen.findByText("Modo dark");
  fireEvent.press(screen.getByText("Usar claro"));
  view.unmount();
  render(
    <ThemeProvider preferences={preferences}>
      <Probe />
    </ThemeProvider>,
  );
  expect(await screen.findByText("Modo light")).toBeTruthy();
});

test("resposta de instância desmontada não sobrescreve o tema da instância atual", async () => {
  let resolveOld!: (mode: string) => void;
  const old: ThemePreferences = {
    load: () =>
      new Promise((resolve) => {
        resolveOld = resolve;
      }),
    save: async () => undefined,
  };
  const view = render(
    <ThemeProvider preferences={old}>
      <Probe />
    </ThemeProvider>,
  );
  view.unmount();
  const current: ThemePreferences = { load: async () => "light", save: async () => undefined };
  render(
    <ThemeProvider preferences={current}>
      <Probe />
    </ThemeProvider>,
  );
  await screen.findByText("Modo light");
  await act(async () => resolveOld("dark"));
  expect(legacy.getActiveThemeMode()).toBe("light");
  expect(screen.getByText("Modo light")).toBeTruthy();
});

test("falha de leitura usa escuro; falha de gravação conserva a escolha da sessão", async () => {
  const preferences: ThemePreferences = {
    load: async () => {
      throw new Error("disco indisponível");
    },
    save: async () => {
      throw new Error("sem espaço");
    },
  };
  render(
    <ThemeProvider preferences={preferences}>
      <Probe />
    </ThemeProvider>,
  );
  await screen.findByText("Modo dark");
  await act(async () => fireEvent.press(screen.getByText("Usar claro")));
  expect(screen.getByText("Modo light")).toBeTruthy();
});

test("adaptador conserva a chave legada sem alterar o formato salvo", async () => {
  await themePreferences.load();
  await themePreferences.save("light");
  expect(AsyncStorage.getItem).toHaveBeenCalledWith(THEME_STORAGE_KEY);
  expect(AsyncStorage.setItem).toHaveBeenCalledWith("@xolot/theme-mode-v1", "light");
});
