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
import { createExpense } from "../../services/api";

const categories = [
  { name: "Comida", color: "#F97316" },
  { name: "Transporte", color: "#3B82F6" },
  { name: "Compras", color: "#A855F7" },
  { name: "Entretenimiento", color: "#EC4899" },
  { name: "Otros", color: "#10B981" },
];

const paymentMethods = ["Tarjeta de débito", "Tarjeta de crédito", "Efectivo"];

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
          "No se obtuvo la ubicación. Podés continuar y guardar el gasto sin ubicación.",
        );
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const latitude = currentLocation.coords.latitude;
      const longitude = currentLocation.coords.longitude;

      const response = await fetch(
        `https://apis.datos.gob.ar/georef/api/v2.0/ubicacion?lat=${latitude}&lon=${longitude}`,
      );
      if (!response.ok) throw new Error("No se pudo consultar Georef");
      const data = await response.json();
      const ubicacion = data?.ubicacion;
      const detectedZone =
        ubicacion?.barrio?.nombre ??
        ubicacion?.localidad_censal?.nombre ??
        ubicacion?.localidad?.nombre ??
        ubicacion?.municipio?.nombre ??
        ubicacion?.departamento?.nombre ??
        ubicacion?.provincia?.nombre;

      if (!detectedZone) {
        setLocation({ latitude, longitude });
        setZone("");
        Alert.alert(
          "Zona no identificada",
          "Se guardaron las coordenadas GPS, pero no pudimos identificar el barrio. Podés guardar el gasto sin una zona.",
        );
        return;
      }

      setLocation({ latitude, longitude });
      setZone(detectedZone);
      Alert.alert("Ubicación obtenida", `La API identificó: ${detectedZone}.`);
    } catch (error) {
      Alert.alert(
        "Ubicación no disponible",
        "No se pudo obtener tu ubicación actual. Podés guardar el gasto sin ubicación.",
      );
    } finally {
      setLocationLoading(false);
    }
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

    const selectedCategory = categories.find((item) => item.name === category);

    if (!selectedCategory) return;

    try {
      const now = new Date();
      await createExpense({
        category: selectedCategory.name,
        description: description.trim(),
        amount: `$${numericAmount.toLocaleString("es-AR")}`,
        date: now.toISOString(),
        paymentMethod,
        zone,
        note: note.trim(),
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

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
