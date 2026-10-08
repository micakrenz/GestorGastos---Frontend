import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Goal = {
  id: number;
  title: string;
  current: number;
  target: number;
};

const initialGoals: Goal[] = [
  {
    id: 1,
    title: "Viaje a Brasil",
    current: 350000,
    target: 500000,
  },
  {
    id: 2,
    title: "Nueva notebook",
    current: 420000,
    target: 800000,
  },
];

const GOALS_STORAGE_KEY = "gestor-gastos-objetivos";

export default function ObjetivosScreen() {
  const router = useRouter();

  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [isHydrated, setIsHydrated] = useState(false);

  // Sumar / restar ahorro
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [amount, setAmount] = useState("");

  // Editar objetivo
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTarget, setEditTarget] = useState("");

  // Crear objetivo
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newCurrent, setNewCurrent] = useState("");

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const storedGoals = await AsyncStorage.getItem(GOALS_STORAGE_KEY);

        if (storedGoals) {
          setGoals(JSON.parse(storedGoals));
        }
      } catch (error) {
        setGoals([]);
      } finally {
        setIsHydrated(true);
      }
    };

    loadGoals();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const saveGoals = async () => {
      try {
        await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
      } catch (error) {}
    };

    saveGoals();
  }, [goals, isHydrated]);

  // --------------------------------------------------
  // SUMAR / RESTAR AHORRO
  // --------------------------------------------------

  const openAmountModal = (goal: Goal, operationType: "add" | "subtract") => {
    setSelectedGoal(goal);
    setOperation(operationType);
    setAmount("");
  };

  const handleAmountChange = () => {
    if (!selectedGoal) {
      return;
    }

    const numericAmount = Number(amount);

    if (!amount.trim() || !numericAmount || numericAmount <= 0) {
      Alert.alert("Monto inválido", "Ingresá un monto mayor a $0.");
      return;
    }

    setGoals((currentGoals) =>
      currentGoals.map((goal) => {
        if (goal.id !== selectedGoal.id) {
          return goal;
        }

        let newCurrent = goal.current;

        if (operation === "subtract") {
          if (numericAmount > goal.current) {
            Alert.alert(
              "Monto inválido",
              `No podés restar $${numericAmount.toLocaleString(
                "es-AR",
              )} porque actualmente tenés $${goal.current.toLocaleString(
                "es-AR",
              )} ahorrados.`,
            );

            return goal;
          }

          newCurrent = goal.current - numericAmount;
        }

        if (operation === "add") {
          const remaining = goal.target - goal.current;

          if (numericAmount > remaining) {
            Alert.alert(
              "Monto inválido",
              `Solo podés agregar hasta $${remaining.toLocaleString(
                "es-AR",
              )} para alcanzar tu objetivo.`,
            );

            return goal;
          }

          newCurrent = goal.current + numericAmount;
        }

        return {
          ...goal,
          current: newCurrent,
        };
      }),
    );

    setSelectedGoal(null);
    setAmount("");
  };

  // --------------------------------------------------
  // EDITAR OBJETIVO
  // --------------------------------------------------

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setEditTitle(goal.title);
    setEditTarget(goal.target.toString());
  };

  const handleEditGoal = () => {
    const numericTarget = Number(editTarget);

    if (!editTitle.trim()) {
      Alert.alert("Nombre inválido", "Ingresá un nombre para el objetivo.");
      return;
    }

    if (!numericTarget || numericTarget <= 0) {
      Alert.alert("Importe inválido", "Ingresá un importe total mayor a $0.");
      return;
    }

    setGoals((currentGoals) =>
      currentGoals.map((goal) => {
        if (goal.id !== editingGoal?.id) {
          return goal;
        }

        return {
          ...goal,
          title: editTitle.trim(),
          target: numericTarget,
          current: Math.min(goal.current, numericTarget),
        };
      }),
    );

    setEditingGoal(null);
    setEditTitle("");
    setEditTarget("");
  };

  // --------------------------------------------------
  // CREAR OBJETIVO
  // --------------------------------------------------

  const handleCreateGoal = () => {
    const numericTarget = Number(newTarget);
    const numericCurrent = Number(newCurrent);

    if (!newTitle.trim()) {
      Alert.alert("Nombre inválido", "Ingresá un nombre para el objetivo.");
      return;
    }

    if (!numericTarget || numericTarget <= 0) {
      Alert.alert("Importe inválido", "Ingresá un importe total mayor a $0.");
      return;
    }

    if (numericCurrent < 0) {
      Alert.alert("Monto inválido", "El ahorro inicial no puede ser negativo.");
      return;
    }

    if (numericCurrent > numericTarget) {
      Alert.alert(
        "Monto inválido",
        "El ahorro inicial no puede superar el importe total del objetivo.",
      );
      return;
    }

    const newGoal: Goal = {
      id: Date.now(),
      title: newTitle.trim(),
      current: numericCurrent,
      target: numericTarget,
    };

    setGoals((currentGoals) => [...currentGoals, newGoal]);

    setIsCreating(false);
    setNewTitle("");
    setNewTarget("");
    setNewCurrent("");
  };

  // --------------------------------------------------
  // ELIMINAR OBJETIVO
  // --------------------------------------------------

  const handleDeleteGoal = (goal: Goal) => {
    Alert.alert(
      "Eliminar objetivo",
      `¿Estás seguro de que querés eliminar "${goal.title}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            setGoals((currentGoals) =>
              currentGoals.filter((currentGoal) => currentGoal.id !== goal.id),
            );
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>

          <View>
            <Text style={styles.title}>Objetivos</Text>
            <Text style={styles.subtitle}>Alcanzá tus metas de ahorro</Text>
          </View>
        </View>

        {/* OBJETIVOS */}
        {goals.map((goal) => {
          const progress = Math.min(
            Math.round((goal.current / goal.target) * 100),
            100,
          );

          const remaining = Math.max(goal.target - goal.current, 0);

          return (
            <View key={goal.id} style={styles.goalCard}>
              {/* TÍTULO + PORCENTAJE */}
              <View style={styles.goalHeader}>
                <Text style={styles.goalTitle}>{goal.title}</Text>

                <Text style={styles.goalPercentage}>{progress}%</Text>
              </View>

              {/* BARRA DE PROGRESO */}
              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${progress}%`,
                    },
                  ]}
                />
              </View>

              {/* IMPORTES */}
              <View style={styles.amountRow}>
                <View>
                  <Text style={styles.amountLabel}>Ahorrado</Text>

                  <Text style={styles.amountValue}>
                    ${goal.current.toLocaleString("es-AR")}
                  </Text>
                </View>

                <View style={styles.amountRight}>
                  <Text style={styles.amountLabel}>Objetivo</Text>

                  <Text style={styles.amountValue}>
                    ${goal.target.toLocaleString("es-AR")}
                  </Text>
                </View>
              </View>

              {/* RESTANTE */}
              <View style={styles.remainingContainer}>
                {remaining === 0 ? (
                  <Text style={styles.completedText}>¡Objetivo alcanzado!</Text>
                ) : (
                  <>
                    <Text style={styles.remainingLabel}>Falta</Text>

                    <Text style={styles.remainingValue}>
                      ${remaining.toLocaleString("es-AR")}
                    </Text>
                  </>
                )}
              </View>

              {/* ACCIONES */}
              <View style={styles.actionsRow}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => openAmountModal(goal, "subtract")}
                >
                  <Text style={styles.actionText}>−</Text>
                </Pressable>

                <Pressable
                  style={styles.actionButton}
                  onPress={() => openAmountModal(goal, "add")}
                >
                  <Text style={styles.actionText}>+</Text>
                </Pressable>

                <Pressable
                  style={styles.editButton}
                  onPress={() => openEditModal(goal)}
                >
                  <Text style={styles.editText}>Editar</Text>
                </Pressable>

                <Pressable
                  style={styles.deleteButton}
                  onPress={() => handleDeleteGoal(goal)}
                >
                  <Text style={styles.deleteText}>×</Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        {/* CREAR NUEVO OBJETIVO */}
        <Pressable
          style={styles.createButton}
          onPress={() => {
            setNewTitle("");
            setNewTarget("");
            setNewCurrent("");
            setIsCreating(true);
          }}
        >
          <Text style={styles.createButtonText}>+ Crear nuevo objetivo</Text>
        </Pressable>
      </ScrollView>

      {/* --------------------------------------------------
          MODAL SUMAR / RESTAR
      -------------------------------------------------- */}

      <Modal
        visible={selectedGoal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setSelectedGoal(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {operation === "add" ? "Agregar ahorro" : "Restar ahorro"}
            </Text>

            <Text style={styles.modalDescription}>{selectedGoal?.title}</Text>

            <Text style={styles.inputLabel}>Monto</Text>

            <TextInput
              style={styles.input}
              placeholder="Ej: 50000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setSelectedGoal(null);
                  setAmount("");
                }}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={styles.confirmButton}
                onPress={handleAmountChange}
              >
                <Text style={styles.confirmText}>Confirmar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* --------------------------------------------------
          MODAL EDITAR
      -------------------------------------------------- */}

      <Modal
        visible={editingGoal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setEditingGoal(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Editar objetivo</Text>

            <Text style={styles.inputLabel}>Nombre</Text>

            <TextInput
              style={styles.input}
              placeholder="Ej: Viaje a Europa"
              placeholderTextColor="#94A3B8"
              value={editTitle}
              onChangeText={setEditTitle}
            />

            <Text style={styles.inputLabel}>Importe total</Text>

            <TextInput
              style={styles.input}
              placeholder="Ej: 1000000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={editTarget}
              onChangeText={setEditTarget}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setEditingGoal(null);
                  setEditTitle("");
                  setEditTarget("");
                }}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>

              <Pressable style={styles.confirmButton} onPress={handleEditGoal}>
                <Text style={styles.confirmText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* --------------------------------------------------
          MODAL CREAR
      -------------------------------------------------- */}

      <Modal
        visible={isCreating}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCreating(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Crear nuevo objetivo</Text>

            <Text style={styles.inputLabel}>Nombre</Text>

            <TextInput
              style={styles.input}
              placeholder="Ej: Viaje a Europa"
              placeholderTextColor="#94A3B8"
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={styles.inputLabel}>Importe total</Text>

            <TextInput
              style={styles.input}
              placeholder="Ej: 1000000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={newTarget}
              onChangeText={setNewTarget}
            />

            <Text style={styles.inputLabel}>Ahorro inicial</Text>

            <TextInput
              style={styles.input}
              placeholder="Ej: 250000"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={newCurrent}
              onChangeText={setNewCurrent}
            />

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setIsCreating(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={styles.confirmButton}
                onPress={handleCreateGoal}
              >
                <Text style={styles.confirmText}>Crear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
  },

  backArrow: {
    fontSize: 34,
    color: "#0D1B2A",
    lineHeight: 36,
    marginTop: -2,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 3,
  },

  // GOAL CARD
  goalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  goalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: "#0D1B2A",
    marginRight: 10,
  },

  goalPercentage: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563EB",
  },

  // PROGRESS
  progressBackground: {
    height: 10,
    borderRadius: 10,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
    marginBottom: 18,
  },

  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#2563EB",
  },

  // AMOUNTS
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  amountRight: {
    alignItems: "flex-end",
  },

  amountLabel: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 4,
  },

  amountValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  // REMAINING
  remainingContainer: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  remainingLabel: {
    fontSize: 12,
    color: "#64748B",
  },

  remainingValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563EB",
    marginTop: 2,
  },

  completedText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
  },

  // ACTIONS
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    gap: 8,
  },

  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  actionText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2563EB",
    lineHeight: 26,
  },

  editButton: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },

  editText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },

  deleteButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    alignItems: "center",
    justifyContent: "center",
  },

  deleteText: {
    fontSize: 27,
    fontWeight: "400",
    color: "#EF4444",
    lineHeight: 29,
  },

  // CREATE
  createButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  createButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // MODALS
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    padding: 20,
  },

  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
  },

  modalTitle: {
    fontSize: 21,
    fontWeight: "700",
    color: "#0D1B2A",
    marginBottom: 6,
  },

  modalDescription: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 7,
    marginTop: 10,
  },

  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#0D1B2A",
  },

  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
  },

  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },

  confirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  confirmText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
