import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createSessionController } from "../application/sessionController";
import type { SessionRepository } from "../application/sessionRepository";

const SessionContext = createContext<ReturnType<typeof createSessionController> | null>(null);

export function SessionProvider({
  repository,
  children,
}: {
  repository: SessionRepository;
  children?: ReactNode;
}) {
  const controller = useMemo(() => createSessionController(repository), [repository]);
  useEffect(() => {
    controller.start();
    return () => controller.stop();
  }, [controller]);
  return <SessionContext.Provider value={controller}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const controller = useContext(SessionContext);
  if (!controller) throw new Error("useSession requer SessionProvider.");
  const state = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
    controller.getSnapshot,
  );
  return { ...state, replaceAccount: controller.replaceAccount };
}
