import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Expense } from "../data/expenses";

export type User = { id: number; name: string; email: string; onboardingCompleted: boolean };
export type GoalMovement = { id: number; amount: number; type: "ADD" | "SUBTRACT"; date: string; note: string };
export type Goal = { id: number; title: string; target: number; current: number; movements: GoalMovement[] };
export type Budget = { monthly: number; categories: Record<string, number> };
export type MonthlyIncome = { year: number; month: number; amount: number; registered: boolean };

const TOKEN_KEY = "gestor-gastos-session-token";
const LEGACY_INCOME_KEY = "gestor-gastos-ingresos";
const LEGACY_INCOME_MONTH_KEY = "gestor-gastos-ingresos-mes";
const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.86:3000").replace(/\/$/, "");
let accessToken: string | null = null;

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function restoreSessionToken() {
  accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
  return accessToken;
}

async function setSessionToken(token: string | null) {
  accessToken = token;
  if (token) await SecureStore.setItemAsync(TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}, authenticated = true): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");
  if (authenticated && accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error(`No se pudo conectar con el backend (${API_BASE_URL}). Revisá que siga corriendo y que el teléfono esté en la misma Wi‑Fi.`);
  }

  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(body.error || "Ocurrió un error al comunicarse con el servidor.", response.status);
  return body as T;
}

async function authenticate(path: "/api/auth/register" | "/api/auth/login", body: Record<string, string>) {
  const response = await request<{ user: User; token: string }>(path, { method: "POST", body: JSON.stringify(body) }, false);
  await setSessionToken(response.token);
  return response.user;
}

export async function register(name: string, email: string, password: string) {
  const user = await authenticate("/api/auth/register", { name, email, password });
  // Los valores de la versión anterior vivían en el dispositivo y no pertenecen a una cuenta concreta.
  await Promise.all([
    AsyncStorage.removeItem(LEGACY_INCOME_KEY).catch(() => undefined),
    AsyncStorage.removeItem(LEGACY_INCOME_MONTH_KEY).catch(() => undefined),
  ]);
  return user;
}

export const login = (email: string, password: string) =>
  authenticate("/api/auth/login", { email, password });

export async function getProfile() {
  return request<User>("/api/profile");
}

export async function updateProfile(name: string) {
  return request<User>("/api/profile", { method: "PATCH", body: JSON.stringify({ name }) });
}

export async function completeOnboarding() {
  return request<{ onboardingCompleted: true }>("/api/onboarding/complete", { method: "POST" });
}

export async function logout() {
  await setSessionToken(null);
}

const categoryColors: Record<string, string> = {
  Comida: "#F97316",
  Transporte: "#3B82F6",
  Compras: "#A855F7",
  Entretenimiento: "#EC4899",
  Otros: "#10B981",
  Objetivos: "#06B6D4",
};

const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const shortMonths = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

type ApiExpense = Omit<Expense, "time" | "amount" | "color" | "date" | "fullDate"> & { amount: number; date: string };

function toDisplayExpense(item: ApiExpense): Expense {
  const date = new Date(item.date);
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date();
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dayDifference = Math.round((todayOnly.getTime() - dateOnly.getTime()) / 86_400_000);
  const displayDate = dayDifference === 0 ? "Hoy" : dayDifference === 1 ? "Ayer" : `${date.getDate()} ${shortMonths[date.getMonth()]}`;
  return {
    ...item,
    amount: `$${item.amount.toLocaleString("es-AR")}`,
    time: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
    color: categoryColors[item.category] || "#64748B",
    date: displayDate,
    fullDate: `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`,
  };
}

function amountNumber(amount: string | number) {
  return typeof amount === "number" ? amount : Number(amount.replace(/\D/g, ""));
}

function fullDateToIso(fullDate?: string) {
  if (!fullDate) return new Date().toISOString();
  const parts = fullDate.toLowerCase().split(" de ");
  const month = months.indexOf(parts[1]);
  if (parts.length !== 3 || month < 0) return new Date().toISOString();
  return new Date(Number(parts[2]), month, Number(parts[0])).toISOString();
}

export async function getExpenses() {
  const data = await request<ApiExpense[]>("/api/expenses");
  return data.map(toDisplayExpense);
}

export async function createExpense(expense: Omit<Expense, "id" | "time" | "date" | "fullDate" | "color"> & { date?: string }) {
  const saved = await request<ApiExpense>("/api/expenses", {
    method: "POST",
    body: JSON.stringify({ ...expense, amount: amountNumber(expense.amount), date: expense.date || new Date().toISOString() }),
  });
  return toDisplayExpense(saved);
}

