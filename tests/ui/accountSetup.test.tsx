import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react-native";
import { AccountSetupScreen } from "../../src/screens/AccountSetupScreen";
import { onboardingAccount } from "../../src/features/auth/application/accountView";
import { normalizeProfileWrite } from "../../src/features/profiles/application/saveProfile";
import type { AccountProfile, AppUser } from "../../src/types";

jest.mock("expo-image-picker", () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));
const user: AppUser = onboardingAccount({
  uid: "new-profile",
  provider: "password",
  email: "new-profile@example.test",
  emailVerified: true,
  displayName: "",
  photoURL: "",
  acceptedTerms: true,
});
const catalog = [
  { key: "arte", label: "Arte", postCount: 0, creatorCount: 0 },
  { key: "tecnologia", label: "Tecnologia", postCount: 0, creatorCount: 0 },
];
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

async function next() {
  fireEvent.press(screen.getByRole("button", { name: "Continuar" }));
  await act(async () => {
    jest.runAllTimers();
  });
}

function setup(
  onSave: (profile: AccountProfile) => Promise<boolean> = jest.fn(async () => true),
  account = user,
) {
  return render(
    <AccountSetupScreen
      accounts={[]}
      user={account}
      tagCatalog={catalog}
      onSave={onSave}
      isInitialSetup
    />,
  );
}
function fillIdentity() {
  fireEvent.changeText(screen.getByPlaceholderText("Como você quer ser identificado"), "Ana Folko");
  fireEvent.changeText(screen.getByPlaceholderText("seu.username"), "ana.folko");
  fireEvent.changeText(screen.getByPlaceholderText("18"), "28");
  fireEvent.changeText(screen.getByPlaceholderText("Cidade, UF"), "Recife, PE");
}

test("cadastro usa somente hashtags para interesses e conclui sem área duplicada", async () => {
  const save = jest.fn(async (profile: AccountProfile) => {
    normalizeProfileWrite(user.id, profile);
    return true;
  });
  setup(save);
  expect(screen.getByText(/identificar você no Folko/)).toBeTruthy();
  expect(screen.getByRole("button", { name: "Continuar" })).toBeDisabled();
  fillIdentity();
  await next();
  expect(screen.getByText("Conte um pouco sobre você")).toBeTruthy();
  expect(screen.queryByText("Modalidade")).toBeNull();
  expect(screen.queryByText("Função ou especialidade")).toBeNull();
  expect(screen.queryByText("Futebol")).toBeNull();
  expect(screen.queryByLabelText("Área de interesse")).toBeNull();
  expect(screen.queryByText("Escolha rápida")).toBeNull();
  fireEvent.press(screen.getByRole("button", { name: "Perfil pessoal" }));
  fireEvent.changeText(
    screen.getByPlaceholderText("Conte brevemente quem você é e o que publica."),
    "Compartilho arte e ideias do dia a dia.",
  );
  await next();
  expect(screen.getByText("Monte seu Para você")).toBeTruthy();
  expect(screen.getByRole("button", { name: "Concluir perfil" })).toBeDisabled();
  fireEvent.press(screen.getByRole("checkbox", { name: /#Arte/ }));
  fireEvent.press(screen.getByRole("checkbox", { name: /#Tecnologia/ }));
  await act(async () => fireEvent.press(screen.getByRole("button", { name: "Concluir perfil" })));
  expect(save).toHaveBeenCalledTimes(1);
  expect(save.mock.calls[0][0]).toMatchObject({
    username: "ana.folko",
    sport: "",
    position: "Perfil pessoal",
    club: "",
    interestTags: ["Arte", "Tecnologia"],
  });
});

test("edição preserva valores existentes e texto livre, erro de gravação mantém o formulário", async () => {
  const account = {
    ...user,
    name: "Pessoa Existente",
    username: "pessoa.existente",
    age: 25,
    city: "Salvador, BA",
    sport: "Futebol",
    position: "Centroavante",
    club: "Projeto existente",
    bio: "Biografia já cadastrada.",
    interestTags: ["Arte"],
  };
  const save = jest.fn(async () => false);
  setup(save, account);
  await next();
  expect(screen.queryByLabelText("Área de interesse")).toBeNull();
  expect(screen.getByLabelText("Como você se apresenta").props.value).toBe("Centroavante");
  expect(screen.getByLabelText("Marca, projeto ou organização (opcional)").props.value).toBe(
    "Projeto existente",
  );
  fireEvent.changeText(
    screen.getByLabelText("Como você se apresenta"),
    "Compartilho minhas criações",
  );
  await next();
  await act(async () => fireEvent.press(screen.getByRole("button", { name: "Concluir perfil" })));
  expect(save).toHaveBeenCalledWith(
    expect.objectContaining({ sport: "Futebol", interestTags: ["Arte"] }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Revise os dados e tente salvar novamente.");
  expect(screen.getByRole("button", { name: "Concluir perfil" })).toBeEnabled();
});
