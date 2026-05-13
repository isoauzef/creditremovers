import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from "react";

// ── Types ────────────────────────────────────────────────────────
export type ContactSubmission = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  state?: string | null;
  creditScoreRange?: string | null;
  negativeItemsCount?: string | null;
  notes?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export type CheckoutSubmission = {
  id: number;
  customerUserId?: number | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  zip: string;
  dateOfBirth: string;
  ssnLast4?: string | null;
  idDocS3Key?: string | null;
  idDocFilename?: string | null;
  idDocMimeType?: string | null;
  billDocS3Key?: string | null;
  billDocFilename?: string | null;
  billDocMimeType?: string | null;
  signatureName?: string | null;
  signatureDate?: string | null;
  authConsent: boolean;
  paymentPlan: "monthly" | "upfront";
  paymentStatus: string;
  monthsBilled: number;
  totalPaidCents: number;
  stripeSubscriptionId?: string | null;
  stripeSubscriptionScheduleId?: string | null;
  createdAt: string;
  updatedAt: string;
  customerUser?: { id: number; email: string; firstName: string; lastName: string } | null;
};

export type CustomerUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  lastLoginAt?: string | null;
  createdAt: string;
  _count?: { checkoutSubmissions: number; creditRounds: number };
};

export type CreditRound = {
  id: number;
  customerUserId: number;
  roundNumber: number;
  summaryDate: string;
  previousSummaryDate?: string | null;
  equifaxScore: number; equifaxPrevScore: number;
  experianScore: number; experianPrevScore: number;
  transunionScore: number; transunionPrevScore: number;
  disputesDeletedThisRound: number; disputesDeletedLastRound: number; disputesDeletedGrandTotal: number;
  disputesOnGoingThisRound: number; disputesOnGoingLastRound: number; disputesOnGoingGrandTotal: number;
  unDisputedNegativeThisRound: number; unDisputedNegativeLastRound: number; unDisputedNegativeGrandTotal: number;
  updatedToPositiveThisRound: number; updatedToPositiveLastRound: number; updatedToPositiveGrandTotal: number;
  newItemsAddedThisRound: number; newItemsAddedLastRound: number; newItemsAddedGrandTotal: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NewsArticle = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string | null;
  author?: string | null;
  published: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuditLog = {
  id: number;
  adminUserId: number;
  checkoutSubmissionId: number;
  field: string;
  action: string;
  ip?: string | null;
  userAgent?: string | null;
  createdAt: string;
  adminUser?: { id: number; email: string };
  checkoutSubmission?: { id: number; firstName: string; lastName: string; email: string };
};

export type EmailTemplate = {
  id: number;
  slug: string;
  name: string;
  subject: string;
  previewText?: string | null;
  content: unknown;
  enabled: boolean;
};

export type Settings = Record<string, Record<string, string>>;

export type DashboardStats = {
  totalContacts: number;
  totalCheckouts: number;
  activeClients: number;
  completedClients: number;
  totalCustomers: number;
  totalNews: number;
  revenueCents: number;
};

// ── Auth context ─────────────────────────────────────────────────
const TOKEN_KEY = "adminJwt";
const EMAIL_KEY = "adminEmail";

type AdminAuthCtx = {
  token: string | null;
  adminEmail: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  updateToken: (token: string, email: string) => void;
};

const AuthContext = createContext<AdminAuthCtx>({
  token: null,
  adminEmail: null,
  isAuthenticated: false,
  login: async () => ({ ok: false }),
  logout: () => {},
  updateToken: () => {},
});

export function useAdminAuth() {
  return useContext(AuthContext);
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null
  );
  const [adminEmail, setAdminEmail] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem(EMAIL_KEY) : null
  );
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checked, setChecked] = useState(false);

  // verify stored JWT on mount
  useEffect(() => {
    if (!token) {
      setChecked(true);
      return;
    }
    adminFetch("/api/admin/me", token)
      .then((user: any) => {
        setAdminEmail(user.email);
        setIsAuthenticated(true);
        setChecked(true);
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(EMAIL_KEY);
        setToken(null);
        setAdminEmail(null);
        setChecked(true);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.message || "Login failed" };

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(EMAIL_KEY, data.email);
      setToken(data.token);
      setAdminEmail(data.email);
      setIsAuthenticated(true);
      return { ok: true };
    } catch {
      return { ok: false, error: "Network error" };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(EMAIL_KEY);
    setToken(null);
    setAdminEmail(null);
    setIsAuthenticated(false);
  }, []);

  const updateToken = useCallback((newToken: string, newEmail: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(EMAIL_KEY, newEmail);
    setToken(newToken);
    setAdminEmail(newEmail);
  }, []);

  if (!checked) return null;

  return (
    <AuthContext.Provider value={{ token, adminEmail, isAuthenticated, login, logout, updateToken }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Fetch helper ─────────────────────────────────────────────────
async function adminFetch(url: string, token: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
      ...(!init?.body || typeof init.body === "string" ? { "Content-Type": "application/json" } : {}),
    },
  });
  if (res.status === 401) throw new Error("Unauthorized");
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export function useAdminFetch() {
  const { token } = useAdminAuth();
  return useCallback(
    async (url: string, init?: RequestInit) => {
      if (!token) throw new Error("Not authenticated");
      return adminFetch(url, token, init);
    },
    [token]
  );
}

// ── Hooks ────────────────────────────────────────────────────────
export function useAdminApi<T>(path: string) {
  const { token } = useAdminAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const d = await adminFetch(path, token);
      setData(d);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [path, token]);

  useEffect(() => {
    load();
  }, [load]);

  const mutate = useCallback(
    async (method: string, body?: unknown, subPath = "") => {
      if (!token) throw new Error("Not authenticated");
      const url = subPath ? `${path}${subPath}` : path;
      return adminFetch(url, token, {
        method,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    },
    [path, token]
  );

  return { data, loading, error, reload: load, mutate };
}

// For file uploads
export function useAdminUpload() {
  const { token } = useAdminAuth();

  return useCallback(
    async (file: File): Promise<{ path: string; filename: string }> => {
      if (!token) throw new Error("Not authenticated");
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    [token]
  );
}
