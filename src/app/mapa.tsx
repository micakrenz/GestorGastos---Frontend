import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { Expense } from "../data/expenses";

const EXPENSES_STORAGE_KEY = "gestor-gastos-gastos";

type Frequency = "Baja" | "Media" | "Alta";

type Zone = {
  name: string;
  frequency: number;
  level: Frequency;
  latitude: number;
  longitude: number;
  radius: number;
  color: string;
};

type ZoneInfo = {
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
};

const zoneInfo: ZoneInfo[] = [
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
    radius: 450,
  },
];

const filters: ("Todos" | Frequency)[] = ["Todos", "Baja", "Media", "Alta"];

function getFrequencyLevel(frequency: number): Frequency {
  if (frequency <= 4) {
    return "Baja";
  }

  if (frequency <= 9) {
    return "Media";
  }

  return "Alta";
}

function getFrequencyColor(level: Frequency) {
  if (level === "Baja") {
    return "#22C55E";
  }

  if (level === "Media") {
    return "#FACC15";
  }

  return "#EF4444";
}

export default function MapaScreen() {
  const router = useRouter();

  const [selectedFilter, setSelectedFilter] = useState<"Todos" | Frequency>(
    "Todos",
  );

  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);

  const [zones, setZones] = useState<Zone[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadExpenses = async () => {
        try {
          const storedExpenses =
            await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);

          const expenses: Expense[] = storedExpenses
            ? JSON.parse(storedExpenses)
            : [];

          const calculatedZones: Zone[] = zoneInfo
            .map((zone) => {
              const zoneExpenses = expenses.filter(
                (expense) => expense.zone === zone.name,
              );

              const frequency = zoneExpenses.length;
              const level = getFrequencyLevel(frequency);
              const color = getFrequencyColor(level);

              return {
                name: zone.name,
                frequency,
                level,
                latitude: zone.latitude,
                longitude: zone.longitude,
                radius: zone.radius,
                color,
              };
            })
            .filter((zone) => zone.frequency > 0);

          setZones(calculatedZones);

          setSelectedZone((currentSelectedZone) => {
            if (!currentSelectedZone) {
              return null;
            }

            return (
              calculatedZones.find(
                (zone) => zone.name === currentSelectedZone.name,
              ) ?? null
            );
          });
        } catch (error) {
          setZones([]);
          setSelectedZone(null);
        }
      };

      loadExpenses();
    }, []),
  );

  const filteredZones =
    selectedFilter === "Todos"
      ? zones
      : zones.filter((zone) => zone.level === selectedFilter);

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>Mapa de gastos</Text>
          <Text style={styles.subtitle}>
            Distribución de tus gastos por zona
          </Text>
        </View>
      </View>

      {/* Filtros */}

      <View style={styles.filtersContainer}>
        {filters.map((filter) => {
          const isSelected = selectedFilter === filter;

          return (
            <Pressable
              key={filter}
              style={[
                styles.filterButton,
                isSelected && styles.filterButtonSelected,
              ]}
              onPress={() => {
                setSelectedFilter(filter);

                setSelectedZone(null);
              }}
            >
              {filter !== "Todos" && (
                <View
                  style={[
                    styles.filterDot,
                    {
                      backgroundColor:
                        filter === "Baja"
                          ? "#22C55E"
                          : filter === "Media"
                            ? "#FACC15"
                            : "#EF4444",
                    },
                  ]}
                />
              )}

              <Text
                style={[
                  styles.filterText,
                  isSelected && styles.filterTextSelected,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Mapa */}

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: -34.59,
            longitude: -58.415,
            latitudeDelta: 0.105,
            longitudeDelta: 0.105,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          showsBuildings={true}
        >
          {filteredZones.map((zone) => (
            <View key={zone.name}>
              <Circle
                center={{
                  latitude: zone.latitude,
                  longitude: zone.longitude,
                }}
                radius={zone.radius}
                fillColor={`${zone.color}45`}
                strokeColor={`${zone.color}99`}
                strokeWidth={1}
              />

              <Marker
                coordinate={{
                  latitude: zone.latitude,
                  longitude: zone.longitude,
                }}
                onPress={() => setSelectedZone(zone)}
              >
                <View
                  style={[
                    styles.marker,
                    {
                      borderColor: zone.color,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.markerText,
                      {
                        color: zone.color,
                      },
                    ]}
                  >
                    {zone.frequency}
                  </Text>
                </View>
              </Marker>
            </View>
          ))}
        </MapView>

        {/* Información de zona seleccionada */}

        {selectedZone && (
          <View style={styles.selectedCard}>
            <View
              style={[
                styles.selectedDot,
                {
                  backgroundColor: selectedZone.color,
                },
              ]}
            />

            <View style={styles.selectedInfo}>
              <Text style={styles.selectedName}>{selectedZone.name}</Text>

              <Text style={styles.selectedFrequency}>
                {selectedZone.frequency}{" "}
                {selectedZone.frequency === 1 ? "gasto" : "gastos"}
              </Text>
            </View>

            <Pressable
              onPress={() => setSelectedZone(null)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
        )}

        {/* Mensaje cuando no hay gastos */}

        {filteredZones.length === 0 && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No hay gastos para mostrar</Text>

            <Text style={styles.emptyText}>
              Agregá gastos con una zona seleccionada para verlos en el mapa.
            </Text>
          </View>
        )}
      </View>

      {/* Leyenda */}

      <View style={styles.legendCard}>
        <Text style={styles.legendTitle}>Frecuencia de gastos</Text>

        <View style={styles.legendRow}>
          {/* Baja */}

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#22C55E" }]} />

            <View>
              <Text style={styles.legendLabel}>Baja</Text>

              <Text style={styles.legendDescription}>1–4 gastos</Text>
            </View>
          </View>

          {/* Media */}

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#FACC15" }]} />

            <View>
              <Text style={styles.legendLabel}>Media</Text>

              <Text style={styles.legendDescription}>5–9 gastos</Text>
            </View>
          </View>

          {/* Alta */}

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#EF4444" }]} />

            <View>
              <Text style={styles.legendLabel}>Alta</Text>

              <Text style={styles.legendDescription}>10+ gastos</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  backArrow: {
    fontSize: 36,
    color: "#0D1B2A",
    fontWeight: "400",
  },

  headerText: {
    flex: 1,
  },

  title: {
    fontSize: 27,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },

  filtersContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },

  filterButton: {
    height: 36,
    paddingHorizontal: 13,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  filterButtonSelected: {
    backgroundColor: "#DBEAFE",
    borderColor: "#93C5FD",
  },

  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  filterText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },

  filterTextSelected: {
    color: "#2563EB",
  },

  mapContainer: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 22,
    overflow: "hidden",
    position: "relative",
  },

  map: {
    flex: 1,
  },

  marker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderWidth: 4,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  markerText: {
    fontSize: 15,
    fontWeight: "700",
  },

  selectedCard: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  selectedDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },

  selectedInfo: {
    flex: 1,
  },

  selectedName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0D1B2A",
    marginBottom: 2,
  },

  selectedFrequency: {
    fontSize: 12,
    color: "#64748B",
  },

  closeButton: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  closeText: {
    fontSize: 25,
    color: "#94A3B8",
  },

  emptyCard: {
    position: "absolute",
    left: 24,
    right: 24,
    top: "40%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0D1B2A",
    marginBottom: 5,
  },

  emptyText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
  },

  legendCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 18,
    padding: 14,
  },

  legendTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0D1B2A",
    marginBottom: 10,
  },

  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  legendDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    marginRight: 7,
  },

  legendLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  legendDescription: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 1,
  },
});
