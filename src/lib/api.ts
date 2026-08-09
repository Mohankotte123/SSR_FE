import {
  clearAdminSession,
  getAdminToken,
  setAdminToken,
  setStoredAdminUser,
} from "@/lib/auth";
import type {
  ApiResult,
  AuthUser,
  Booking,
  BrandSettings,
  CreateBookingPayload,
  CreateLeadPayload,
  CreateVentureResult,
  GlobalAnalytics,
  Lead,
  LoginResult,
  Paginated,
  Plot,
  UpdateBookingPayload,
  UpdateBrandPayload,
  UpdatePlotPayload,
  Venture,
  VentureAnalytics,
  VentureDetail,
} from "@/types/database";

const DEFAULT_BASE = "https://ssr-be.onrender.com";

/**
 * Browser → same-origin `/api/*` (proxied by next.config rewrites).
 * Server Components → call the backend host directly.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || DEFAULT_BASE
  );
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

type ApiOptions = RequestInit & {
  token?: string | null;
  soft?: boolean;
};

async function api<T>(
  path: string,
  options: ApiOptions = {}
): Promise<ApiResult<T>> {
  const { token, soft, headers: initHeaders, body, ...rest } = options;
  const headers = new Headers(initHeaders);

  const auth = token === null ? undefined : token || getAdminToken();
  if (auth) headers.set("Authorization", `Bearer ${auth}`);

  if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let res: Response;
  try {
    res = await fetch(`${getApiBaseUrl()}${path}`, {
      ...rest,
      headers,
      body,
      // Same-origin proxy: cookies only for our FE host. Avoids CORS
      // "Failed to fetch" when calling Render directly with credentials:include.
      credentials: "same-origin",
      cache: rest.cache ?? "no-store",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Network request failed";
    const hint =
      message.toLowerCase().includes("fetch")
        ? `${message}. Check that the FE proxy is running (restart npm run dev) and the backend is reachable.`
        : message;
    if (soft) return { success: false, error: hint };
    throw new ApiError(hint, 0);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("text/csv")) {
    const message = "Unexpected CSV response — use exportSalesReportCsv()";
    if (soft) return { success: false, error: message };
    throw new ApiError(message, res.status);
  }

  let json: ApiResult<T> | null = null;
  try {
    const text = await res.text();
    if (!text) {
      const message = `Empty response from API (${res.status}) ${path}`;
      if (soft) return { success: false, error: message };
      throw new ApiError(message, res.status);
    }
    json = JSON.parse(text) as ApiResult<T>;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    const message =
      res.status === 404
        ? `API route not found: ${path}. Redeploy SSR_BE so new auth/brand routes are live on Render.`
        : `Invalid JSON from API (${res.status}) for ${path}`;
    if (soft) return { success: false, error: message };
    throw new ApiError(message, res.status);
  }

  if (!res.ok || !json.success) {
    const message =
      json && !json.success ? json.error : `Request failed (${res.status})`;
    if (soft) return { success: false, error: message };
    throw new ApiError(message, res.status);
  }

  return json;
}

function unwrap<T>(result: ApiResult<T>): T {
  if (!result.success) throw new ApiError(result.error);
  return result.data;
}

function qs(
  params: Record<string, string | number | undefined | null>
): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== "") sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/* ── Auth ───────────────────────────────────────────────── */

export async function login(
  email: string,
  password: string
): Promise<LoginResult> {
  const data = unwrap(
    await api<LoginResult>("/api/auth/login", {
      method: "POST",
      token: null,
      body: JSON.stringify({ email, password }),
      soft: true,
    })
  );
  setAdminToken(data.session.access_token);
  setStoredAdminUser({ id: data.user.id, email: data.user.email });
  return data;
}

export async function getMe(
  token?: string
): Promise<ApiResult<{ user: AuthUser }>> {
  return api<{ user: AuthUser }>("/api/auth/me", { token, soft: true });
}

export function logout(): void {
  clearAdminSession();
}

/* ── Brand ──────────────────────────────────────────────── */

export async function getBrand(): Promise<BrandSettings> {
  const result = await api<BrandSettings>("/api/brand", {
    soft: true,
    token: null,
  });
  if (result.success) return result.data;
  return {
    id: null,
    legacyYears: 40,
    completedProjectsCount: 25,
    happyCustomersCount: 1000,
    contactPhone: "+91 00000 00000",
    contactEmail: "hello@example.com",
    officeAddress: "Hyderabad, Telangana",
    proprietorMessage: null,
    updatedAt: null,
  };
}

export async function updateBrand(
  payload: UpdateBrandPayload,
  token?: string
): Promise<BrandSettings> {
  return unwrap(
    await api<BrandSettings>("/api/brand", {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
      soft: true,
    })
  );
}

/* ── Public ventures / plots / leads ────────────────────── */

export async function listVentures(): Promise<Venture[]> {
  const result = await api<Venture[]>("/api/ventures", {
    soft: true,
    token: null,
  });
  return result.success ? result.data : [];
}

