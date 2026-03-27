"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type TypingSpeed = number | [number, number];

type TypewriterStreamProps = {
  text?: string;
  chunks?: string[];
  speed?: TypingSpeed;
  className?: string;
  cursorClassName?: string;
  highlightTerms?: string[];
  highlightClassName?: string;
};

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
  highlightTerms,
  highlightClassName = "text-emerald-300 font-medium",
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

  const renderedText = useMemo(() => {
    if (!highlightTerms || highlightTerms.length === 0) {
      return <span>{displayed}</span>;
    }

    const cleanTerms = highlightTerms
      .map((term) => term.trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    if (cleanTerms.length === 0) {
      return <span>{displayed}</span>;
    }

    const regex = new RegExp(`(${cleanTerms.map(escapeRegExp).join("|")})`, "gi");
    const parts = displayed.split(regex);

    return (
      <>
        {parts.map((part, index) => {
          if (!part) {
            return null;
          }

          const isMatch = cleanTerms.some((term) => term.toLowerCase() === part.toLowerCase());
          return isMatch ? (
            <span key={`h-${index}`} className={highlightClassName}>
              {part}
            </span>
          ) : (
            <span key={`t-${index}`}>{part}</span>
          );
        })}
      </>
    );
  }, [displayed, highlightClassName, highlightTerms]);

  return (
    <p className={className}>
      {renderedText}
      <span className={`typing-cursor ${cursorClassName ?? ""}`} aria-hidden="true">
        |
      </span>
    </p>
  );
}
