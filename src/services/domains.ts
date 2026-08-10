import api from "./api";
import type {
  Domain,
  DomainAnalytics,
  AnalyticsParams,
  Metric,
  MetricEntry,
  Category,
  DomainCreatePayload,
  MetricCreatePayload,
  EntryCreatePayload,
} from "../types";

// ── categories ────────────────────────────────────────────────────────────────

export const fetchCategories = async (): Promise<Category[]> => {
  const res = await api.get<Category[]>("category/");
  return res.data;
};

// ── domains ───────────────────────────────────────────────────────────────────

export const fetchDomains = async (): Promise<Domain[]> => {
  const res = await api.get<Domain[]>("domain/");
  return res.data;
};

/**
 * Fetches domain base data (meta + metrics).
 * No analytics — use fetchDomainAnalytics for that.
 */
export const fetchDomainDetail = async (id: number): Promise<Domain> => {
  const res = await api.get<Domain>(`domain/${id}/`);
  return res.data;
};

/**
 * Fetches only the analytics portion of a domain, with period and end_date support.
 * Reuses the same endpoint — bitmask strips analytics out of the full response.
 *
 * @param id       Domain ID
 * @param params   { period: 'weekly'|'monthly'|'days:NN', end_date?: 'YYYY-MM-DD' }
 */
export const fetchDomainAnalytics = async (
  id: number,
  params: AnalyticsParams
): Promise<DomainAnalytics | null> => {
  const query = new URLSearchParams();
  query.set("period", params.period);
  if (params.end_date) {
    query.set("end_date", params.end_date);
  }

  const res = await api.get<Domain>(`domain/${id}/?${query.toString()}`);
  return res.data.analytics ?? null;
};

export const createDomain = async (payload: DomainCreatePayload): Promise<Domain> => {
  const res = await api.post<Domain>("domain/", payload);
  return res.data;
};

export const updateDomain = async (
  id: number,
  payload: Partial<DomainCreatePayload>
): Promise<Domain> => {
  const res = await api.patch<Domain>(`domain/${id}/`, payload);
  return res.data;
};

export const deleteDomain = async (id: number): Promise<void> => {
  await api.delete(`domain/${id}/`);
};

export const fetchDomainTemplate = async (slug: string) => {
  const res = await api.get(`domain-templates/${slug}/`);
  return res.data;
};

// ── metrics ───────────────────────────────────────────────────────────────────

export const createMetric = async (payload: MetricCreatePayload): Promise<Metric> => {
  const res = await api.post<Metric>("metric/", payload);
  return res.data;
};

export const deleteMetric = async (id: number): Promise<void> => {
  await api.delete(`metric/${id}/`);
};

// ── entries ───────────────────────────────────────────────────────────────────

export const createEntry = async (payload: EntryCreatePayload): Promise<MetricEntry> => {
  const res = await api.post<MetricEntry>("entry/", payload);
  return res.data;
};

export const fetchEntries = async (metricId: number): Promise<MetricEntry[]> => {
  const res = await api.get<MetricEntry[]>(`entry/?metric=${metricId}`);
  return res.data;
};

// ── goals ─────────────────────────────────────────────────────────────────────

export const createGoal = (data: {
  metric: number;
  target_value: number;
  period: string;
  comparison_type: string;
}) => api.post("/goal/", data).then((r) => r.data);