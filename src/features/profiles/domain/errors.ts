export class UsernameAlreadyInUseError extends Error {
  constructor() {
    super("Este nome de usuário já está em uso.");
    this.name = "UsernameAlreadyInUseError";
  }
}

export class InvalidPublicProfileError extends Error {
  constructor() {
    super("Os dados do perfil não atendem aos limites permitidos.");
    this.name = "InvalidPublicProfileError";
  }
}
