"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type TypingSpeed = number | [number, number];

type TypewriterStreamProps = {
  text?: string;
  chunks?: string[];
  speed?: TypingSpeed;
  className?: string;
  cursorClassName?: string;
};

function getDelay(speed: TypingSpeed): number {
  if (typeof speed === "number") {
    return speed;
  }

  const [min, max] = speed;
  if (min >= max) {
    return min;
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function TypewriterStream({
  text,
  chunks,
  speed = [16, 36],
  className,
  cursorClassName,
}: TypewriterStreamProps) {
  const source = useMemo(() => {
    if (typeof text === "string") {
      return text;
    }
    return (chunks ?? []).join("");
  }, [chunks, text]);

  const [displayed, setDisplayed] = useState("");
  const displayedRef = useRef("");
  const sourceRef = useRef("");
  const queueRef = useRef("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startTyping = useCallback(() => {
    if (timerRef.current) {
      return;
    }

    const tick = () => {
      if (!queueRef.current.length) {
        timerRef.current = null;
        return;
      }

      const nextChar = queueRef.current[0];
      queueRef.current = queueRef.current.slice(1);
      displayedRef.current += nextChar;
      setDisplayed(displayedRef.current);
      timerRef.current = setTimeout(tick, getDelay(speed));
    };

    timerRef.current = setTimeout(tick, getDelay(speed));
  }, [speed]);

  useEffect(() => {
    const previousSource = sourceRef.current;

    if (!source.startsWith(previousSource)) {
      sourceRef.current = source;
      queueRef.current = source;
      displayedRef.current = "";
      queueMicrotask(() => setDisplayed(""));
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      startTyping();
      return;
    }

    const nextChunk = source.slice(previousSource.length);
    sourceRef.current = source;
    if (!nextChunk) {
      return;
    }

    queueRef.current += nextChunk;
    startTyping();
  }, [source, startTyping]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <p className={className}>
      <span>{displayed}</span>
      <span className={`typing-cursor ${cursorClassName ?? ""}`} aria-hidden="true">
        |
      </span>
    </p>
  );
}
