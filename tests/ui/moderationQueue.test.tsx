import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { ModerationQueue } from "../../src/components/ModerationQueue";
import {
  loadModerationReports,
  resolveModerationReport,
} from "../../src/services/firebaseModerationService";

jest.mock("../../src/services/firebaseModerationService", () => ({
  loadModerationReports: jest.fn(),
  resolveModerationReport: jest.fn(),
}));
const load = jest.mocked(loadModerationReports);
const review = jest.mocked(resolveModerationReport);
const loadApi = async () => ({ loadModerationReports, resolveModerationReport });
test("erro de autorização não mostra conteúdo privado e permite nova tentativa", async () => {
  load.mockRejectedValueOnce(new Error("private reporter identity"));
  const screen = render(<ModerationQueue loadApi={loadApi} />);
  fireEvent.press(screen.getByText("Carregar denúncias"));
  await waitFor(() => expect(screen.getByText(/É necessário acesso de moderação/)).toBeTruthy());
  expect(screen.queryByText("private reporter identity")).toBeNull();
  expect(screen.getByText("Carregar denúncias")).toBeTruthy();
});
test("fila pagina sem perder itens e só remove a denúncia após confirmação do servidor", async () => {
  load
    .mockResolvedValueOnce({
      reports: [
        {
          id: "one",
          postId: "post",
          postTitle: "Publicação sintética",
          reason: "spam",
          status: "open",
          createdAt: null,
        },
      ],
      nextCursor: "one",
    })
    .mockResolvedValueOnce({
      reports: [
        {
          id: "two",
          postId: "post2",
          postTitle: "Segunda publicação",
          reason: "other",
          status: "open",
          createdAt: null,
        },
      ],
      nextCursor: null,
    });
  review.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(undefined);
  const screen = render(<ModerationQueue loadApi={loadApi} />);
  fireEvent.press(screen.getByText("Carregar denúncias"));
  await waitFor(() => expect(screen.getByText("Publicação sintética")).toBeTruthy());
  fireEvent.press(screen.getByText("Carregar mais denúncias"));
  await waitFor(() => expect(screen.getByText("Segunda publicação")).toBeTruthy());
  expect(load).toHaveBeenLastCalledWith("one");
  await act(async () => {
    fireEvent.press(screen.getAllByText("Marcar como revisada")[0]);
  });
  await waitFor(() => expect(screen.getByText(/revisão não foi confirmada/)).toBeTruthy());
  expect(screen.getByText("Publicação sintética")).toBeTruthy();
  await act(async () => {
    fireEvent.press(screen.getAllByText("Marcar como revisada")[0]);
  });
  await waitFor(() => expect(screen.queryByText("Publicação sintética")).toBeNull());
  expect(screen.getByText("Segunda publicação")).toBeTruthy();
});
