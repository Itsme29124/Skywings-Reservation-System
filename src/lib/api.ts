// Central API client — all fetch calls go through the Spring Cloud API Gateway.

const BASE = "http://localhost:8080/api";

// ── Token helpers ─────────────────────────────────────────────────────────────
const TOKEN_KEY = "sw_token";
export function getToken(): string | null { return localStorage.getItem(TOKEN_KEY); }
function setToken(t: string) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

async function req<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Request failed");
  return data as T;
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
}

export interface Passenger {
  firstName: string;
  lastName: string;
  dob: string;
  gender: "M" | "F" | "O";
}

export interface Booking {
  _id?: string;
  pnr: string;
  flightId: string;
  passengers: Passenger[];
  seats: string[];
  totalPrice: number;
  status: "CONFIRMED" | "CANCELLED" | "RESCHEDULED";
  contactEmail: string;
  contactPhone: string;
  checkedIn: boolean;
  createdAt: string;
}

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  async signup(email: string, password: string, fullName: string): Promise<User> {
    const data = await req<{ token: string; user: User }>("/users/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName }),
    });
    setToken(data.token);
    return data.user;
  },
  async signin(email: string, password: string): Promise<User> {
    const data = await req<{ token: string; user: User }>("/users/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    return data.user;
  },
  async me(): Promise<User> {
    return req<User>("/users/me");
  },
  signout() {
    clearToken();
  },
};

// ── Bookings API ──────────────────────────────────────────────────────────────
export const bookingsApi = {
  list(): Promise<Booking[]> {
    return req<Booking[]>("/bookings");
  },
  listAll(): Promise<Booking[]> {
    return req<Booking[]>("/bookings/all");
  },
  create(payload: Omit<Booking, "_id">): Promise<Booking> {
    return req<Booking>("/bookings", { method: "POST", body: JSON.stringify(payload) });
  },
  cancel(pnr: string): Promise<Booking> {
    return req<Booking>(`/bookings/${pnr}/cancel`, { method: "PATCH" });
  },
  reschedule(pnr: string, flightId: string): Promise<Booking> {
    return req<Booking>(`/bookings/${pnr}/reschedule`, { method: "PATCH", body: JSON.stringify({ flightId }) });
  },
  checkIn(pnr: string): Promise<Booking> {
    return req<Booking>(`/bookings/${pnr}/check-in`, { method: "PATCH" });
  },
};