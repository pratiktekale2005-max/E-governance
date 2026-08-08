export type ScreenType = 
  | 'dashboard' 
  | 'chat' 
  | 'schemes' 
  | 'explorer'
  | 'pre-screening' 
  | 'eligibility'
  | 'vault' 
  | 'applications' 
  | 'explainability' 
  | 'accessibility' 
  | 'help' 
  | 'doc-checklist';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone_number?: string;
  preferred_language?: string;
  state?: string;
  district?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface CitizenProfile {
  age?: number | string;
  state?: string;
  district?: string;
  occupation?: string;
  education?: string;
  annual_income?: number | string;
  income?: string;
  category?: string;
  gender?: string;
  preferred_language?: string;
}

export type UserProfileData = CitizenProfile;

export interface AppSettings {
  apiKey: string;
  model: string;
  systemInstructions: string;
}

export interface InfoArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  fullText: string;
  readTime: string;
  iconBg: string;
}

export interface GovernmentScheme {
  scheme_id: string;
  scheme_name: string;
  category: string;
  jurisdiction: string;
  department?: string;
  ministry?: string;
  state?: string;
  summary: string;
  benefits: string;
  eligibility: string[];
  required_documents: string[];
  application_steps?: string[];
  application_mode?: string;
  official_urls: string[];
  status?: string;
  is_bookmarked?: boolean;
}

export interface RAGCitation {
  scheme_id: string;
  scheme_name: string;
  category: string;
  jurisdiction: string;
  state?: string;
  official_url: string;
  last_verified_date?: string;
  relevance_score: number;
}

export interface RAGResponseEnvelope {
  session_id?: string;
  query: string;
  response: string;
  language?: { code: string; name: string; confidence: number };
  intent?: { intent: string; confidence: number };
  entities?: CitizenProfile;
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
  citations: RAGCitation[];
  evidence: {
    matched_schemes: any[];
    scheme_count: number;
  };
  disclaimer?: string;
  response_id?: string;
}

export interface PreScreeningResultItem {
  scheme_id: string;
  scheme_name: string;
  status: 'likely_match' | 'possible_match' | 'disqualified' | 'more_information_required';
  status_label: string;
  confidence_score: number;
  matching_conditions: string[];
  missing_information: string[];
  disqualification_reasons: string[];
}

export interface PreScreeningCheckResponse {
  timestamp: string;
  citizen_profile: CitizenProfile;
  total_evaluated: number;
  summary_counts: {
    likely_match: number;
    possible_match: number;
    disqualified: number;
    more_information_required: number;
  };
  matched_schemes: PreScreeningResultItem[];
  llm_plain_explanation?: string;
}

export interface ExplainableResponsePayload {
  response_id: string;
  query: string;
  answer: string;
  confidence: {
    overall_score: number;
    confidence_level: string;
    evidence_score: number;
    freshness_score: number;
    reasoning: string;
  };
  sources: Array<{
    scheme_id: string;
    scheme_name: string;
    official_url: string;
    section?: string;
    page?: number;
    text_snippet?: string;
    last_verified_date?: string;
  }>;
  rule_evaluation: Array<{
    condition: string;
    status: string;
    value_checked?: string;
  }>;
  execution_trace: Array<{
    step_number: number;
    step_name: string;
    timestamp: string;
    details: string;
  }>;
  conflicts: string[];
  freshness_warning?: string;
  official_links: string[];
}

export interface CitizenApplication {
  id: string;
  schemeId: string;
  schemeName: string;
  category: string;
  applicantName: string;
  submissionDate: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'action_required';
  documentsAttached: string[];
  timelineSteps: Array<{
    title: string;
    date: string;
    completed: boolean;
    active?: boolean;
    description?: string;
  }>;
  referenceNumber: string;
  notes?: string;
}

export interface VaultDocument {
  id: string;
  name: string;
  type: 'aadhaar' | 'income' | 'caste' | 'domicile' | 'marksheet' | 'ration' | 'bank' | 'other';
  fileSize: string;
  uploadDate: string;
  verificationStatus: 'verified' | 'pending' | 'action_needed';
  documentNumber?: string;
  issuingAuthority?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'application' | 'document' | 'scheme' | 'system';
  actionTab?: ScreenType;
  schemeId?: string;
}

export interface VerifiedSourcePortal {
  id: string;
  name: string;
  base_url: string;
  jurisdiction: string;
  state?: string;
  trust_tier: string;
  description?: string;
}
