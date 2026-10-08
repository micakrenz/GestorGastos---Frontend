import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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

const zoneInfo = [
  {
    name: "Palermo",
    latitude: -34.588,
    longitude: -58.41,
    radius: 900,
  },
  {
    name: "Recoleta",
    latitude: -34.588,
    longitude: -58.397,
    radius: 750,
  },
  {
    name: "Belgrano",
    latitude: -34.565,
    longitude: -58.455,
    radius: 650,
  },
  {
    name: "Microcentro",
    latitude: -34.603,
    longitude: -58.382,
    radius: 550,
  },
  {
    name: "Caballito",
    latitude: -34.615,
    longitude: -58.435,
    radius: 450,
  },
  {
    name: "Puerto Madero",
    latitude: -34.611,
    longitude: -58.362,
    radius: 500,
  },
  {
    name: "Flores",
    latitude: -34.628,
    longitude: -58.462,
    radius: 1500,
  },
];

const categories = [
  { name: "Comida", color: "#F97316" },
  { name: "Transporte", color: "#3B82F6" },
  { name: "Compras", color: "#A855F7" },
  { name: "Entretenimiento", color: "#EC4899" },
  { name: "Otros", color: "#10B981" },
];

const paymentMethods = ["Tarjeta de débito", "Tarjeta de crédito", "Efectivo"];

function getDistanceInMeters(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number,
) {
  const earthRadius = 6371000;

  const latitudeDifference = ((latitude2 - latitude1) * Math.PI) / 180;

  const longitudeDifference = ((longitude2 - longitude1) * Math.PI) / 180;

  const latitude1InRadians = (latitude1 * Math.PI) / 180;

  const latitude2InRadians = (latitude2 * Math.PI) / 180;

  const a =
    Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) +
    Math.cos(latitude1InRadians) *
      Math.cos(latitude2InRadians) *
      Math.sin(longitudeDifference / 2) *
      Math.sin(longitudeDifference / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

function getZoneFromLocation(latitude: number, longitude: number) {
  const matchingZones = zoneInfo
    .map((zone) => ({
      ...zone,
      distance: getDistanceInMeters(
        latitude,
        longitude,
        zone.latitude,
        zone.longitude,
      ),
    }))
    .filter((zone) => zone.distance <= zone.radius)
    .sort((a, b) => a.distance - b.distance);

  return matchingZones[0]?.name ?? null;
}

export default function AgregarScreen() {
  const router = useRouter();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Comida");
  const [paymentMethod, setPaymentMethod] = useState("Tarjeta de débito");
  const [note, setNote] = useState("");

  const [zone, setZone] = useState("");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [locationLoading, setLocationLoading] = useState(false);

  const handleGetLocation = async () => {
    try {
      setLocationLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permiso de ubicación",
          "Necesitamos acceso a tu ubicación para asociarla al gasto.",
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const latitude = currentLocation.coords.latitude;
      const longitude = currentLocation.coords.longitude;

      const detectedZone = getZoneFromLocation(latitude, longitude);

      if (!detectedZone) {
        setLocation(null);
        setZone("");

        Alert.alert(
          "Zona no identificada",
          "Tu ubicación está fuera de las zonas disponibles. Podés seleccionar una zona manualmente.",
        );

        return;
      }

      setLocation({
        latitude,
        longitude,
      });

      setZone(detectedZone);

      Alert.alert(
        "Ubicación obtenida",
        `Detectamos que estás en ${detectedZone}.`,
      );
    } catch (error) {
      Alert.alert("Error", "No se pudo obtener tu ubicación actual.");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSelectZone = (selectedZone: string) => {
    setZone(selectedZone);

    // Si el usuario elige manualmente una zona,
    // eliminamos las coordenadas obtenidas anteriormente
    // para evitar inconsistencias.
    setLocation(null);
  };

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

    if (!zone) {
      Alert.alert(
        "Ubicación requerida",
        "Seleccioná una zona o usá tu ubicación actual.",
      );
      return;
    }

    const selectedCategory = categories.find((item) => item.name === category);

    if (!selectedCategory) return;

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
        latitude: location?.latitude,
        longitude: location?.longitude,
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
      setZone("");
      setLocation(null);

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
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>‹</Text>
          </Pressable>

          <Text style={styles.title}>Agregar gasto</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.label}>Descripción</Text>

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Ej. Supermercado"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Monto</Text>

            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="Ej. 15000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              style={styles.input}
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
                    onPress={() => setCategory(item.name)}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonActive,
                    ]}
                  >
                    <View
                      style={[
                        styles.categoryDot,
                        {
                          backgroundColor: item.color,
                        },
                      ]}
                    />

                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextActive,
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
                    onPress={() => setPaymentMethod(method)}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextActive,
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
            <Text style={styles.label}>Ubicación</Text>

            <Pressable
              onPress={handleGetLocation}
              disabled={locationLoading}
              style={[
                styles.locationButton,
                locationLoading && styles.locationButtonDisabled,
              ]}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color="#2563EB" />
              ) : (
                <Text style={styles.locationIcon}>●</Text>
              )}

              <View style={styles.locationButtonContent}>
                <Text style={styles.locationButtonTitle}>
                  {locationLoading
                    ? "Obteniendo ubicación..."
                    : "Usar ubicación actual"}
                </Text>

                <Text style={styles.locationButtonSubtitle}>
                  Detectaremos automáticamente la zona
                </Text>
              </View>
            </Pressable>

            {location && zone ? (
              <View style={styles.detectedLocation}>
                <Text style={styles.detectedLocationTitle}>
                  Ubicación detectada
                </Text>

                <Text style={styles.detectedLocationText}>{zone}</Text>
              </View>
            ) : null}

            <Text style={styles.orText}>O seleccioná una zona manualmente</Text>

            <View style={styles.optionsContainer}>
              {zones.map((item) => {
                const isSelected = zone === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() => handleSelectZone(item)}
                    style={[
                      styles.optionButton,
                      isSelected && styles.optionButtonActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextActive,
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
              value={note}
              onChangeText={setNote}
              placeholder="Agregá una nota opcional"
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              style={[styles.input, styles.noteInput]}
            />
          </View>

          <Pressable onPress={handleSaveExpense} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Guardar gasto</Text>
          </Pressable>
        </View>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 18,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  backButtonText: {
    fontSize: 30,
    color: "#0D1B2A",
    lineHeight: 32,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  headerSpacer: {
    width: 40,
  },

  form: {
    gap: 22,
  },

  section: {
    gap: 10,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0D1B2A",
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 15,
    paddingHorizontal: 16,
    height: 52,
    fontSize: 15,
    color: "#0D1B2A",
  },

  noteInput: {
    height: 100,
    paddingTop: 15,
  },

  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  optionButton: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  optionButtonActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },

  optionText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },

  optionTextActive: {
    color: "#2563EB",
    fontWeight: "600",
  },

  categoryDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 7,
  },

  locationButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
  },

  locationButtonDisabled: {
    opacity: 0.7,
  },

  locationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    color: "#2563EB",
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 18,
    marginRight: 12,
  },

  locationButtonContent: {
    flex: 1,
  },

  locationButtonTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563EB",
  },

  locationButtonSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  detectedLocation: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  detectedLocationTitle: {
    fontSize: 12,
    color: "#047857",
    fontWeight: "500",
  },

  detectedLocationText: {
    fontSize: 15,
    color: "#065F46",
    fontWeight: "700",
    marginTop: 2,
  },

  orText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  saveButton: {
    height: 54,
    borderRadius: 15,
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
