import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Expense = {
  id: number;
  category: string;
  emoji: string;
  description: string;
  time: string;
  amount: string;
  color: string;
  date: string;
};

const expenses: Expense[] = [
  {
    id: 1,
    category: "Comida",
    emoji: "🍔",
    description: "McDonald's",
    time: "12:45",
    amount: "$12.500",
    color: "#F97316",
    date: "Hoy",
  },
  {
    id: 2,
    category: "Transporte",
    emoji: "🚗",
    description: "Uber",
    time: "09:20",
    amount: "$8.500",
    color: "#3B82F6",
    date: "Hoy",
  },
  {
    id: 3,
    category: "Compras",
    emoji: "🛍️",
    description: "Zara",
    time: "18:30",
    amount: "$24.000",
    color: "#A855F7",
    date: "Ayer",
  },
  {
    id: 4,
    category: "Entretenimiento",
    emoji: "🎬",
    description: "Cine",
    time: "21:15",
    amount: "$9.500",
    color: "#EC4899",
    date: "Ayer",
  },
  {
    id: 5,
    category: "Comida",
    emoji: "☕",
    description: "Starbucks",
    time: "16:10",
    amount: "$6.500",
    color: "#F97316",
    date: "12 Sep",
  },
  {
    id: 6,
    category: "Otros",
    emoji: "💊",
    description: "Farmacia",
    time: "11:05",
    amount: "$7.800",
    color: "#10B981",
    date: "12 Sep",
  },
];

export default function GastosScreen() {
  const router = useRouter();

  const [filter, setFilter] = useState("Todos");

  const filteredExpenses =
    filter === "Todos"
      ? expenses
      : expenses.filter((expense) => expense.category === filter);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Encabezado */}
        <View style={styles.header}>
          <View>
            <Text style={styles.smallTitle}>Septiembre 2026</Text>
            <Text style={styles.title}>Mis gastos</Text>
          </View>

          <View style={styles.totalCircle}>
            <Text style={styles.totalCircleText}>$</Text>
          </View>
        </View>

        {/* Resumen */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Total gastado</Text>
            <Text style={styles.summaryAmount}>$185.450</Text>
          </View>

          <View style={styles.expenseCount}>
            <Text style={styles.countNumber}>{expenses.length}</Text>
            <Text style={styles.countLabel}>gastos</Text>
          </View>
        </View>

        {/* Filtros */}
        <Text style={styles.sectionTitle}>Filtrar por categoría</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {["Todos", "Comida", "Transporte", "Compras"].map((item) => (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={[
                styles.filterButton,
                filter === item && styles.filterButtonActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item && styles.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Lista */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Movimientos</Text>
          <Text style={styles.countText}>
            {filteredExpenses.length} resultados
          </Text>
        </View>

        {filteredExpenses.map((expense) => (
          <Pressable
            key={expense.id}
            style={styles.expenseCard}
            onPress={() => router.push("/detalle")}
          >
            <View
              style={[
                styles.categoryIcon,
                { backgroundColor: expense.color + "20" },
              ]}
            >
              <Text style={styles.emoji}>{expense.emoji}</Text>
            </View>

            <View style={styles.expenseInfo}>
              <Text style={styles.expenseDescription}>
                {expense.description}
              </Text>

              <Text style={styles.expenseCategory}>
                {expense.category} · {expense.time}
              </Text>
            </View>

            <View style={styles.expenseRight}>
              <Text style={styles.expenseAmount}>{expense.amount}</Text>

              <Text style={styles.expenseDate}>{expense.date}</Text>
            </View>
          </Pressable>
        ))}
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
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
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

  totalCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  totalCircleText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563EB",
  },

  summaryCard: {
    backgroundColor: "#1E3A8A",
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  summaryLabel: {
    color: "#BFDBFE",
    fontSize: 14,
    marginBottom: 5,
  },

  summaryAmount: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "700",
  },

  expenseCount: {
    backgroundColor: "#FFFFFF20",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: "center",
  },

  countNumber: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  countLabel: {
    color: "#DBEAFE",
    fontSize: 11,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0D1B2A",
    marginBottom: 12,
  },

  filters: {
    gap: 9,
    paddingBottom: 25,
  },

  filterButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  filterButtonActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  filterText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  countText: {
    color: "#94A3B8",
    fontSize: 12,
  },

  expenseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  emoji: {
    fontSize: 22,
  },

  expenseInfo: {
    flex: 1,
  },

  expenseDescription: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0D1B2A",
    marginBottom: 4,
  },

  expenseCategory: {
    fontSize: 12,
    color: "#94A3B8",
  },

  expenseRight: {
    alignItems: "flex-end",
  },

  expenseAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0D1B2A",
    marginBottom: 4,
  },

  expenseDate: {
    fontSize: 11,
    color: "#94A3B8",
  },
});