export async function updateExpense(id: number, changes: Partial<Expense>) {
  const body = {
    ...changes,
    ...(changes.amount !== undefined ? { amount: amountNumber(changes.amount) } : {}),
    ...(changes.fullDate !== undefined ? { date: fullDateToIso(changes.fullDate) } : {}),
  };
  const saved = await request<ApiExpense>(`/api/expenses/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  return toDisplayExpense(saved);
}

export const deleteExpense = (id: number) => request<void>(`/api/expenses/${id}`, { method: "DELETE" });

function currentPeriod() {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export async function getIncome(year?: number, month?: number) {
  const period = year !== undefined && month !== undefined ? { year, month } : currentPeriod();
  const income = await request<MonthlyIncome>(`/api/incomes/${period.year}/${period.month}`);
  const current = currentPeriod();
  if (income.registered || period.year !== current.year || period.month !== current.month) return income;

  // Migra una sola vez los ingresos del mes actual guardados por la versión anterior del front.
  const [legacyAmount, legacyMonth] = await Promise.all([
    AsyncStorage.getItem(LEGACY_INCOME_KEY),
    AsyncStorage.getItem(LEGACY_INCOME_MONTH_KEY),
  ]);
  const periodKey = `${period.year}-${String(period.month).padStart(2, "0")}`;
  if (!legacyAmount || (legacyMonth && legacyMonth !== periodKey)) return income;

  const migrated = await saveIncome(Number(legacyAmount), period.year, period.month);
  await Promise.all([
    AsyncStorage.removeItem(LEGACY_INCOME_KEY),
    AsyncStorage.removeItem(LEGACY_INCOME_MONTH_KEY),
  ]);
  return migrated;
}

export async function saveIncome(amount: number, year?: number, month?: number) {
  const period = year !== undefined && month !== undefined ? { year, month } : currentPeriod();
  return request<MonthlyIncome>(`/api/incomes/${period.year}/${period.month}`, {
    method: "POST",
    body: JSON.stringify({ amount: Number(amount) }),
  });
}

export async function getBudget(year?: number, month?: number) {
  const period = year !== undefined && month !== undefined ? { year, month } : currentPeriod();
  const result = await request<{ monthly: number; categories: { category: string; amount: number }[] }>(`/api/budgets/${period.year}/${period.month}`);
  return { monthly: result.monthly, categories: Object.fromEntries(result.categories.map(({ category, amount }) => [category, amount])) };
}

export async function saveBudget(budget: Budget, year?: number, month?: number) {
  const period = year !== undefined && month !== undefined ? { year, month } : currentPeriod();
  const categories = Object.fromEntries(Object.entries(budget.categories).map(([category, amount]) => [category, Number(amount)]));
  const result = await request<{ monthly: number; categories: { category: string; amount: number }[] }>(`/api/budgets/${period.year}/${period.month}`, {
    method: "PUT",
    body: JSON.stringify({ monthly: Number(budget.monthly), categories }),
  });
  return { monthly: result.monthly, categories: Object.fromEntries(result.categories.map(({ category, amount }) => [category, amount])) };
}

export const getGoals = () => request<Goal[]>("/api/goals");

export async function createGoal(title: string, target: number, initialAmount: number) {
  return request<Goal>("/api/goals", { method: "POST", body: JSON.stringify({ title, target, initialAmount }) });
}

export const updateGoal = (id: number, changes: { title?: string; target?: number }) =>
  request<Goal>(`/api/goals/${id}`, { method: "PATCH", body: JSON.stringify(changes) });

export const deleteGoal = (id: number) => request<void>(`/api/goals/${id}`, { method: "DELETE" });

export const createGoalMovement = (id: number, amount: number, type: "ADD" | "SUBTRACT") =>
  request<{ movement: GoalMovement; current: number }>(`/api/goals/${id}/movements`, { method: "POST", body: JSON.stringify({ amount, type }) });

export async function getCurrentMonthGoalNet(year?: number, month?: number) {
  const period = year !== undefined && month !== undefined ? { year, month } : currentPeriod();
  const goals = await getGoals();
  return goals.flatMap((goal) => goal.movements).reduce((total, movement) => {
    const date = new Date(movement.date);
    if (date.getFullYear() !== period.year || date.getMonth() + 1 !== period.month) return total;
    return total + (movement.type === "ADD" ? movement.amount : -movement.amount);
  }, 0);
}
