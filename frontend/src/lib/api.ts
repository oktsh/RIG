const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...rest,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth
export const login = (email: string, password: string) =>
  apiFetch<{ access_token: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const getMe = (token: string) =>
  apiFetch("/api/auth/me", { token });

// Prompts
export const getPrompts = () => apiFetch("/api/prompts");
export const getPrompt = (id: number) => apiFetch(`/api/prompts/${id}`);

// Guides
export const getGuides = () => apiFetch("/api/guides");
export const getGuide = (id: number) => apiFetch(`/api/guides/${id}`);

// Agents & Rulesets
export const getAgents = () => apiFetch("/api/agents");
export const getRulesets = () => apiFetch("/api/rulesets");

// Proposals
export const submitProposal = (data: {
  type: string;
  title: string;
  description: string;
  content: string;
  email: string;
  tags?: string[];
}) =>
  apiFetch("/api/proposals", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Users (admin)
export const getUsers = (token: string) =>
  apiFetch("/api/users", { token });

export const createUser = (
  token: string,
  data: { name: string; email: string; password: string; role: string },
) =>
  apiFetch("/api/users", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });

// Health
export const healthCheck = () => apiFetch("/api/health");
