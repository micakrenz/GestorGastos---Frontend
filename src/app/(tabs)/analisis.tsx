import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Line,
  Path,
  Polyline,
  Text as SvgText,
} from "react-native-svg";
import { Expense } from "../../data/expenses";
import {
  getGrowthPercentage,
  getMonthlyExpenses,
  getNumericAmount,
} from "../../utils/expenseUtils";

const EXPENSES_STORAGE_KEY = "gestor-gastos-gastos";
const INCOME_STORAGE_KEY = "gestor-gastos-ingresos";

const categoryColors: Record<string, string> = {
  Comida: "#F97316",
  Transporte: "#3B82F6",
  Compras: "#A855F7",
  Entretenimiento: "#EC4899",
  Otros: "#10B981",
};

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString("es-AR")}`;
}

function DonutChart({
  categories,
}: {
  categories: {
    name: string;
    percentage: number;
    color: string;
  }[];
}) {
  const radius = 58;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;

  return (
    <Svg width={155} height={155} viewBox="0 0 155 155">
      {categories.map((category) => {
        const segmentLength = circumference * (category.percentage / 100);

        const dashOffset = -accumulated;

        accumulated += segmentLength;

        return (
          <Circle
            key={category.name}
            cx="77.5"
            cy="77.5"
            r={radius}
            fill="none"
            stroke={category.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${segmentLength} ${circumference}`}
            strokeDashoffset={dashOffset}
            rotation="-90"
            origin="77.5, 77.5"
          />
        );
      })}

      <Circle cx="77.5" cy="77.5" r="43" fill="#FFFFFF" />
    </Svg>
  );
}

function LineChart({
  monthlyExpenses,
}: {
  monthlyExpenses: {
    month: string;
    amount: number;
  }[];
}) {
  if (monthlyExpenses.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyChartText}>
          Todavía no hay datos suficientes para mostrar la evolución.
        </Text>
      </View>
    );
  }

  const maxAmount = Math.max(
    ...monthlyExpenses.map((item) => item.amount),
    50000,
  );

  const chartTop = 20;
  const chartBottom = 155;
  const chartHeight = chartBottom - chartTop;

  const chartLeft = 38;
  const chartRight = 315;
  const chartWidth = chartRight - chartLeft;

  const getY = (amount: number) => {
    const percentage = amount / maxAmount;

    return chartBottom - percentage * chartHeight;
  };

  const getX = (index: number) => {
    if (monthlyExpenses.length === 1) {
      return (chartLeft + chartRight) / 2;
    }

    return chartLeft + (index / (monthlyExpenses.length - 1)) * chartWidth;
  };

  const points = monthlyExpenses
    .map((item, index) => {
      return `${getX(index)},${getY(item.amount)}`;
    })
    .join(" ");

  const areaPath = `
    M${getX(0)} ${getY(monthlyExpenses[0].amount)}
    ${monthlyExpenses
      .slice(1)
      .map((item, index) => `L${getX(index + 1)} ${getY(item.amount)}`)
      .join(" ")}
    L${getX(monthlyExpenses.length - 1)} ${chartBottom}
    L${getX(0)} ${chartBottom}
    Z
  `;

  const axisValues = [
    maxAmount,
    maxAmount * 0.75,
    maxAmount * 0.5,
    maxAmount * 0.25,
  ];

  return (
    <Svg width="100%" height={190} viewBox="0 0 330 190">
      {/* Líneas horizontales */}
      {axisValues.map((value, index) => {
        const y = chartTop + index * 45;

        return (
          <Line
            key={index}
            x1="38"
            y1={y}
            x2="315"
            y2={y}
            stroke="#E2E8F0"
            strokeWidth="1"
          />
        );
      })}

      {/* Valores del eje */}
      {axisValues.map((value, index) => {
        const y = chartTop + index * 45 + 4;

        return (
          <SvgText key={index} x="2" y={y} fontSize="9" fill="#94A3B8">
            {value >= 1000
              ? `$${Math.round(value / 1000)}k`
              : `$${Math.round(value)}`}
          </SvgText>
        );
      })}

      {/* Área debajo del gráfico */}
      <Path d={areaPath} fill="#DBEAFE" opacity={0.45} />

      {/* Línea de evolución */}
      <Polyline
        points={points}
        fill="none"
        stroke="#2563EB"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Puntos */}
      {monthlyExpenses.map((item, index) => (
        <Circle
          key={index}
          cx={getX(index)}
          cy={getY(item.amount)}
          r="4"
          fill="#2563EB"
        />
      ))}

      {/* Meses */}
      {monthlyExpenses.map((item, index) => (
        <SvgText
          key={index}
          x={getX(index) - 12}
          y="180"
          fontSize="10"
          fill="#94A3B8"
        >
          {item.month}
        </SvgText>
      ))}
    </Svg>
  );
}

