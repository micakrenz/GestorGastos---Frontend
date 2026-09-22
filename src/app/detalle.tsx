import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DetalleScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Encabezado */}
        <View style={styles.header}>
          <Pressable style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Detalle del gasto</Text>

          <View style={styles.headerSpace} />
        </View>

        {/* Icono principal */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.emoji}>🍔</Text>
          </View>

          <Text style={styles.category}>Comida</Text>
          <Text style={styles.place}>McDonald's</Text>
        </View>

        {/* Monto */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Monto</Text>
          <Text style={styles.amount}>$12.500</Text>
        </View>

        {/* Información */}
        <Text style={styles.sectionTitle}>Información</Text>

        <View style={styles.infoCard}>
          <InfoRow icon="📅" label="Fecha" value="18 de septiembre de 2026" />

          <InfoRow icon="🕐" label="Hora" value="12:45" />

          <InfoRow icon="🏷️" label="Categoría" value="Comida" />

          <InfoRow icon="💳" label="Método de pago" value="Tarjeta de débito" />
        </View>

        {/* Nota */}
        <Text style={styles.sectionTitle}>Nota</Text>

        <View style={styles.noteCard}>
          <Text style={styles.note}>Almuerzo con amigos</Text>
        </View>

        {/* Botón editar */}
        <Pressable style={styles.editButton}>
          <Text style={styles.editButtonText}>Editar gasto</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Text style={styles.infoEmoji}>{icon}</Text>
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
    backgroundColor: "#FFF0E6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emoji: {
    fontSize: 38,
  },

  category: {
    fontSize: 13,
    color: "#F97316",
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

  infoRowLast: {
    marginBottom: 0,
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

  infoEmoji: {
    fontSize: 18,
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
  },

  editButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
