import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Expense } from "../data/expenses";

const EXPENSES_STORAGE_KEY = "gestor-gastos-gastos";

export default function DetalleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const loadExpense = async () => {
        try {
          setIsLoading(true);

          const storedExpenses =
            await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);

          if (!storedExpenses) {
            setExpense(null);
            return;
          }

          const storedExpensesList: Expense[] = JSON.parse(storedExpenses);

          const foundExpense = storedExpensesList.find(
            (item) => item.id.toString() === id?.toString(),
          );

          setExpense(foundExpense ?? null);
        } catch (error) {
          setExpense(null);
        } finally {
          setIsLoading(false);
        }
      };

      loadExpense();
    }, [id]),
  );

  const handleDeleteExpense = () => {
    if (!expense) {
      return;
    }

    Alert.alert(
      "Eliminar gasto",
      `¿Estás seguro de que querés eliminar "${expense.description}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const storedExpenses =
                await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);

              if (!storedExpenses) {
                return;
              }

              const storedExpensesList: Expense[] = JSON.parse(storedExpenses);

              const updatedExpenses = storedExpensesList.filter(
                (item) => item.id !== expense.id,
              );

              await AsyncStorage.setItem(
                EXPENSES_STORAGE_KEY,
                JSON.stringify(updatedExpenses),
              );

              router.replace("/gastos");
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar el gasto.");
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando gasto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!expense) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Gasto no encontrado</Text>

          <Pressable
            style={styles.backErrorButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backErrorButtonText}>Volver</Text>
          </Pressable>
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
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Detalle del gasto</Text>

          <View style={styles.headerSpace} />
        </View>

        {/* Categoría y descripción */}

        <View style={styles.iconContainer}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: expense.color + "20" },
            ]}
          >
            <View
              style={[
                styles.categoryIndicator,
                { backgroundColor: expense.color },
              ]}
            />
          </View>

          <Text style={[styles.category, { color: expense.color }]}>
            {expense.category}
          </Text>

          <Text style={styles.place}>{expense.description}</Text>
        </View>

        {/* Monto */}

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Monto</Text>
          <Text style={styles.amount}>{expense.amount}</Text>
        </View>

        {/* Información */}

        <Text style={styles.sectionTitle}>Información</Text>

        <View style={styles.infoCard}>
          <InfoRow label="Fecha" value={expense.fullDate} />

          <InfoRow label="Hora" value={expense.time} />

          <InfoRow label="Categoría" value={expense.category} />

          <InfoRow label="Método de pago" value={expense.paymentMethod} />

          <InfoRow label="Zona" value={expense.zone} />
        </View>

        {/* Nota */}

        <Text style={styles.sectionTitle}>Nota</Text>

        <View style={styles.noteCard}>
          <Text style={styles.note}>
            {expense.note.trim() ? expense.note : "Sin nota"}
          </Text>
        </View>

        {/* Editar */}

        <Pressable
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: "/editar",
              params: {
                id: expense.id.toString(),
              },
            })
          }
        >
          <Text style={styles.editButtonText}>Editar gasto</Text>
        </Pressable>

        {/* Eliminar */}

        <Pressable style={styles.deleteButton} onPress={handleDeleteExpense}>
          <Text style={styles.deleteButtonText}>Eliminar gasto</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <View style={styles.infoIconDot} />
      </View>

      <View style={styles.infoText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
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
    paddingBottom: 35,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 30,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  backArrow: {
    fontSize: 30,
    color: "#0D1B2A",
    marginTop: -3,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  headerSpace: {
    width: 42,
  },

  iconContainer: {
    alignItems: "center",
    marginBottom: 28,
  },

  iconCircle: {
    width: 82,
    height: 82,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  categoryIndicator: {
    width: 30,
    height: 30,
    borderRadius: 10,
  },

  category: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 5,
  },

  place: {
    fontSize: 23,
    color: "#0D1B2A",
    fontWeight: "700",
  },

  amountCard: {
    backgroundColor: "#1E3A8A",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    marginBottom: 28,
  },

  amountLabel: {
    color: "#BFDBFE",
    fontSize: 13,
    marginBottom: 5,
  },

  amount: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0D1B2A",
    marginBottom: 12,
  },

  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 17,
    marginBottom: 25,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 17,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoIconDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563EB",
  },

  infoText: {
    flex: 1,
  },

  infoLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginBottom: 3,
  },

  infoValue: {
    color: "#0D1B2A",
    fontSize: 14,
    fontWeight: "600",
  },

  noteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    marginBottom: 25,
  },

  note: {
    color: "#64748B",
    fontSize: 14,
  },

  editButton: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  editButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  deleteButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },

  deleteButtonText: {
    color: "#DC2626",
    fontSize: 15,
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

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0D1B2A",
    marginBottom: 20,
  },

  backErrorButton: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingHorizontal: 25,
    paddingVertical: 12,
  },

  backErrorButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
