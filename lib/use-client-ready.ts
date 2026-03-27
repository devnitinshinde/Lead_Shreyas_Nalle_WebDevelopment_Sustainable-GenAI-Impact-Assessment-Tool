"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => {
  return () => {};
};

const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function useClientReady(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
