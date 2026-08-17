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

import type { Challenge, ChallengeAttempt, AIFeedback, User, Design } from '../types';

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

/** Get the current auth token */
export function getAuthToken(): string | null {
  return authToken;
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

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

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

// ===== User Auth API =====

/** Login user — returns token + user */
export async function loginUser(username: string, password: string): Promise<{ token: string; user: User }> {
  return apiFetch('/users/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

/** Register a new user — returns token + user */
export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}): Promise<{ token: string; user: User }> {
  return apiFetch('/users/register/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Get current user's profile */
export async function getCurrentUser(): Promise<User> {
  return apiFetch('/users/me/');
}

/** Update current user's profile */
export async function updateProfile(data: Partial<User>): Promise<User> {
  return apiFetch('/users/me/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ===== Designs API =====

/** List design shape for the gallery */
export interface DesignListItem {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  author_username: string;
  author_avatar: string;
  component_count: number;
  connection_count: number;
  ai_score: number | null;
  is_public: boolean;
  tags: string[];
  stars_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
}

/** Get current user's designs */
export async function getMyDesigns(): Promise<DesignListItem[]> {
  return apiFetchList<DesignListItem>('/designs/my_designs/');
}

/** Get a single design by ID (full detail with nodes/edges) */
export async function getDesign(id: string): Promise<Design> {
  return apiFetch<Design>(`/designs/${id}/`);
}

/** Create a new design */
export async function createDesign(data: {
  title: string;
  description?: string;
  nodes: unknown[];
  edges: unknown[];
  viewport?: { x: number; y: number; zoom: number };
  is_public?: boolean;
  tags?: string[];
}): Promise<Design> {
  return apiFetch<Design>('/designs/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Update an existing design (auto-save) */
export async function updateDesign(id: string, data: {
  title?: string;
  description?: string;
  nodes?: unknown[];
  edges?: unknown[];
  viewport?: { x: number; y: number; zoom: number };
  is_public?: boolean;
  tags?: string[];
}): Promise<Design> {
  return apiFetch<Design>(`/designs/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/** Delete a design */
export async function deleteDesign(id: string): Promise<void> {
  return apiFetch(`/designs/${id}/`, {
    method: 'DELETE',
  });
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
  edges: unknown[],
  designId?: string
): Promise<AIFeedback> {
  return apiFetch<AIFeedback>('/ai/analyze/', {
    method: 'POST',
    body: JSON.stringify({ nodes, edges, design_id: designId }),
  });
}

// ===== Learning Hub API =====

export interface LearningResource {
  id: string;
  title: string;
  slug: string;
  url: string;
  description: string;
  source_type: 'github' | 'article' | 'video' | 'documentation' | 'course';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  topics: string[];
  author_name: string;
  github_stars: number | null;
  estimated_time_minutes: number | null;
  icon: string;
  is_featured: boolean;
  user_status?: 'not_started' | 'in_progress' | 'completed';
}

export interface StudyPath {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  icon: string;
  resource_count: number;
  resources?: LearningResource[];
}

export interface LearningStats {
  total_resources: number;
  completed: number;
  in_progress: number;
  completion_percent: number;
}

/** Get all learning resources */
export async function getResources(): Promise<LearningResource[]> {
  return apiFetchList<LearningResource>('/learning/resources/');
}

/** Get featured resources */
export async function getFeaturedResources(): Promise<LearningResource[]> {
  return apiFetchList<LearningResource>('/learning/resources/featured/');
}

/** Get study paths */
export async function getStudyPaths(): Promise<StudyPath[]> {
  return apiFetchList<StudyPath>('/learning/paths/');
}

/** Mark a resource as complete */
export async function markResourceComplete(resourceId: string) {
  return apiFetch('/learning/progress/mark_complete/', {
    method: 'POST',
    body: JSON.stringify({ resource_id: resourceId }),
  });
}

/** Get learning stats */
export async function getLearningStats(): Promise<LearningStats> {
  return apiFetch<LearningStats>('/learning/progress/stats/');
}
