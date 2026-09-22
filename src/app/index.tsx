import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Encabezado */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>¡Hola! 👋</Text>
            <Text style={styles.title}>Tus gastos</Text>
          </View>

          <View style={styles.profileCircle}>
            <Text style={styles.profileText}>M</Text>
          </View>
        </View>

        {/* Selector de mes */}
        <View style={styles.monthSelector}>
          <Text style={styles.arrow}>‹</Text>
          <Text style={styles.month}>Septiembre 2026</Text>
          <Text style={styles.arrow}>›</Text>
        </View>

        {/* Gasto total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Gasto total</Text>
          <Text style={styles.totalAmount}>$185.450</Text>

          <View style={styles.totalFooter}>
            <Text style={styles.totalDescription}>Este mes llevás gastado</Text>

            <View style={styles.percentageBadge}>
              <Text style={styles.percentageText}>+12,5%</Text>
            </View>
          </View>
        </View>

        {/* Ingresos y ahorro */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryIconGreen}>
              <Text>↗</Text>
            </View>

            <Text style={styles.summaryLabel}>Ingresos</Text>
            <Text style={styles.summaryAmount}>$350.000</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryIconBlue}>
              <Text>✓</Text>
            </View>

            <Text style={styles.summaryLabel}>Ahorro</Text>
            <Text style={styles.summaryAmount}>$164.550</Text>
          </View>
        </View>

        {/* Categorías */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Gastos por categoría</Text>
          <Text style={styles.seeMore}>Ver más</Text>
        </View>

        <View style={styles.categoryCard}>
          <Category
            emoji="🍔"
            name="Comida"
            amount="$65.000"
            percentage="35%"
            progress={0.35}
            color="#F97316"
          />

          <Category
            emoji="🚗"
            name="Transporte"
            amount="$42.500"
            percentage="23%"
            progress={0.23}
            color="#3B82F6"
          />

          <Category
            emoji="🛍️"
            name="Compras"
            amount="$36.000"
            percentage="19%"
            progress={0.19}
            color="#A855F7"
          />

          <Category
            emoji="🎬"
            name="Entretenimiento"
            amount="$25.000"
            percentage="13%"
            progress={0.13}
            color="#EC4899"
          />

          <Category
            emoji="💊"
            name="Otros"
            amount="$16.950"
            percentage="10%"
            progress={0.1}
            color="#10B981"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Category({
  emoji,
  name,
  amount,
  percentage,
  progress,
  color,
}: {
  emoji: string;
  name: string;
  amount: string;
  percentage: string;
  progress: number;
  color: string;
}) {
  return (
    <View style={styles.category}>
      <View style={styles.categoryTop}>
        <View style={styles.categoryInfo}>
          <View
            style={[styles.categoryIcon, { backgroundColor: color + "20" }]}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </View>

          <View>
            <Text style={styles.categoryName}>{name}</Text>
            <Text style={styles.categoryPercentage}>{percentage}</Text>
          </View>
        </View>

        <Text style={styles.categoryAmount}>{amount}</Text>
      </View>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progress,
            {
              width: `${progress * 100}%`,
              backgroundColor: color,
            },
          ]}
        />
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
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  greeting: {
    fontSize: 15,
    color: "#64748B",
    marginBottom: 3,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  profileText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  monthSelector: {
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginBottom: 16,
  },

  month: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0D1B2A",
  },

  arrow: {
    fontSize: 25,
    color: "#2563EB",
  },

  totalCard: {
    backgroundColor: "#1E3A8A",
    borderRadius: 22,
    padding: 22,
    marginBottom: 14,
  },

  totalLabel: {
    color: "#BFDBFE",
    fontSize: 14,
    marginBottom: 6,
  },

  totalAmount: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 18,
  },

  totalFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalDescription: {
    color: "#DBEAFE",
    fontSize: 13,
  },

  percentageBadge: {
    backgroundColor: "#10B981",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  percentageText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 26,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
  },

  summaryIconGreen: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  summaryIconBlue: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  summaryLabel: {
    color: "#64748B",
    fontSize: 13,
    marginBottom: 4,
  },

  summaryAmount: {
    color: "#0D1B2A",
    fontSize: 18,
    fontWeight: "700",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  seeMore: {
    color: "#2563EB",
    fontSize: 13,
    fontWeight: "600",
  },

  categoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
  },

  category: {
    marginBottom: 18,
  },

  categoryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
  },

  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  emoji: {
    fontSize: 20,
  },

  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0D1B2A",
    marginBottom: 2,
  },

  categoryPercentage: {
    fontSize: 12,
    color: "#94A3B8",
  },

  categoryAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  progressBackground: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    overflow: "hidden",
  },

  progress: {
    height: 6,
    borderRadius: 10,
  },
});
