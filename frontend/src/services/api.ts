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

/** Generic JSON fetcher with error handling */
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`API Error ${res.status}: ${errorBody}`);
  }

  return res.json();
}

// ===== Challenges API =====

/** Fetch all challenges (list view) */
export async function getChallenges(): Promise<Challenge[]> {
  return apiFetch<Challenge[]>('/challenges/');
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