export async function getVentureBySlug(
  slug: string
): Promise<VentureDetail | null> {
  const result = await api<VentureDetail>(
    `/api/ventures/${encodeURIComponent(slug)}`,
    { soft: true, token: null }
  );
  return result.success ? result.data : null;
}

export async function listPlots(slugOrId: string): Promise<Plot[]> {
  const result = await api<Plot[]>(
    `/api/ventures/${encodeURIComponent(slugOrId)}/plots`,
    { soft: true, token: null }
  );
  return result.success ? result.data : [];
}

export async function createLead(payload: CreateLeadPayload): Promise<Lead> {
  return unwrap(
    await api<Lead>("/api/leads", {
      method: "POST",
      token: null,
      body: JSON.stringify(payload),
      soft: true,
    })
  );
}

/* ── Admin ventures / plots / bookings / analytics ──────── */

export async function getGlobalAnalytics(
  token?: string
): Promise<ApiResult<GlobalAnalytics>> {
  return api<GlobalAnalytics>("/api/admin/analytics", { token, soft: true });
}

export async function getVentureAnalytics(
  idOrSlug: string,
  token?: string
): Promise<ApiResult<VentureAnalytics>> {
  return api<VentureAnalytics>(
    `/api/ventures/${encodeURIComponent(idOrSlug)}/analytics`,
    { token, soft: true }
  );
}

export async function createBooking(
  payload: CreateBookingPayload,
  token?: string
): Promise<{ booking: Booking; plot: Plot }> {
  return unwrap(
    await api<{ booking: Booking; plot: Plot }>("/api/bookings", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
      soft: true,
    })
  );
}

export async function listBookings(opts?: {
  search?: string;
  plotId?: string;
  page?: number;
  limit?: number;
  token?: string;
}): Promise<ApiResult<Paginated<Booking>>> {
  return api<Paginated<Booking>>(
    `/api/bookings${qs({
      search: opts?.search,
      plotId: opts?.plotId,
      page: opts?.page,
      limit: opts?.limit,
    })}`,
    { token: opts?.token, soft: true }
  );
}

/** Latest booking for a plot (reserved / sold inventory record). */
export async function getBookingForPlot(
  plotId: string,
  token?: string
): Promise<Booking | null> {
  const result = await listBookings({ plotId, limit: 1, page: 1, token });
  if (!result.success) throw new ApiError(result.error, 400);
  return result.data.items[0] ?? null;
}

export async function updateBooking(
  bookingId: string,
  body: UpdateBookingPayload,
  token?: string
): Promise<{ booking: Booking; plot: Plot }> {
  return unwrap(
    await api<{ booking: Booking; plot: Plot }>(
      `/api/bookings/${encodeURIComponent(bookingId)}`,
      {
        method: "PATCH",
        token,
        body: JSON.stringify(body),
        soft: true,
      }
    )
  );
}

export async function listLeads(opts?: {
  ventureId?: string;
  page?: number;
  limit?: number;
  token?: string;
}): Promise<ApiResult<Paginated<Lead>>> {
  return api<Paginated<Lead>>(
    `/api/leads${qs({
      ventureId: opts?.ventureId,
      page: opts?.page,
      limit: opts?.limit,
    })}`,
    { token: opts?.token, soft: true }
  );
}

export async function updatePlotStatus(
  plotId: string,
  body: UpdatePlotPayload,
  token?: string
): Promise<Plot> {
  return unwrap(
    await api<Plot>(`/api/plots/${encodeURIComponent(plotId)}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify(body),
      soft: true,
    })
  );
}

export async function createVenture(
  form: FormData,
  token?: string
): Promise<CreateVentureResult> {
  return unwrap(
    await api<CreateVentureResult>("/api/ventures", {
      method: "POST",
      token,
      body: form,
      soft: true,
    })
  );
}

export async function updateVenture(
  idOrSlug: string,
  form: FormData,
  token?: string
): Promise<Venture> {
  return unwrap(
    await api<Venture>(`/api/ventures/${encodeURIComponent(idOrSlug)}`, {
      method: "PATCH",
      token,
      body: form,
      soft: true,
    })
  );
}

export async function deleteVenture(
  idOrSlug: string,
  token?: string
): Promise<{ deleted: boolean; id: string; slug: string; plotsRemoved: number }> {
  return unwrap(
    await api<{
      deleted: boolean;
      id: string;
      slug: string;
      plotsRemoved: number;
    }>(`/api/ventures/${encodeURIComponent(idOrSlug)}`, {
      method: "DELETE",
      token,
      soft: true,
    })
  );
}

export async function exportSalesReportCsv(token?: string): Promise<Blob> {
  const auth = token || getAdminToken();
  const headers = new Headers();
  if (auth) headers.set("Authorization", `Bearer ${auth}`);

  const res = await fetch(
    `${getApiBaseUrl()}/api/admin/reports/export?format=csv&type=sales`,
    { headers, credentials: "same-origin", cache: "no-store" }
  );

  if (!res.ok) {
    let message = `Export failed (${res.status})`;
    try {
      const json = (await res.json()) as ApiResult<unknown>;
      if (!json.success) message = json.error;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }

  return res.blob();
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
