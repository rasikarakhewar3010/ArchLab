/**
 * API Service — Frontend ↔ Django Backend Communication
 * =======================================================
 * Centralized API client for all backend requests.
 * Uses fetch() with JSON headers.
 *
 * In development, Vite proxies `/api` → Django (localhost:8000).
 * For now, we also support a standalone mock mode so the frontend
 * works without the backend running.
 */

import type { Challenge, ChallengeAttempt, AIFeedback } from '../types';

const API_BASE = '/api';

// ===== Auth Token Management =====

let authToken: string | null = localStorage.getItem('archlab_token');

/** Set the auth token (called after login/register) */
export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('archlab_token', token);
  } else {
    localStorage.removeItem('archlab_token');
  }
}

/** Get CSRF token from cookies (needed for session-based auth fallback) */
function getCSRFToken(): string | null {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : null;
}

// ===== Generic Fetcher =====

/** Generic JSON fetcher with error handling, auth, and CSRF support */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  // Add auth token if available
  if (authToken) {
    headers['Authorization'] = `Token ${authToken}`;
  }

  // Add CSRF token for state-changing requests (POST, PUT, PATCH, DELETE)
  const method = options?.method?.toUpperCase() || 'GET';
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      headers['X-CSRFToken'] = csrfToken;
    }
  }

  const res = await fetch(`${API_BASE}${url}`, {
    credentials: 'include',  // Include cookies for session auth
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API Error ${res.status}: ${errorBody}`);
  }

  return res.json();
}

// ===== Pagination Helper =====

/** DRF paginated response shape */
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Fetch all items from a paginated endpoint (extracts from `results` array) */
async function apiFetchList<T>(url: string, options?: RequestInit): Promise<T[]> {
  const response = await apiFetch<PaginatedResponse<T> | T[]>(url, options);

  // Handle both paginated and non-paginated responses
  if (Array.isArray(response)) {
    return response;
  }
  return response.results;
}

// ===== Challenges API =====

/** Fetch all challenges (list view) */
export async function getChallenges(): Promise<Challenge[]> {
  return apiFetchList<Challenge>('/challenges/');
}

/** Fetch a single challenge by slug (detail view) */
export async function getChallenge(slug: string): Promise<Challenge> {
  return apiFetch<Challenge>(`/challenges/${slug}/`);
}

/** Start a challenge attempt */
export async function startChallenge(slug: string): Promise<ChallengeAttempt> {
  return apiFetch<ChallengeAttempt>(`/challenges/${slug}/start/`, {
    method: 'POST',
  });
}

/** Submit a challenge attempt for AI scoring */
export async function submitChallenge(
  slug: string,
  attemptId: string,
  designData: { nodes: unknown[]; edges: unknown[] }
): Promise<ChallengeAttempt> {
  return apiFetch<ChallengeAttempt>(`/challenges/${slug}/submit/`, {
    method: 'POST',
    body: JSON.stringify({
      attempt_id: attemptId,
      design: designData,
    }),
  });
}

/** Get the reference solution (only available after submission) */
export async function getChallengeSolution(slug: string): Promise<{
  reference_architecture: unknown;
  reference_explanation: string;
}> {
  return apiFetch(`/challenges/${slug}/solution/`);
}

// ===== AI Analyzer API =====

/** Analyze a design with the AI engine */
export async function analyzeDesign(
  nodes: unknown[],
  edges: unknown[]
): Promise<AIFeedback> {
  return apiFetch<AIFeedback>('/ai/analyze/', {
    method: 'POST',
    body: JSON.stringify({ nodes, edges }),
  });
}

// ===== User Auth API =====

/** Register a new user */
export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}) {
  return apiFetch('/users/register/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Get current user's profile */
export async function getCurrentUser() {
  return apiFetch('/users/me/');
}
