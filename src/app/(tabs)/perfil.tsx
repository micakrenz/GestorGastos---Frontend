import { useState } from "react";
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
import { useAuth } from "../../context/AuthContext";

export default function PerfilScreen() {
  const { user, isReady, isLoading, login, register, updateProfile, logout } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");

  const handleSubmit = async () => {
    if (isRegistering && !name.trim()) {
      Alert.alert("Nombre inválido", "Ingresá tu nombre.");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Email inválido", "Ingresá tu email.");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Email inválido", "Ingresá un email válido.");
      return;
    }

    if (password.length < (isRegistering ? 8 : 1)) {
      Alert.alert("Contraseña inválida", isRegistering ? "Usá al menos 8 caracteres." : "Ingresá tu contraseña.");
      return;
    }

    try {
      if (isRegistering) await register(name.trim(), email.trim(), password);
      else await login(email.trim(), password);
      setName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      Alert.alert(isRegistering ? "No se pudo crear la cuenta" : "No se pudo iniciar sesión", error instanceof Error ? error.message : "Intentá nuevamente.");
    }
  };

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que querés cerrar sesión?", [
      {
        text: "Cancelar",
        style: "cancel",
      },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: () => { void logout(); },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!profileName.trim()) {
      Alert.alert("Nombre inválido", "Ingresá tu nombre.");
      return;
    }
    try {
      await updateProfile(profileName.trim());
      setIsEditingProfile(false);
    } catch (error) {
      Alert.alert("No se pudo actualizar el perfil", error instanceof Error ? error.message : "Intentá nuevamente.");
    }
  };

  if (!isReady) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Perfil</Text>
        </View>

        {user ? (
          <>
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user.name}</Text>

                <Text style={styles.profileEmail}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cuenta</Text>

              <Pressable
                style={styles.optionCard}
                onPress={() => {
                  setProfileName(user.name);
                  setIsEditingProfile(true);
                }}
              >
                <View>
                  <Text style={styles.optionTitle}>Datos de la cuenta</Text>

                  <Text style={styles.optionDescription}>
                    {user.name} · Tocar para editar tu nombre
                  </Text>
                </View>
              </Pressable>

            </View>

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </Pressable>
          </>
        ) : (
          <>
            <View style={styles.loginCard}>
              <View style={styles.loginIcon}>
                <Text style={styles.loginIconText}>👤</Text>
              </View>

              <Text style={styles.loginTitle}>{isRegistering ? "Crear cuenta" : "Iniciá sesión"}</Text>

              <Text style={styles.loginDescription}>
                {isRegistering ? "Registrate para guardar tus datos y acceder desde tu cuenta." : "Ingresá a tu cuenta para administrar tu perfil."}
              </Text>

              {isRegistering && <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Nombre</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Tu nombre" placeholderTextColor="#9CA3AF" autoCapitalize="words" />
              </View>}

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>

                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Ingresá tu email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Contraseña</Text>

                <View style={styles.passwordInputRow}>
                  <TextInput style={[styles.input, styles.passwordInput]} value={password} onChangeText={setPassword} placeholder="Ingresá tu contraseña" placeholderTextColor="#9CA3AF" secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false} />
                  <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? "Ocultar contraseña" : "Ver contraseña"} onPress={() => setShowPassword((visible) => !visible)} style={styles.passwordToggle}>
                    <Text style={styles.passwordToggleText}>{showPassword ? "Ocultar" : "Ver"}</Text>
                  </Pressable>
                </View>
              </View>

              <Pressable style={styles.loginButton} onPress={handleSubmit} disabled={isLoading}>
                <Text style={styles.loginButtonText}>{isLoading ? "Conectando..." : isRegistering ? "Crear cuenta" : "Iniciar sesión"}</Text>
              </Pressable>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>
                {isRegistering ? "¿Ya tenés una cuenta?" : "¿Todavía no tenés una cuenta?"}
              </Text>

              <Text style={styles.infoDescription}>
                {isRegistering ? "Iniciá sesión con tu email y contraseña." : "Creá una cuenta para sincronizar tus gastos."}
              </Text>
              <Pressable onPress={() => setIsRegistering((value) => !value)} style={{ marginTop: 12 }}>
                <Text style={{ color: "#2563EB", fontWeight: "600", textAlign: "center" }}>{isRegistering ? "Iniciar sesión" : "Crear cuenta"}</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
      <Modal visible={isEditingProfile} transparent animationType="fade" onRequestClose={() => setIsEditingProfile(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.editModal}>
            <Text style={styles.optionTitle}>Editar nombre</Text>
            <TextInput
              style={[styles.input, styles.profileNameInput]}
              value={profileName}
              onChangeText={setProfileName}
              placeholder="Tu nombre"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
              autoFocus
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={() => setIsEditingProfile(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.loginButton, styles.saveProfileButton, isLoading && styles.disabledButton]}
                onPress={handleSaveProfile}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>{isLoading ? "Guardando..." : "Guardar"}</Text>
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

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  subtitle: {
    marginTop: 4,
    fontSize: 15,
    color: "#6B7280",
  },

  loginCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  loginIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 16,
  },

  loginIconText: {
    fontSize: 28,
  },

  loginTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0D1B2A",
    textAlign: "center",
  },

  loginDescription: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },

  inputContainer: {
    marginBottom: 16,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 7,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingHorizontal: 15,
    backgroundColor: "#F9FAFB",
    color: "#111827",
    fontSize: 15,
  },
  passwordInputRow: { height: 50, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 14, backgroundColor: "#F9FAFB" },
  passwordInput: { flex: 1, height: "100%", borderWidth: 0, backgroundColor: "transparent" },
  passwordToggle: { height: "100%", justifyContent: "center", paddingHorizontal: 14 },
  passwordToggleText: { color: "#2563EB", fontSize: 14, fontWeight: "600" },

  loginButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },

  saveProfileButton: {
    flex: 1,
    marginTop: 0,
  },

  disabledButton: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  infoCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E3A8A",
  },

  infoDescription: {
    fontSize: 13,
    color: "#4B5563",
    marginTop: 6,
    lineHeight: 19,
  },

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 2,
  },

  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  avatarText: {
    fontSize: 25,
    fontWeight: "700",
    color: "#2563EB",
  },

  profileInfo: {
    flex: 1,
  },

  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0D1B2A",
  },

  profileEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  section: {
    marginTop: 28,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0D1B2A",
    marginBottom: 12,
  },

  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 17,
    marginBottom: 12,
  },

  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  optionDescription: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  logoutButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  logoutText: {
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
    fontSize: 15,
    color: "#6B7280",
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },

  editModal: {
    padding: 22,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },

  profileNameInput: {
    marginTop: 18,
  },

  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
  },

  cancelButton: {
    flex: 1,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
  },

  cancelText: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "600",
  },
});
