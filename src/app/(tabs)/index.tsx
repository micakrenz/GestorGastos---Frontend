import * as LocalAuthentication from "expo-local-authentication";
import { useFocusEffect, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { Expense } from "../../data/expenses";
import { getBudget, getExpenses, getIncome } from "../../services/api";
import {
  getExpenseDate,
  getExpensesByCategory,
  getTotalExpenses,
} from "../../utils/expenseUtils";

const categoryColors: Record<string, string> = {
  Comida: "#F97316",
  Transporte: "#3B82F6",
  Compras: "#A855F7",
  Entretenimiento: "#EC4899",
  Otros: "#10B981",
  Objetivos: "#06B6D4",
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, isReady } = useAuth();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(250000);
  const [categoryBudgets, setCategoryBudgets] = useState<
    Record<string, number>
  >({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    const authenticate = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardware || !isEnrolled) {
          setIsAuthenticated(true);
          return;
        }

        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Ingresá a Finan",
          cancelLabel: "Cancelar",
        });

        if (result.success) {
          setIsAuthenticated(true);
        }
      } catch (error) {
      } finally {
        setIsAuthenticating(false);
      }
    };

    authenticate();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!isReady || !user) return;

      const loadExpenses = async () => {
        try {
          const [expensesResult, incomeResult, budgetResult] =
            await Promise.allSettled([
              getExpenses(),
              getIncome(
                selectedMonth.getFullYear(),
                selectedMonth.getMonth() + 1,
              ),
              getBudget(
                selectedMonth.getFullYear(),
                selectedMonth.getMonth() + 1,
              ),
            ]);

          if (expensesResult.status === "fulfilled") {
            setExpenses(expensesResult.value);
          } else {
            console.warn(
              "No se pudieron cargar los gastos:",
              expensesResult.reason,
            );
          }

          if (incomeResult.status === "fulfilled") {
            setIncome(incomeResult.value.amount);
          } else {
            console.warn(
              "No se pudieron cargar los ingresos:",
              incomeResult.reason,
            );
          }

          if (budgetResult.status === "fulfilled") {
            setMonthlyBudget(budgetResult.value.monthly || 250000);
            setCategoryBudgets(budgetResult.value.categories);
          } else {
            console.warn(
              "No se pudo cargar el presupuesto:",
              budgetResult.reason,
            );
          }
        } finally {
          setIsHydrated(true);
        }
      };

      loadExpenses();
    }, [selectedMonth, isReady, user]),
  );

  if (!isHydrated || isAuthenticating || !isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {isAuthenticating ? "Verificando identidad..." : "Cargando..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const monthlyExpenses = expenses.filter((expense) => {
    const date = getExpenseDate(expense);
    return (
      date !== null &&
      date.getFullYear() === selectedMonth.getFullYear() &&
      date.getMonth() === selectedMonth.getMonth()
    );
  });
  const previousMonth = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() - 1,
    1,
  );
  const now = new Date();
  const isCurrentMonth =
    selectedMonth.getFullYear() === now.getFullYear() &&
    selectedMonth.getMonth() === now.getMonth();
  const previousMonthExpenses = expenses.filter((expense) => {
    const date = getExpenseDate(expense);
    return (
      date !== null &&
      date.getFullYear() === previousMonth.getFullYear() &&
      date.getMonth() === previousMonth.getMonth()
    );
  });
  const totalAmount = getTotalExpenses(monthlyExpenses);

  const formattedTotal = `$${totalAmount.toLocaleString("es-AR")}`;

  const previousMonthTotal = getTotalExpenses(previousMonthExpenses);
  const growthPercentage =
    previousMonthTotal > 0
      ? Math.round(
          ((totalAmount - previousMonthTotal) / previousMonthTotal) * 100,
        )
      : null;

  const savings = Math.max(income - totalAmount, 0);

  const formattedIncome = `$${income.toLocaleString("es-AR")}`;
  const formattedSavings = `$${savings.toLocaleString("es-AR")}`;

  const categoryTotals = getExpensesByCategory(monthlyExpenses);
  const monthlyUsage =
    monthlyBudget > 0 ? (totalAmount / monthlyBudget) * 100 : 0;
  const monthlyRemaining = monthlyBudget - totalAmount;
  const categoryOverages = Object.entries(categoryBudgets)
    .map(([name, limit]) => ({ name, limit, spent: categoryTotals[name] ?? 0 }))
    .filter((item) => item.spent > item.limit);
  const nearMonthlyLimit = monthlyUsage >= 80 && monthlyUsage <= 100;
  const overMonthlyLimit = monthlyUsage > 100;

  const categories = [
    "Comida",
    "Transporte",
    "Compras",
    "Entretenimiento",
    "Otros",
    "Objetivos",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Logo */}

        <View style={styles.logoContainer}>
          <Image
            source={require("../../../assets/images/logo-finan.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Encabezado */}

        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Tus gastos</Text>
          </View>
        </View>

        {/* Selector de mes */}

        <View style={styles.monthSelector}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver mes anterior"
            hitSlop={12}
            onPress={() =>
              setSelectedMonth(
                (month) =>
                  new Date(month.getFullYear(), month.getMonth() - 1, 1),
              )
            }
          >
            <Text style={styles.arrow}>‹</Text>
          </Pressable>
          <Text style={styles.month}>
            {selectedMonth
              .toLocaleDateString("es-AR", { month: "long", year: "numeric" })
              .replace(/^./, (letter) => letter.toUpperCase())}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver mes siguiente"
            hitSlop={12}
            disabled={isCurrentMonth}
            onPress={() =>
              setSelectedMonth(
                (month) =>
                  new Date(month.getFullYear(), month.getMonth() + 1, 1),
              )
            }
          >
            <Text
              style={[styles.arrow, isCurrentMonth && styles.disabledArrow]}
            >
              ›
            </Text>
          </Pressable>
        </View>

        {/* Gasto total */}

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Gasto total</Text>

          <Text style={styles.totalAmount}>{formattedTotal}</Text>

          <View style={styles.totalFooter}>
            <Text style={styles.totalDescription}>Total de gastos del mes</Text>

            {growthPercentage !== null && (
              <View style={styles.percentageBadge}>
                <Text style={styles.percentageText}>
                  {growthPercentage >= 0 ? "+" : "-"}
                  {Math.abs(growthPercentage)}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Aviso de presupuesto */}
        {(nearMonthlyLimit ||
          overMonthlyLimit ||
          categoryOverages.length > 0) && (
          <View
            style={[
              styles.budgetFeedback,
              overMonthlyLimit || categoryOverages.length > 0
                ? styles.budgetFeedbackDanger
                : styles.budgetFeedbackWarning,
            ]}
          >
            <Text style={styles.budgetFeedbackTitle}>
              {overMonthlyLimit
                ? "Superaste tu presupuesto mensual"
                : categoryOverages.length > 0
                  ? "Superaste el límite de una categoría"
                  : "Estás cerca de tu límite mensual"}
            </Text>
            <Text style={styles.budgetFeedbackDescription}>
              {overMonthlyLimit
                ? `Te excediste por $${Math.abs(monthlyRemaining).toLocaleString("es-AR")}. Podés seguir registrando gastos, pero revisá tu presupuesto.`
                : categoryOverages.length > 0
                  ? categoryOverages
                      .map(
                        (item) =>
                          `${item.name}: $${(item.spent - item.limit).toLocaleString("es-AR")} por encima del límite`,
                      )
                      .join(". ")
                  : `Ya utilizaste el ${Math.round(monthlyUsage)}% de tu presupuesto. Te quedan $${Math.max(monthlyRemaining, 0).toLocaleString("es-AR")}.`}
            </Text>
          </View>
        )}

        {/* Ingresos y ahorro */}

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconGreen}>
              <Text>↗</Text>
            </View>

            <Text style={styles.summaryLabel}>Ingresos</Text>

            <Text style={styles.summaryAmount}>{formattedIncome}</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIconBlue}>
              <Text>✓</Text>
            </View>

            <Text style={styles.summaryLabel}>Ahorro</Text>

            <Text style={styles.summaryAmount}>{formattedSavings}</Text>
          </View>
        </View>

        {/* Categorías */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gastos por categoría</Text>
        </View>

        <View style={styles.categoryCard}>
          {categories
            .map((category) => ({
              name: category,
              amount: categoryTotals[category] ?? 0,
            }))
            .sort((a, b) => b.amount - a.amount)
            // Mostrar únicamente las categorías que tienen gastos registrados.
            .filter(({ amount }) => amount > 0)
            .map(({ name, amount }) => {
              const percentage =
                totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;

              return (
                <Category
                  key={name}
                  name={name}
                  amount={`$${amount.toLocaleString("es-AR")}`}
                  percentage={`${percentage}%`}
                  progress={totalAmount > 0 ? amount / totalAmount : 0}
                  color={categoryColors[name]}
                />
              );
            })}
        </View>

        {/* Mapa de gastos */}

        <Pressable
          style={styles.mapCard}
          onPress={() => router.push({
            pathname: "/mapa",
            params: {
              year: String(selectedMonth.getFullYear()),
              month: String(selectedMonth.getMonth() + 1),
            },
          })}
        >
          <View style={styles.mapIconContainer}>
            <SymbolView
              name={{
                ios: "map.fill",
                android: "map",
                web: "map",
              }}
              tintColor="#2563EB"
              size={25}
            />
          </View>

          <View style={styles.mapInfo}>
            <Text style={styles.mapTitle}>Mapa de gastos</Text>

            <Text style={styles.mapDescription}>
              Descubrí en qué zonas gastás más
            </Text>
          </View>

          <Text style={styles.mapArrow}>›</Text>
        </Pressable>

        {/* Presupuesto */}

        <Pressable
          style={styles.mapCard}
          onPress={() => router.push({
            pathname: "/presupuesto",
            params: {
              year: String(selectedMonth.getFullYear()),
              month: String(selectedMonth.getMonth() + 1),
            },
          })}
        >
          <View style={styles.budgetIconContainer}>
            <Text style={styles.budgetIcon}>$</Text>
          </View>

          <View style={styles.mapInfo}>
            <Text style={styles.mapTitle}>Presupuesto</Text>

            <Text style={styles.mapDescription}>
              Revisá el presupuesto del mes seleccionado
            </Text>
          </View>

          <Text style={styles.mapArrow}>›</Text>
        </Pressable>

        {/* Objetivos */}

        <Pressable
          style={styles.mapCard}
          onPress={() => router.push("/objetivos")}
        >
          <View style={styles.objectiveIconContainer}>
            <SymbolView
              name={{
                ios: "target",
                android: "track_changes",
                web: "track_changes",
              }}
              tintColor="#7C3AED"
              size={25}
            />
          </View>

          <View style={styles.mapInfo}>
            <Text style={styles.mapTitle}>Objetivos</Text>

            <Text style={styles.mapDescription}>
              Alcanzá tus metas de ahorro
            </Text>
          </View>

          <Text style={styles.mapArrow}>›</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Category({
  name,
  amount,
  percentage,
  progress,
  color,
}: {
  name: string;
  amount: string;
  percentage: string;
  progress: number;
  color: string;
}) {
  return (
    <View style={styles.category}>
      <View style={styles.categoryTop}>
        <View style={styles.categoryInfo}>
          <View>
            <Text style={styles.categoryName}>{name}</Text>

            <Text style={styles.categoryPercentage}>{percentage}</Text>
          </View>
        </View>

        <Text style={styles.categoryAmount}>{amount}</Text>
      </View>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progress,
            {
              width: `${progress * 100}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    fontSize: 15,
    color: "#64748B",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 0,
    marginBottom: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  profileText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  monthSelector: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 16,
  },

  month: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0D1B2A",
  },

  arrow: {
    fontSize: 25,
    color: "#2563EB",
  },

  disabledArrow: {
    color: "#CBD5E1",
  },

  totalCard: {
    backgroundColor: "#1E3A8A",
    borderRadius: 22,
    padding: 22,
    marginBottom: 14,
  },

  totalLabel: {
    color: "#BFDBFE",
    fontSize: 14,
    marginBottom: 6,
  },

  totalAmount: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 18,
  },

  totalFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalDescription: {
    color: "#DBEAFE",
    fontSize: 13,
  },

  percentageBadge: {
    backgroundColor: "#10B981",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  percentageText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 26,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
  },

  summaryIconGreen: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  summaryIconBlue: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  summaryLabel: {
    color: "#64748B",
    fontSize: 13,
    marginBottom: 4,
  },

  summaryAmount: {
    color: "#0D1B2A",
    fontSize: 18,
    fontWeight: "700",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  seeMore: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },

  categoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
  },

  category: {
    marginBottom: 18,
  },

  categoryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },

  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    marginRight: 11,
  },

  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0D1B2A",
    marginBottom: 2,
  },

  categoryPercentage: {
    fontSize: 12,
    color: "#94A3B8",
  },

  categoryAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  progressBackground: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    overflow: "hidden",
  },

  progress: {
    height: 6,
    borderRadius: 10,
  },

  mapCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
  },

  mapIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  mapIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563EB",
  },

  mapInfo: {
    flex: 1,
  },

  mapTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0D1B2A",
    marginBottom: 4,
  },

  mapDescription: {
    fontSize: 12,
    color: "#94A3B8",
  },

  mapArrow: {
    fontSize: 28,
    color: "#2563EB",
    marginLeft: 8,
  },

  budgetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  budgetIcon: {
    fontSize: 21,
    fontWeight: "700",
    color: "#10B981",
  },

  objectiveIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  objectiveIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#7C3AED",
  },
  budgetFeedback: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
  },
  budgetFeedbackWarning: {
    backgroundColor: "#FFFBEB",
    borderColor: "#F59E0B",
  },
  budgetFeedbackDanger: {
    backgroundColor: "#FEF2F2",
    borderColor: "#EF4444",
  },
  budgetFeedbackTitle: {
    color: "#0D1B2A",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  budgetFeedbackDescription: {
    color: "#475569",
    fontSize: 12,
    lineHeight: 18,
  },
  logoContainer: {
    alignItems: "center",
    height: 80,
    marginTop: -5,
    marginBottom: 0,
  },
  logo: {
    width: 250,
    height: 100,
  },
});
