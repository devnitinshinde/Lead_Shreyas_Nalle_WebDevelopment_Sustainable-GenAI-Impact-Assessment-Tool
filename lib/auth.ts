export const AUTH_COOKIE = "zion_auth";
export const ONBOARDED_COOKIE = "zion_onboarded";

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const ONBOARDING_STORAGE_KEY = "blissful_turtle_onboarding";

export type OrganizationSize = "1-10" | "11-50" | "51-200" | "200+";
export type Provider = "OpenAI" | "Anthropic" | "Google" | "Azure" | "Other";

export type UserProfile = {
  uid: string;
  fullName: string;
  workEmail: string;
  organizationName: string;
  organizationSize: OrganizationSize;
  industry: string;
  countryRegion: string;
  intendedProviders: Provider[];
  onboarded: boolean;
  createdAt: any;
};

export type OnboardingState = {
  providerApiKeys: Record<string, string>;
  ecoTrackApiKey: string;
  projectName: string;
  description: string;
  environment: string;
};

function setCookie(name: string, value: string, maxAge: number): void {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const cookie = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split("=")[1] ?? "") : null;
}

export function setSession(isOnboarded: boolean): void {
  setCookie(AUTH_COOKIE, "1", SESSION_TTL_SECONDS);
  setCookie(ONBOARDED_COOKIE, isOnboarded ? "1" : "0", SESSION_TTL_SECONDS);
}

export function clearSession(): void {
  setCookie(AUTH_COOKIE, "0", 0);
  setCookie(ONBOARDED_COOKIE, "0", 0);
}

export function isAuthenticated(): boolean {
  return getCookie(AUTH_COOKIE) === "1";
}

export function isOnboarded(): boolean {
  return getCookie(ONBOARDED_COOKIE) === "1";
}

export function saveOnboardingState(state: OnboardingState): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(state));
}

export function getOnboardingState(): OnboardingState | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return null;
  }
}

export function generateEcoTrackKey(): string {
  const seed = Math.random().toString(36).slice(2, 10).toUpperCase();
  const suffix = Date.now().toString(36).toUpperCase();
  return `eco_${seed}_${suffix}`;
}
