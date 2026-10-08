import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
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
import { Expense } from "../../data/expenses";

const EXPENSES_STORAGE_KEY = "gestor-gastos-gastos";

const zones = [
  "Palermo",
  "Recoleta",
  "Belgrano",
  "Microcentro",
  "Caballito",
  "Puerto Madero",
  "Flores",
];

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

export default function AgregarScreen() {
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Comida");
  const [paymentMethod, setPaymentMethod] = useState("Tarjeta de débito");
  const [note, setNote] = useState("");
  const [zone, setZone] = useState("Palermo");

  const handleSaveExpense = async () => {
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

      const currentExpenses: Expense[] = storedExpenses
        ? JSON.parse(storedExpenses)
        : [];

      const now = new Date();

      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");

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

      const fullDate = `${now.getDate()} de ${
        months[now.getMonth()]
      } de ${now.getFullYear()}`;

      const newExpense: Expense = {
        id: Date.now(),
        category: selectedCategory.name,
        description: description.trim(),
        time: `${hours}:${minutes}`,
        amount: `$${numericAmount.toLocaleString("es-AR")}`,
        color: selectedCategory.color,
        date: "Hoy",
        fullDate,
        paymentMethod,
        zone,
        note: note.trim(),
      };

      const updatedExpenses = [newExpense, ...currentExpenses];

      await AsyncStorage.setItem(
        EXPENSES_STORAGE_KEY,
        JSON.stringify(updatedExpenses),
      );

      setDescription("");
      setAmount("");
      setCategory("Comida");
      setPaymentMethod("Tarjeta de débito");
      setNote("");
      setZone("Palermo");

      Alert.alert("Gasto guardado", "El gasto se agregó correctamente.", [
        {
          text: "Aceptar",
          onPress: () => router.replace("/gastos"),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar el gasto.");
    }
  };

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

          <View style={styles.headerText}>
            <Text style={styles.smallTitle}>Nuevo movimiento</Text>

            <Text style={styles.title}>Agregar gasto</Text>
          </View>
        </View>

        {/* Descripción */}

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

        {/* Monto */}

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

        {/* Categoría */}

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

        {/* Medio de pago */}

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

        {/* Zona */}
        <View style={styles.section}>
          <Text style={styles.label}>Zona</Text>

          <View style={styles.optionsContainer}>
            {zones.map((item) => {
              const isSelected = zone === item;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.paymentButton,
                    isSelected && styles.paymentButtonActive,
                  ]}
                  onPress={() => setZone(item)}
                >
                  <Text
                    style={[
                      styles.paymentText,
                      isSelected && styles.paymentTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Nota */}

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

        {/* Guardar */}

        <Pressable style={styles.saveButton} onPress={handleSaveExpense}>
          <Text style={styles.saveButtonText}>Guardar gasto</Text>
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
    flexDirection: "row",
    alignItems: "center",
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
});
