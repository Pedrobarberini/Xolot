import {
  CryptoDigestAlgorithm,
  digestStringAsync,
  getRandomBytesAsync
} from "expo-crypto";
import { AppUser } from "../types";

export type PasswordCredential = {
  passwordHash: string;
  passwordSalt: string;
};

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

async function hashPassword(password: string, salt: string) {
  return digestStringAsync(
    CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`
  );
}

export async function createPasswordCredential(
  password: string
): Promise<PasswordCredential> {
  const passwordSalt = bytesToHex(await getRandomBytesAsync(16));
  const passwordHash = await hashPassword(password, passwordSalt);

  return { passwordHash, passwordSalt };
}

export function hasPasswordCredential(
  account: AppUser
): account is AppUser & PasswordCredential {
  return Boolean(account.passwordHash && account.passwordSalt);
}

export async function verifyPassword(account: AppUser, password: string) {
  if (!hasPasswordCredential(account)) {
    return false;
  }

  const candidateHash = await hashPassword(password, account.passwordSalt);
  return candidateHash === account.passwordHash;
}
