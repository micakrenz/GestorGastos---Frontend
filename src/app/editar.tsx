import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Expense, expenses as initialExpenses } from "../data/expenses";

const EXPENSES_STORAGE_KEY = "gestor-gastos-gastos";

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

const paymentMethods = ["Tarjeta de débito", "Tarjeta de crédito", "Efectivo"];

const zones = [
  "Palermo",
  "Recoleta",
  "Belgrano",
  "Microcentro",
  "Caballito",
  "Puerto Madero",
  "Flores",
];

export default function EditarScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Comida");
  const [paymentMethod, setPaymentMethod] = useState("Tarjeta de débito");
  const [zone, setZone] = useState("Palermo");
  const [note, setNote] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadExpense = async () => {
      try {
        const storedExpenses = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);

        const expensesList: Expense[] = storedExpenses
          ? JSON.parse(storedExpenses)
          : initialExpenses;

        const expense = expensesList.find(
          (item) => item.id.toString() === id?.toString(),
        );

        if (!expense) {
          return;
        }

        setDescription(expense.description);

        setAmount(expense.amount.replace("$", "").replace(/\./g, ""));

        setCategory(expense.category);

        setPaymentMethod(expense.paymentMethod);

        setZone(expense.zone);

        setNote(expense.note);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    loadExpense();
  }, [id]);

  const handleSaveChanges = async () => {
    if (!description.trim()) {
      Alert.alert(
        "Descripción inválida",
        "Ingresá una descripción para el gasto.",
      );
      return;
    }

    const numericAmount = Number(amount.replace(/\D/g, ""));

    if (!numericAmount || numericAmount <= 0) {
      Alert.alert("Monto inválido", "Ingresá un monto mayor a $0.");
      return;
    }

    const selectedCategory = categories.find((item) => item.name === category);

    if (!selectedCategory) {
      return;
    }

    try {
      const storedExpenses = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);

      const expensesList: Expense[] = storedExpenses
        ? JSON.parse(storedExpenses)
        : initialExpenses;

      const updatedExpenses = expensesList.map((item) => {
        if (item.id !== Number(id)) {
          return item;
        }

        return {
          ...item,
          description: description.trim(),
          amount: `$${numericAmount.toLocaleString("es-AR")}`,
          category: selectedCategory.name,
          color: selectedCategory.color,
          paymentMethod,
          zone,
          note: note.trim(),
        };
      });

      await AsyncStorage.setItem(
        EXPENSES_STORAGE_KEY,
        JSON.stringify(updatedExpenses),
      );

      Alert.alert(
        "Gasto actualizado",
        "Los cambios se guardaron correctamente.",
        [
          {
            text: "Aceptar",
            onPress: () => router.back(),
          },
        ],
      );
    } catch (error) {
      Alert.alert("Error", "No se pudieron guardar los cambios.");
    }
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.smallTitle}>Modificar movimiento</Text>

            <Text style={styles.title}>Editar gasto</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Descripción</Text>

          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder="Ej: Cena con amigos"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Monto</Text>

          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="Ej: 15000"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Categoría</Text>

          <View style={styles.optionsContainer}>
            {categories.map((item) => {
              const isSelected = category === item.name;

              return (
                <Pressable
                  key={item.name}
                  style={[
                    styles.categoryButton,
                    isSelected && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(item.name)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && styles.categoryTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Medio de pago</Text>

          <View style={styles.optionsContainer}>
            {paymentMethods.map((method) => {
              const isSelected = paymentMethod === method;

              return (
                <Pressable
                  key={method}
                  style={[
                    styles.paymentButton,
                    isSelected && styles.paymentButtonActive,
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text
                    style={[
                      styles.paymentText,
                      isSelected && styles.paymentTextActive,
                    ]}
                  >
                    {method}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Zona</Text>

          <View style={styles.optionsContainer}>
            {zones.map((item) => {
              const isSelected = zone === item;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.zoneButton,
                    isSelected && styles.zoneButtonActive,
                  ]}
                  onPress={() => setZone(item)}
                >
                  <Text
                    style={[
                      styles.zoneText,
                      isSelected && styles.zoneTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Nota</Text>

          <TextInput
            style={[styles.input, styles.noteInput]}
            value={note}
            onChangeText={setNote}
            placeholder="Agregá una nota opcional"
            placeholderTextColor="#9CA3AF"
            multiline
            textAlignVertical="top"
          />
        </View>

        <Pressable style={styles.saveButton} onPress={handleSaveChanges}>
          <Text style={styles.saveButtonText}>Guardar cambios</Text>
        </Pressable>
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
    marginTop: 10,
    marginBottom: 28,
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

  headerText: {
    flex: 1,
  },

  smallTitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 3,
  },

  title: {
    fontSize: 27,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  section: {
    marginBottom: 22,
  },

  label: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0D1B2A",
    marginBottom: 9,
  },

  input: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#0D1B2A",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  noteInput: {
    height: 100,
    paddingTop: 14,
  },

  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  categoryButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  categoryButtonActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },

  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  categoryTextActive: {
    color: "#2563EB",
  },

  paymentButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  paymentButtonActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },

  paymentText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  paymentTextActive: {
    color: "#2563EB",
  },

  zoneButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  zoneButtonActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },

  zoneText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  zoneTextActive: {
    color: "#2563EB",
  },

  saveButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
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
