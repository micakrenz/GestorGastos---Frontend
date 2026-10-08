import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Expense, expenses as initialExpenses } from "../../data/expenses";

const EXPENSES_STORAGE_KEY = "gestor-gastos-gastos";

export default function GastosScreen() {
  const router = useRouter();

  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  const [filter, setFilter] = useState("Todos");

  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar los gastos guardados
  useFocusEffect(
    useCallback(() => {
      const loadExpenses = async () => {
        try {
          const storedExpenses =
            await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);

          if (storedExpenses) {
            setExpenses(JSON.parse(storedExpenses));
          }
        } catch {
        } finally {
          setIsHydrated(true);
        }
      };

      loadExpenses();
    }, []),
  );

  const categories = [
    "Todos",
    ...new Set(expenses.map((expense) => expense.category)),
  ];

  const filteredExpenses =
    filter === "Todos"
      ? expenses
      : expenses.filter((expense) => expense.category === filter);

  const totalAmount = expenses.reduce((total, expense) => {
    const numericAmount = Number(
      expense.amount.replace("$", "").replace(".", ""),
    );

    return total + numericAmount;
  }, 0);

  const formattedTotal = `$${totalAmount.toLocaleString("es-AR")}`;

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando gastos...</Text>
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
        {/* Encabezado */}
        <View style={styles.header}>
          <View>
            <Text style={styles.smallTitle}>Septiembre 2026</Text>

            <Text style={styles.title}>Mis gastos</Text>
          </View>
        </View>

        {/* Resumen */}
        <View style={styles.summaryCard}>
          <View>
            <Text style={styles.summaryLabel}>Total gastado</Text>

            <Text style={styles.summaryAmount}>{formattedTotal}</Text>
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
          {categories.map((item) => (
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
            onPress={() =>
              router.push({
                pathname: "/detalle",
                params: {
                  id: expense.id.toString(),
                },
              })
            }
          >
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

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    fontSize: 15,
    color: "#64748B",
  },
});
