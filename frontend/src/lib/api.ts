const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string;
}

function buildQuery(params?: Record<string, string | number | undefined>): string {
  if (!params) return "";
  const qs = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== null && val !== "") {
      qs.set(key, String(val));
    }
  }
  const str = qs.toString();
  return str ? `?${str}` : "";
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
export const getPrompts = (params?: { search?: string; page?: number; limit?: number }) =>
  apiFetch(`/api/prompts${buildQuery(params)}`);

export const getPrompt = (id: number) => apiFetch(`/api/prompts/${id}`);

// Guides
export const getGuides = (params?: { search?: string; page?: number; limit?: number }) =>
  apiFetch(`/api/guides${buildQuery(params)}`);

export const getGuide = (id: number) => apiFetch(`/api/guides/${id}`);

// Agents & Rulesets
export const getAgents = (params?: { search?: string; page?: number; limit?: number }) =>
  apiFetch(`/api/agents${buildQuery(params)}`);

export const getRulesets = (params?: { search?: string; page?: number; limit?: number }) =>
  apiFetch(`/api/rulesets${buildQuery(params)}`);

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
export const getUsers = (token: string, params?: { search?: string; page?: number; limit?: number }) =>
  apiFetch(`/api/users${buildQuery(params)}`, { token });

export const createUser = (
  token: string,
  data: { name: string; email: string; password: string; role: string },
) =>
  apiFetch("/api/users", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });

export const updateUser = (
  token: string,
  id: number,
  data: { role?: string; is_active?: boolean; requires_approval?: boolean },
) =>
  apiFetch(`/api/users/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });

export const deleteUserApi = (token: string, id: number) =>
  apiFetch(`/api/users/${id}`, { method: "DELETE", token });

// Moderation
export const getPendingPrompts = (token: string, params?: { status?: string; search?: string; page?: number; limit?: number }) =>
  apiFetch(`/api/prompts/moderation/pending${buildQuery(params)}`, { token });

export const getPendingGuides = (token: string, params?: { status?: string; search?: string; page?: number; limit?: number }) =>
  apiFetch(`/api/guides/moderation/pending${buildQuery(params)}`, { token });

export const getProposals = (token: string, params?: { status?: string; search?: string; page?: number; limit?: number }) =>
  apiFetch(`/api/proposals${buildQuery(params)}`, { token });

export const updatePromptStatus = (token: string, id: number, status: string) =>
  apiFetch(`/api/prompts/${id}/status?status=${encodeURIComponent(status)}`, { method: "PATCH", token });

export const updateGuideStatus = (token: string, id: number, status: string) =>
  apiFetch(`/api/guides/${id}/status?status=${encodeURIComponent(status)}`, { method: "PATCH", token });

export const updateProposalStatus = (token: string, id: number, newStatus: string) =>
  apiFetch(`/api/proposals/${id}/status?new_status=${encodeURIComponent(newStatus)}`, { method: "PATCH", token });

// Health
export const healthCheck = () => apiFetch("/api/health");
