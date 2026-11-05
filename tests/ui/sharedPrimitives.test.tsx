import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { BackButton, LabeledInput } from "../../src/components/Navigation";
import { getThemeColors } from "../../src/theme";
import { ThemeContext } from "../../src/shared/theme/context";

test("voltar conserva nome, área de toque, estilo e bloqueio de interação", () => {
  const back = jest.fn();
  const view = render(
    <BackButton accessibilityLabel="Voltar ao perfil" onPress={back} style={{ marginTop: 7 }} />,
  );
  const button = screen.getByRole("button", { name: "Voltar ao perfil" });
  expect(button.props.hitSlop).toBe(8);
  expect(button).toHaveStyle({ width: 40, height: 40, marginTop: 7 });
  fireEvent.press(button);
  expect(back).toHaveBeenCalledTimes(1);
  view.rerender(<BackButton accessibilityLabel="Voltar ao perfil" onPress={back} disabled />);
  expect(screen.getByRole("button", { name: "Voltar ao perfil" })).toBeDisabled();
  fireEvent.press(screen.getByRole("button", { name: "Voltar ao perfil" }));
  expect(back).toHaveBeenCalledTimes(1);
});

test("input mantém props nativas, alteração de texto e precedência de estilo do consumidor", () => {
  const change = jest.fn();
  render(
    <LabeledInput
      label="Biografia"
      accessibilityLabel="Editar biografia"
      value="Texto atual"
      multiline
      onChangeText={change}
      style={{ minHeight: 120 }}
    />,
  );
  expect(screen.getByText("Biografia")).toBeTruthy();
  const input = screen.getByLabelText("Editar biografia");
  expect(input.props.multiline).toBe(true);
  expect(input.props.textAlignVertical).toBe("top");
  expect(input).toHaveStyle({ minHeight: 120 });
  fireEvent.changeText(input, "Nova biografia");
  expect(change).toHaveBeenCalledWith("Nova biografia");
});

test.each(["light", "dark"] as const)("input mantém contraste e dimensão no tema %s", (mode) => {
  render(
    <ThemeContext.Provider
      value={{ colors: getThemeColors(mode), themeMode: mode, setThemeMode: jest.fn() }}
    >
      <LabeledInput label="Nome" accessibilityLabel="Seu nome" />
    </ThemeContext.Provider>,
  );
  expect(screen.getByLabelText("Seu nome")).toHaveStyle({
    minHeight: 48,
    backgroundColor: getThemeColors(mode).surface,
    color: getThemeColors(mode).text,
  });
});
