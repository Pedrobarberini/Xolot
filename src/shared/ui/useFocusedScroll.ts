import { useCallback, useEffect, useRef } from "react";
import { ScrollView } from "react-native";

// Layout callbacks also cover items mounted after a thread is expanded or fetched.
export function useFocusedScroll(itemId?: string, requestId?: number) {
  const scrollRef = useRef<ScrollView | null>(null);
  const offsets = useRef(new Map<string, number>());
  const frame = useRef<number | null>(null);
  const completedTarget = useRef<string | null>(null);
  const targetKey = useRef("");
  targetKey.current = `${requestId ?? ""}:${itemId ?? ""}`;
  const currentTarget = useRef(itemId);
  currentTarget.current = itemId;

  const scrollToTarget = useCallback(() => {
    if (completedTarget.current === targetKey.current) return;
    const offset = currentTarget.current ? offsets.current.get(currentTarget.current) : undefined;
    if (offset === undefined) return;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      if (!scrollRef.current) return;
      scrollRef.current?.scrollTo({ animated: false, y: Math.max(0, offset - 12) });
      completedTarget.current = targetKey.current;
    });
  }, []);

  useEffect(() => {
    scrollToTarget();
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [itemId, requestId, scrollToTarget]);

  function onItemLayout(id: string, y: number) {
    offsets.current.set(id, y);
    if (id === currentTarget.current) scrollToTarget();
  }

  return { onItemLayout, scrollRef, scrollToTarget };
}
