import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ProfileVideoGallery } from "../../src/components/ProfileVideoGallery";

jest.mock("expo-video", () => ({ VideoView: "VideoView", useVideoPlayer: jest.fn() }));
const photo = {
  id: "photo",
  title: "Minha publicação",
  uri: "https://example.test/photo.jpg",
  mediaType: "image" as const,
};

test("galeria renderiza título sobre a mídia e abre a publicação correta", () => {
  const open = jest.fn();
  render(
    <ProfileVideoGallery
      videos={[photo]}
      onOpenVideo={open}
      emptyTitle="Sem posts"
      emptyBody="Envie um conteúdo"
    />,
  );
  expect(screen.getByLabelText("Foto publicada")).toBeTruthy();
  expect(screen.getByText(photo.title)).toHaveStyle({
    textShadowColor: "rgba(0, 0, 0, 0.86)",
    textShadowRadius: 3,
  });
  fireEvent.press(screen.getByRole("button", { name: `Abrir ${photo.title} no Início` }));
  expect(open).toHaveBeenCalledWith(photo);
});

test("controle de opções conserva contraste e área compacta sem remover o conteúdo", () => {
  render(
    <ProfileVideoGallery
      videos={[photo]}
      onOpenVideo={jest.fn()}
      onDeleteVideo={jest.fn()}
      emptyTitle="Sem posts"
      emptyBody="Envie um conteúdo"
    />,
  );
  const options = screen.getByRole("button", { name: `Abrir opções de ${photo.title}` });
  expect(options).toHaveStyle({ backgroundColor: "rgba(5, 10, 7, 0.68)", height: 26, width: 26 });
  expect(screen.getByText(photo.title)).toBeTruthy();
});
