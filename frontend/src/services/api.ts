/**
 * API Service for AI Citizen OS Backend Integration
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface ChatMessagePayload {
  message: string;
  session_id?: string;
  state?: string;
  district?: string;
  occupation?: string;
  income?: string;
  age?: number | string;
  gender?: string;
  category?: string;
  language?: string;
}

export interface RAGResponseEnvelope {
  session_id?: string;
  query: string;
  response: string;
  language?: { code: string; name: string; confidence: number };
  intent?: { intent: string; confidence: number };
  entities?: {
    state?: string;
    district?: string;
    occupation?: string;
    category?: string;
    income?: string;
    age?: number;
    gender?: string;
  };
  confidence: {
    score: number;
    score_percentage: string;
    level: string;
    reason: string;
    metrics?: {
      similarity: number;
      keyword: number;
      state_match: number;
      freshness: number;
      sources_count: number;
    };
  };
  citations: Array<{
    scheme_id: string;
    scheme_name: string;
    category: string;
    jurisdiction: string;
    state?: string;
    official_url: string;
    last_verified_date?: string;
    relevance_score: number;
  }>;
  evidence: {
    matched_schemes: Array<any>;
    scheme_count: number;
  };
  disclaimer?: string;
}

export async function sendChatMessage(payload: ChatMessagePayload): Promise<RAGResponseEnvelope> {
  try {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`API Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Backend Chat API call error:', error);
    throw error;
  }
}

export async function fetchSourcesList(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    return await res.json();
  } catch (error) {
    console.error('Backend Sources API call error:', error);
    return { sources: [] };
  }
}

export async function fetchPublicSchemes(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/schemes`);
    return await res.json();
  } catch (error) {
    console.error('Backend Schemes API call error:', error);
    return { items: [] };
  }
}
