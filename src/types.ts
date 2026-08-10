export type User = {
  id: number;
  username: string;
  email: string;
};

export type MetricEntry = {
  id: number;
  metric: number;
  value: number;
  created_at: string;
};

export type Metric = {
  id: number;
  name: string;
  domain: number;
  unit?: string | null;
  aggregation_type?: string | null;
  latest_value?: number | null;
};

export type Category = {
  id: number;
  name: string;
  description?: string | null;
};

export type DomainSummary = {
  metrics_count: number;
};

// ── analytics types ───────────────────────────────────────────────────────────

export type GoalInfo = {
  goal_id: number | null;
  progress: number;
  current_value: number;
  target: number;
  comparison: "at_least" | "at_most" | "exact";
  period: string;
};

export type MetricAnalytics = {
  window_sum: number;
  monthly_sum: number;
  monthly_avg: number;
  std: number;
  consistency: number;
  growth: number | null;
  goal: GoalInfo | null;
  metric_score: number;
  intensity_score: number;
  stability_score: number | null;
  growth_score: number | null;
  // generic stats (from domain_basic_scores)
  completion_rate?: number | null;
  current_streak?: number | null;
  longest_streak?: number | null;
  avg_streak?: number | null;
  fail_count?: number | null;
};

export type AnalyticsSummary = {
  intensity: number;
  consistency: number;
  stability: number | null;
  growth: number | null;
  domain_score: number;
  // flat summary keys (some domains return flat)
  [key: string]: number | null | undefined;
};

export type SpecificSummary = {
  // language domain specifics — other domains may have different keys
  study_intensity_minutes_week?: number;
  active_passive_ratio?: number | null;
  skill_balance_index?: number;
  vocab_rate_week?: number;
  vocab_retention?: number;
  fluency_score?: number;
  grammar_score?: number;
  recommendations?: string[];
  [key: string]: unknown;
};

export type AnalyticsPeriod = {
  type: string;
  start: string;
  end: string;
};

export type DomainAnalytics = {
  domain_id: number;
  domain_name: string;
  slug: string | null;
  period: AnalyticsPeriod;
  report: {
    per_metric: Record<string, MetricAnalytics>;
    summary: AnalyticsSummary;
  };
  specific_summary?: SpecificSummary | null;
};

// ── domain ────────────────────────────────────────────────────────────────────

export type Domain = {
  id: number;
  name: string;
  description?: string | null;
  category?: number | null;
  category_name?: string | null;
  slug?: string | null;
  summary?: DomainSummary;
  metrics?: Metric[];
  created_at?: string;
  analytics?: DomainAnalytics | null;
};

// ── forms ─────────────────────────────────────────────────────────────────────

export type DomainCreatePayload = {
  name: string;
  description?: string;
  category?: number | null;
  slug?: string;
};

export type MetricCreatePayload = {
  name: string;
  domain: number;
  unit?: string;
  aggregation_type?: string;
};

export type EntryCreatePayload = {
  metric: number;
  value: number;
};

// ── analytics fetch params ────────────────────────────────────────────────────

export type AnalyticsParams = {
  period: "weekly" | "monthly" | `days:${number}`;
  end_date?: string; // YYYY-MM-DD
};

// ── auth ──────────────────────────────────────────────────────────────────────

export type AuthResponseLogin = {
  user_id: number;
  refresh: string;
  access: string;
};

export type AuthResponseRegister = {
  user: User;
  refresh: string;
  access: string;
  message?: string;
};