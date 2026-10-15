import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Expense } from "../data/expenses";

const EXPENSES_STORAGE_KEY = "gestor-gastos-gastos";
const BUDGET_STORAGE_KEY = "gestor-gastos-presupuesto";
const INCOME_STORAGE_KEY = "gestor-gastos-ingresos";
const GOAL_MOVEMENTS_STORAGE_KEY = "gestor-gastos-movimientos-objetivos";

const categories = [
  {
    name: "Comida",
    color: "#F97316",
  },
  {
    name: "Transporte",
    color: "#3B82F6",
  },
  {
    name: "Compras",
    color: "#A855F7",
  },
  {
    name: "Entretenimiento",
    color: "#EC4899",
  },
  {
    name: "Otros",
    color: "#10B981",
  },
];

type Budget = {
  monthly: number;
  categories: Record<string, number>;
};

type ModalType = "monthly" | "category" | "create" | null;

export default function PresupuestoScreen() {
  const router = useRouter();

  const [budget, setBudget] = useState<Budget>({
    monthly: 250000,
    categories: {
      Comida: 80000,
      Transporte: 50000,
      Compras: 40000,
      Entretenimiento: 30000,
    },
  });

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState(0);
  const [goalMovements, setGoalMovements] = useState<Record<string, number>>(
    {},
  );

  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [inputAmount, setInputAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          setIsLoading(true);

          const [
            storedBudget,
            storedExpenses,
            storedIncome,
            storedGoalMovements,
          ] = await Promise.all([
            AsyncStorage.getItem(BUDGET_STORAGE_KEY),
            AsyncStorage.getItem(EXPENSES_STORAGE_KEY),
            AsyncStorage.getItem(INCOME_STORAGE_KEY),
            AsyncStorage.getItem(GOAL_MOVEMENTS_STORAGE_KEY),
          ]);

          if (storedBudget) {
            setBudget(JSON.parse(storedBudget));
          }

          if (storedExpenses) {
            setExpenses(JSON.parse(storedExpenses));
          }
          setIncome(storedIncome ? Number(storedIncome) : 0);
          setGoalMovements(
            storedGoalMovements ? JSON.parse(storedGoalMovements) : {},
          );
        } catch (error) {
        } finally {
          setIsLoading(false);
        }
      };

      loadData();
    }, []),
  );

  const saveBudget = async (updatedBudget: Budget) => {
    try {
      await AsyncStorage.setItem(
        BUDGET_STORAGE_KEY,
        JSON.stringify(updatedBudget),
      );

      setBudget(updatedBudget);
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el presupuesto.");
    }
  };

  const getNumericAmount = (amount: string) => {
    return Number(amount.replace(/\D/g, ""));
  };

  const getCategorySpent = (category: string) => {
    return expenses.reduce((total, expense) => {
      if (expense.category !== category) {
        return total;
      }

      return total + getNumericAmount(expense.amount);
    }, 0);
  };

  const totalSpent = expenses.reduce(
    (total, expense) => total + getNumericAmount(expense.amount),
    0,
  );

  const monthKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const goalContributionThisMonth = Number(goalMovements[monthKey]) || 0;
  const monthlyBalance =
    budget.monthly - totalSpent - goalContributionThisMonth;
  const monthlyAvailable = Math.max(monthlyBalance, 0);

  const monthlyUsed = totalSpent + goalContributionThisMonth;
  const monthlyPercentage =
    budget.monthly > 0
      ? Math.round((monthlyUsed / budget.monthly) * 100)
      : monthlyUsed > 0
        ? 100
        : 0;
  const allocatedCategoryBudget = Object.values(budget.categories).reduce(
    (sum, amount) => sum + amount,
    0,
  );
  const plannedSpending =
    allocatedCategoryBudget > 0 ? allocatedCategoryBudget : budget.monthly;
  const projectedSavings = income - plannedSpending - goalContributionThisMonth;

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString("es-AR")}`;
  };

  const openMonthlyEdit = () => {
    setInputAmount(budget.monthly.toString());
    setModalType("monthly");
  };

  const openCategoryEdit = (category: string) => {
    setSelectedCategory(category);
    setInputAmount(budget.categories[category]?.toString() ?? "");
    setModalType("category");
  };

  const openCreateCategory = () => {
    setSelectedCategory("");
    setInputAmount("");
    setModalType("create");
  };

  const handleSaveModal = async () => {
    const numericAmount = Number(inputAmount.replace(/\D/g, ""));

    if (!numericAmount || numericAmount <= 0) {
      Alert.alert("Monto inválido", "Ingresá un monto mayor a $0.");
      return;
    }

    if (modalType === "monthly") {
      const updatedBudget: Budget = {
        ...budget,
        monthly: numericAmount,
      };

      await saveBudget(updatedBudget);
      setModalType(null);
      return;
    }

    if (modalType === "category") {
      const updatedBudget: Budget = {
        ...budget,
        categories: {
          ...budget.categories,
          [selectedCategory]: numericAmount,
        },
      };

      await saveBudget(updatedBudget);
      setModalType(null);
      return;
    }

    if (modalType === "create") {
      if (!selectedCategory) {
        Alert.alert("Categoría requerida", "Seleccioná una categoría.");
        return;
      }

      const updatedBudget: Budget = {
        ...budget,
        categories: {
          ...budget.categories,
          [selectedCategory]: numericAmount,
        },
      };

      await saveBudget(updatedBudget);
      setModalType(null);
    }
  };

  const handleDeleteCategoryBudget = (category: string) => {
    Alert.alert(
      "Eliminar presupuesto",
      `¿Estás seguro de que querés eliminar el presupuesto de ${category}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            const updatedCategories = {
              ...budget.categories,
            };

            delete updatedCategories[category];

            const updatedBudget: Budget = {
              ...budget,
              categories: updatedCategories,
            };

            await saveBudget(updatedBudget);
          },
        },
      ],
    );
  };

  const categoriesWithoutBudget = categories.filter(
    (category) => budget.categories[category.name] === undefined,
  );

  const getCategoryPercentage = (category: string) => {
    const limit = budget.categories[category];

    if (!limit) {
      return 0;
    }

    return Math.round((getCategorySpent(category) / limit) * 100);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando presupuesto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <View>
            <Text style={styles.smallTitle}>Septiembre 2026</Text>
            <Text style={styles.title}>Presupuesto</Text>
          </View>
        </View>

        {/* PRESUPUESTO MENSUAL */}
        <View style={styles.monthlyCard}>
          <View style={styles.monthlyHeader}>
            <View>
              <Text style={styles.monthlyLabel}>Presupuesto mensual</Text>

              <Text style={styles.monthlyAmount}>
                {formatCurrency(budget.monthly)}
              </Text>
            </View>

            <Pressable style={styles.smallEditButton} onPress={openMonthlyEdit}>
              <Text style={styles.smallEditText}>Editar</Text>
            </Pressable>
          </View>

          <View style={styles.monthlyStats}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Gastado</Text>

              <Text style={styles.statValue}>{formatCurrency(totalSpent)}</Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Disponible</Text>

              <Text
                style={[
                  styles.statValue,
                  monthlyBalance < 0
                    ? styles.overBudgetText
                    : styles.availableValue,
                ]}
              >
                {formatCurrency(monthlyBalance)}
              </Text>
            </View>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(monthlyPercentage, 100)}%`,
                },
              ]}
            />
          </View>

          <Text style={styles.progressText}>
            Utilizaste el {monthlyPercentage}% de tu presupuesto mensual
          </Text>
        </View>

        {/* AHORRO PROYECTADO */}
        <View style={styles.projectedSavingsCard}>
          <Text style={styles.projectedSavingsLabel}>
            Ahorro proyectado según tus asignaciones
          </Text>
          <Text
            style={[
              styles.projectedSavingsAmount,
              income > 0 && projectedSavings < 0 && styles.overBudgetText,
            ]}
          >
            {income > 0
              ? formatCurrency(projectedSavings)
              : "Ingresos sin configurar"}
          </Text>
          <Text style={styles.projectedSavingsDescription}>
            {income > 0
              ? `Ingresos ${formatCurrency(income)} menos ${formatCurrency(plannedSpending)} asignados a gastos y ${formatCurrency(goalContributionThisMonth)} netos destinados a objetivos este mes. ${allocatedCategoryBudget > 0 ? "Al cambiar un límite por categoría, este cálculo se actualiza." : "Configurá límites por categoría para afinar la proyección."}`
              : "Ingresá tus ingresos mensuales en Análisis para calcular el ahorro proyectado. Las asignaciones se actualizarán automáticamente."}
          </Text>
        </View>

        {/* ALERTA */}
        {(monthlyPercentage >= 80 || monthlyPercentage > 100) && (
          <View style={styles.alertCard}>
            <View style={styles.alertIndicator} />

            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>
                {monthlyPercentage > 100
                  ? "Superaste tu límite mensual"
                  : "Estás cerca de tu límite mensual"}
              </Text>

              <Text style={styles.alertDescription}>
                {monthlyPercentage > 100
                  ? `Te excediste por ${formatCurrency(Math.abs(Math.min(monthlyBalance, 0)))} considerando gastos y movimientos netos de objetivos. Podés seguir registrando gastos, pero revisá tus asignaciones.`
                  : `Ya utilizaste el ${monthlyPercentage}% de tu presupuesto. Te quedan ${formatCurrency(monthlyAvailable)} disponibles.`}
              </Text>
            </View>
          </View>
        )}

        {/* CATEGORÍAS */}
        <View style={styles.categoryHeader}>
          <Text style={styles.sectionTitle}>Presupuesto por categoría</Text>

          {categoriesWithoutBudget.length > 0 && (
            <Pressable style={styles.addButton} onPress={openCreateCategory}>
              <Text style={styles.addButtonText}>Agregar</Text>
            </Pressable>
          )}
        </View>

        {Object.keys(budget.categories).length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>
              No tenés presupuestos por categoría
            </Text>

            <Text style={styles.emptyText}>
              Agregá un presupuesto para empezar a controlar tus gastos.
            </Text>

            <Pressable
              style={styles.primaryButton}
              onPress={openCreateCategory}
            >
              <Text style={styles.primaryButtonText}>Agregar presupuesto</Text>
            </Pressable>
          </View>
        )}

        {Object.entries(budget.categories).map(([category, limit]) => {
          const categoryInfo = categories.find(
            (item) => item.name === category,
          );

          const color = categoryInfo?.color ?? "#2563EB";

          const spent = getCategorySpent(category);

          const percentage = getCategoryPercentage(category);

          const available = limit - spent;

          return (
            <View key={category} style={styles.categoryCard}>
              <View style={styles.categoryTop}>
                <View style={styles.categoryNameContainer}>
                  <View
                    style={[
                      styles.categoryIndicator,
                      {
                        backgroundColor: color,
                      },
                    ]}
                  />

                  <Text style={styles.categoryName}>{category}</Text>
                </View>

                <View style={styles.categoryActions}>
                  <Pressable onPress={() => openCategoryEdit(category)}>
                    <Text style={styles.actionText}>Editar</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => handleDeleteCategoryBudget(category)}
                  >
                    <Text style={[styles.actionText, styles.deleteText]}>
                      Eliminar
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.categoryAmounts}>
                <View>
                  <Text style={styles.categoryLabel}>Límite</Text>

                  <Text style={styles.categoryLimit}>
                    {formatCurrency(limit)}
                  </Text>
                </View>

                <View style={styles.categoryRight}>
                  <Text style={styles.categoryLabel}>Gastado</Text>

                  <Text style={styles.categorySpent}>
                    {formatCurrency(spent)}
                  </Text>
                </View>
              </View>

              <View style={styles.categoryProgressBackground}>
                <View
                  style={[
                    styles.categoryProgressFill,
                    {
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: color,
                    },
                  ]}
                />
              </View>

              <View style={styles.categoryBottom}>
                <Text
                  style={[
                    styles.categoryAvailable,
                    available < 0 && styles.overBudgetText,
                  ]}
                >
                  {available < 0
                    ? `Excedido: ${formatCurrency(Math.abs(available))}`
                    : `Disponible: ${formatCurrency(available)}`}
                </Text>

                <Text
                  style={[
                    styles.categoryPercentage,
                    {
                      color,
                    },
                  ]}
                >
                  {percentage}%
                </Text>
              </View>
              {spent > limit && (
                <Text style={styles.categoryOverageMessage}>
                  Superaste este límite por {formatCurrency(spent - limit)}.
                  Podés seguir registrando gastos, pero revisá tu presupuesto.
                </Text>
              )}
            </View>
          );
        })}

        {/* MODAL */}
        <Modal
          visible={modalType !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setModalType(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {modalType === "monthly"
                  ? "Editar presupuesto mensual"
                  : modalType === "category"
                    ? `Editar presupuesto de ${selectedCategory}`
                    : "Agregar presupuesto"}
              </Text>

              {modalType === "create" && (
                <>
                  <Text style={styles.modalLabel}>Categoría</Text>

                  <View style={styles.modalOptions}>
                    {categoriesWithoutBudget.map((category) => {
                      const isSelected = selectedCategory === category.name;

                      return (
                        <Pressable
                          key={category.name}
                          style={[
                            styles.modalOption,
                            isSelected && styles.modalOptionActive,
                          ]}
                          onPress={() => setSelectedCategory(category.name)}
                        >
                          <Text
                            style={[
                              styles.modalOptionText,
                              isSelected && styles.modalOptionTextActive,
                            ]}
                          >
                            {category.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              <Text style={styles.modalLabel}>Límite mensual</Text>

              <TextInput
                style={styles.modalInput}
                value={inputAmount}
                onChangeText={setInputAmount}
                keyboardType="numeric"
                placeholder="Ej: 80000"
                placeholderTextColor="#9CA3AF"
              />

              <View style={styles.modalActions}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => setModalType(null)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </Pressable>

                <Pressable style={styles.saveButton} onPress={handleSaveModal}>
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 25,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  backArrow: {
    fontSize: 30,
    color: "#0D1B2A",
    lineHeight: 32,
  },

  smallTitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 2,
  },

  title: {
    fontSize: 27,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  monthlyCard: {
    backgroundColor: "#1E3A8A",
    borderRadius: 22,
    padding: 22,
    marginBottom: 18,
  },

  monthlyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },

  monthlyLabel: {
    color: "#BFDBFE",
    fontSize: 13,
    marginBottom: 5,
  },

  monthlyAmount: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
  },

  smallEditButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },

  smallEditText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
  },

  monthlyStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statItem: {
    flex: 1,
  },

  statLabel: {
    color: "#BFDBFE",
    fontSize: 12,
    marginBottom: 4,
  },

  statValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  availableValue: {
    color: "#34D399",
  },

  progressBackground: {
    height: 9,
    backgroundColor: "#31529B",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },

  progressText: {
    color: "#BFDBFE",
    fontSize: 12,
    marginTop: 9,
  },

  alertCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    flexDirection: "row",
    marginBottom: 26,
  },

  alertIndicator: {
    width: 8,
    borderRadius: 8,
    backgroundColor: "#F59E0B",
    marginRight: 12,
  },

  alertTextContainer: {
    flex: 1,
  },

  alertTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0D1B2A",
    marginBottom: 4,
  },

  alertDescription: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
  },

  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  addButton: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  addButtonText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
  },

  categoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 17,
    marginBottom: 13,
  },

  categoryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 17,
  },

  categoryNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  categoryIndicator: {
    width: 11,
    height: 11,
    borderRadius: 4,
    marginRight: 9,
  },

  categoryName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  categoryActions: {
    flexDirection: "row",
    gap: 12,
  },

  actionText: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "700",
  },

  deleteText: {
    color: "#DC2626",
  },

  categoryAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  categoryRight: {
    alignItems: "flex-end",
  },

  categoryLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginBottom: 3,
  },

  categoryLimit: {
    color: "#0D1B2A",
    fontSize: 16,
    fontWeight: "700",
  },

  categorySpent: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },

  categoryProgressBackground: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
  },

  categoryProgressFill: {
    height: "100%",
    borderRadius: 10,
  },

  categoryBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 9,
  },

  categoryOverageMessage: {
    color: "#B91C1C",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  projectedSavingsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  projectedSavingsLabel: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 6,
  },
  projectedSavingsAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#059669",
    marginBottom: 5,
  },
  projectedSavingsDescription: {
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },
  overBudgetText: {
    color: "#DC2626",
  },
  categoryAvailable: {
    color: "#64748B",
    fontSize: 11,
  },

  categoryPercentage: {
    fontSize: 12,
    fontWeight: "700",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 19,
    padding: 22,
    alignItems: "center",
  },

  emptyTitle: {
    color: "#0D1B2A",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },

  emptyText: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 18,
  },

  primaryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(13, 27, 42, 0.45)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
  },

  modalTitle: {
    color: "#0D1B2A",
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 20,
  },

  modalLabel: {
    color: "#0D1B2A",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 9,
  },

  modalOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },

  modalOption: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  modalOptionActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },

  modalOptionText: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },

  modalOptionTextActive: {
    color: "#2563EB",
  },

  modalInput: {
    height: 52,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 15,
    fontSize: 15,
    color: "#0D1B2A",
    marginBottom: 20,
  },

  modalActions: {
    flexDirection: "row",
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
  },

  saveButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: "#64748B",
    fontSize: 15,
  },
});
