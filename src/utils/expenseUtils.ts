import { Expense } from "../data/expenses";

export function getNumericAmount(amount: string): number {
  return Number(amount.replace(/\D/g, ""));
}

export function getTotalExpenses(expenses: Expense[]): number {
  return expenses.reduce(
    (total, expense) => total + getNumericAmount(expense.amount),
    0,
  );
}

export function getExpensesByCategory(
  expenses: Expense[],
): Record<string, number> {
  return expenses.reduce(
    (totals, expense) => {
      const amount = getNumericAmount(expense.amount);

      totals[expense.category] = (totals[expense.category] ?? 0) + amount;

      return totals;
    },
    {} as Record<string, number>,
  );
}

const months = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export type MonthlyExpense = {
  year: number;
  monthIndex: number;
  month: string;
  amount: number;
};

export function getExpenseDate(expense: Expense): Date | null {
  const parts = expense.fullDate?.toLowerCase().split(" de ");

  if (!parts || parts.length !== 3) {
    return null;
  }

  const day = Number(parts[0]);
  const month = months.indexOf(parts[1]);
  const year = Number(parts[2]);

  if (Number.isNaN(day) || month === -1 || Number.isNaN(year)) {
    return null;
  }

  return new Date(year, month, day);
}

export function getMonthlyExpenses(expenses: Expense[]): MonthlyExpense[] {
  const monthlyTotals = expenses.reduce(
    (totals, expense) => {
      const date = getExpenseDate(expense);

      if (!date) {
        return totals;
      }

      const key = `${date.getFullYear()}-${date.getMonth()}`;

      totals[key] = (totals[key] ?? 0) + getNumericAmount(expense.amount);

      return totals;
    },
    {} as Record<string, number>,
  );

  return Object.entries(monthlyTotals)
    .map(([key, amount]) => {
      const [year, monthIndex] = key.split("-").map(Number);

      return {
        year,
        monthIndex,
        month: months[monthIndex].slice(0, 3),
        amount,
      };
    })
    .sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }

      return a.monthIndex - b.monthIndex;
    });
}

export function getGrowthPercentage(expenses: Expense[]): number | null {
  const monthlyExpenses = getMonthlyExpenses(expenses);

  if (monthlyExpenses.length < 2) {
    return null;
  }

  const currentMonth = monthlyExpenses[monthlyExpenses.length - 1];

  const previousMonth = monthlyExpenses[monthlyExpenses.length - 2];

  if (previousMonth.amount <= 0) {
    return null;
  }

  return Math.round(
    ((currentMonth.amount - previousMonth.amount) / previousMonth.amount) * 100,
  );
}