export default function AnalisisScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [income, setIncome] = useState(350000);

  const [incomeModalVisible, setIncomeModalVisible] = useState(false);

  const [incomeInput, setIncomeInput] = useState("");

  const [incomeError, setIncomeError] = useState("");

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const storedExpenses =
            await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);

          if (storedExpenses) {
            setExpenses(JSON.parse(storedExpenses));
          } else {
            setExpenses([]);
          }

          const storedIncome = await AsyncStorage.getItem(INCOME_STORAGE_KEY);

          if (storedIncome) {
            setIncome(Number(storedIncome));
          }
        } catch (error) {}
      };

      loadData();
    }, []),
  );

  const totalSpent = expenses.reduce((total, expense) => {
    return total + getNumericAmount(expense.amount);
  }, 0);

  const savings = Math.max(income - totalSpent, 0);

  const savingsPercentage =
    income > 0 ? Math.round((savings / income) * 100) : 0;

  const categoryTotals = expenses.reduce(
    (totals, expense) => {
      const amount = getNumericAmount(expense.amount);

      totals[expense.category] = (totals[expense.category] ?? 0) + amount;

      return totals;
    },
    {} as Record<string, number>,
  );

  const categories = Object.entries(categoryTotals)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      color: categoryColors[name] ?? "#64748B",
    }))
    .sort((a, b) => b.amount - a.amount);

  const displayCategories =
    categories.length > 0
      ? categories
      : [
          {
            name: "Sin gastos",
            amount: 0,
            percentage: 100,
            color: "#CBD5E1",
          },
        ];

  /*
   * EVOLUCIÓN MENSUAL
   */

  const monthlyExpenses = getMonthlyExpenses(expenses).slice(-4);

  const chartData = monthlyExpenses.map((item) => ({
    month: item.month,
    amount: item.amount,
  }));

  const currentMonth =
    monthlyExpenses.length > 0
      ? monthlyExpenses[monthlyExpenses.length - 1]
      : null;

  const currentMonthAmount = currentMonth?.amount ?? totalSpent;

  const previousMonth =
    monthlyExpenses.length > 1
      ? monthlyExpenses[monthlyExpenses.length - 2]
      : null;

  const previousMonthAmount = previousMonth?.amount ?? 0;

  const growthPercentage = getGrowthPercentage(expenses);

  const isGrowthPositive = growthPercentage !== null && growthPercentage >= 0;

  const evolutionDescription =
    previousMonthAmount > 0
      ? "Comparado con el mes anterior"
      : "Datos disponibles de los últimos meses";

  /*
   * EDITAR INGRESOS
   */

  const openIncomeModal = () => {
    setIncomeInput(income > 0 ? income.toString() : "");
    setIncomeError("");
    setIncomeModalVisible(true);
  };

  const saveIncome = async () => {
    const numericIncome = Number(incomeInput.replace(/\D/g, ""));

    if (!numericIncome || numericIncome <= 0) {
      setIncomeError("Ingresá un monto válido mayor a $0.");
      return;
    }

    try {
      await AsyncStorage.setItem(INCOME_STORAGE_KEY, numericIncome.toString());

      setIncome(numericIncome);
      setIncomeModalVisible(false);
      setIncomeError("");
    } catch (error) {}
  };

  const highestCategory = categories.length > 0 ? categories[0] : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.smallTitle}>Septiembre 2026</Text>

            <Text style={styles.title}>Análisis</Text>
          </View>
        </View>

        {/* RESUMEN */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Resumen del mes</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Gastado</Text>

              <Text style={styles.summaryAmount}>
                {formatCurrency(totalSpent)}
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <View style={styles.incomeHeader}>
                <Text style={styles.summaryLabel}>Ingresos</Text>

                <TouchableOpacity onPress={openIncomeModal} activeOpacity={0.7}>
                  <Text style={styles.editIncomeText}>Editar</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.incomeAmount}>{formatCurrency(income)}</Text>
            </View>
          </View>

          <View style={styles.savingsBox}>
            <View>
              <Text style={styles.savingsLabel}>Ahorro</Text>

              <Text style={styles.savingsAmount}>
                {formatCurrency(savings)}
              </Text>
            </View>

            <View style={styles.savingsBadge}>
              <Text style={styles.savingsBadgeText}>{savingsPercentage}%</Text>
            </View>
          </View>
        </View>

        {/* GASTOS POR CATEGORÍA */}
        <Text style={styles.sectionTitle}>Gastos por categoría</Text>

        <View style={styles.donutCard}>
          <View style={styles.donutContainer}>
            <DonutChart categories={displayCategories} />
          </View>

          <View style={styles.legend}>
            {displayCategories.map((category) => (
              <View key={category.name} style={styles.legendRow}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor: category.color,
                    },
                  ]}
                />

                <Text style={styles.legendPercentage}>
                  {category.percentage}%
                </Text>

                <Text style={styles.legendName}>{category.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* EVOLUCIÓN */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Evolución de gastos</Text>

          <Text style={styles.periodText}>Últimos meses</Text>
        </View>

        <View style={styles.evolutionCard}>
          <View style={styles.evolutionTop}>
            <View>
              <Text style={styles.evolutionLabel}>Total actual</Text>

              <Text style={styles.evolutionAmount}>
                {formatCurrency(currentMonthAmount)}
              </Text>
            </View>

            {growthPercentage !== null && (
              <View
                style={[
                  styles.growthBadge,
                  isGrowthPositive
                    ? styles.growthPositive
                    : styles.growthNegative,
                ]}
              >
                <Text
                  style={[
                    styles.growthArrow,
                    isGrowthPositive
                      ? styles.growthPositiveText
                      : styles.growthNegativeText,
                  ]}
                >
                  {isGrowthPositive ? "▲" : "▼"}
                </Text>

                <Text
                  style={[
                    styles.growthText,
                    isGrowthPositive
                      ? styles.growthPositiveText
                      : styles.growthNegativeText,
                  ]}
                >
                  {Math.abs(growthPercentage)}%
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.evolutionDescription}>
            {evolutionDescription}
          </Text>

          <View style={styles.chartContainer}>
            <LineChart monthlyExpenses={chartData} />
          </View>
        </View>

        {/* INSIGHT */}
        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Text style={styles.insightSymbol}>i</Text>
          </View>

          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Consejo</Text>

            <Text style={styles.insightText}>
              {highestCategory
                ? `${highestCategory.name} es tu categoría con más gastos este mes. Podés revisar tus consumos para encontrar oportunidades de ahorro.`
                : "Todavía no tenés gastos registrados este mes."}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* MODAL PARA EDITAR INGRESOS */}
      <Modal
        visible={incomeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIncomeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar ingresos</Text>

            <Text style={styles.modalDescription}>
              Ingresá el monto de tus ingresos mensuales.
            </Text>

            <TextInput
              value={incomeInput}
              onChangeText={setIncomeInput}
              placeholder="Ej: 350000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              style={styles.incomeInput}
            />

            {incomeError !== "" && (
              <Text style={styles.errorText}>{incomeError}</Text>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIncomeModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveButton} onPress={saveIncome}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 35,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 22,
  },

  smallTitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 3,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  headerCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  headerIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563EB",
  },

  summaryCard: {
    backgroundColor: "#1E3A8A",
    borderRadius: 22,
    padding: 20,
    marginBottom: 27,
  },

  summaryTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 20,
  },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  summaryItem: {
    flex: 1,
  },

  summaryLabel: {
    color: "#BFDBFE",
    fontSize: 12,
    marginBottom: 5,
  },

  incomeHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  editIncomeText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 5,
  },

  summaryAmount: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },

  incomeAmount: {
    color: "#6EE7B7",
    fontSize: 20,
    fontWeight: "700",
  },

  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: "#FFFFFF30",
    marginHorizontal: 15,
  },

  savingsBox: {
    backgroundColor: "#FFFFFF15",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  savingsLabel: {
    color: "#BFDBFE",
    fontSize: 11,
    marginBottom: 3,
  },

  savingsAmount: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  savingsBadge: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },

  savingsBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0D1B2A",
    marginBottom: 12,
  },

  donutCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 17,
    marginBottom: 27,
    flexDirection: "row",
    alignItems: "center",
  },

  donutContainer: {
    width: 165,
    height: 165,
    alignItems: "center",
    justifyContent: "center",
  },

  legend: {
    flex: 1,
    marginLeft: 5,
  },

  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 8,
  },

  legendPercentage: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "700",
    width: 32,
  },

  legendName: {
    color: "#64748B",
    fontSize: 11,
    flex: 1,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  periodText: {
    color: "#94A3B8",
    fontSize: 11,
    marginBottom: 12,
  },

  evolutionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 17,
    marginBottom: 16,
  },

  evolutionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  evolutionLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginBottom: 3,
  },

  evolutionAmount: {
    color: "#0D1B2A",
    fontSize: 25,
    fontWeight: "700",
  },

  growthBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  growthPositive: {
    backgroundColor: "#ECFDF5",
  },

  growthNegative: {
    backgroundColor: "#FEF2F2",
  },

  growthArrow: {
    fontSize: 9,
    marginRight: 4,
  },

  growthPositiveText: {
    color: "#10B981",
  },

  growthNegativeText: {
    color: "#EF4444",
  },

  growthText: {
    fontSize: 11,
    fontWeight: "700",
  },

  evolutionDescription: {
    color: "#94A3B8",
    fontSize: 11,
    marginTop: 3,
  },

  chartContainer: {
    marginTop: 12,
    marginLeft: -5,
    marginRight: -5,
  },

  emptyChart: {
    height: 190,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  emptyChartText: {
    color: "#94A3B8",
    fontSize: 11,
    textAlign: "center",
  },

  insightCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    padding: 17,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  insightIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  insightSymbol: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563EB",
  },

  insightContent: {
    flex: 1,
  },

  insightTitle: {
    color: "#1E3A8A",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },

  insightText: {
    color: "#475569",
    fontSize: 12,
    lineHeight: 18,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "#00000060",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0D1B2A",
    marginBottom: 7,
  },

  modalDescription: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 18,
    marginBottom: 18,
  },

  incomeInput: {
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#0D1B2A",
    marginBottom: 8,
  },

  errorText: {
    color: "#EF4444",
    fontSize: 11,
    marginBottom: 8,
  },

  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  cancelButton: {
    flex: 1,
    height: 45,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },

  saveButton: {
    flex: 1,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
