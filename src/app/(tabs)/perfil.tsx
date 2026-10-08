import AsyncStorage from "@react-native-async-storage/async-storage";
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

type User = {
  name: string;
  email: string;
};

const USER_STORAGE_KEY = "gestor-gastos-usuario";

export default function PerfilScreen() {
  const [user, setUser] = useState<User | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isHydrated, setIsHydrated] = useState(false);

  // Cargar la sesión guardada
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);

        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
      } finally {
        setIsHydrated(true);
      }
    };

    loadUser();
  }, []);

  // Guardar la sesión cuando cambia el usuario
  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const saveUser = async () => {
      try {
        if (user) {
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        } else {
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
        }
      } catch (error) {}
    };

    saveUser();
  }, [user, isHydrated]);

  const handleLogin = () => {
    if (!email.trim()) {
      Alert.alert("Email inválido", "Ingresá tu email.");
      return;
    }

    if (!email.includes("@")) {
      Alert.alert("Email inválido", "Ingresá un email válido.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Contraseña inválida", "Ingresá tu contraseña.");
      return;
    }

    const loggedUser: User = {
      name: email.split("@")[0],
      email: email.trim(),
    };

    setUser(loggedUser);

    setEmail("");
    setPassword("");
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
        onPress: () => {
          setUser(null);
        },
      },
    ]);
  };

  if (!isHydrated) {
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

              <View style={styles.optionCard}>
                <View>
                  <Text style={styles.optionTitle}>Datos de la cuenta</Text>

                  <Text style={styles.optionDescription}>
                    Información asociada a tu usuario
                  </Text>
                </View>
              </View>

              <View style={styles.optionCard}>
                <View>
                  <Text style={styles.optionTitle}>Preferencias</Text>

                  <Text style={styles.optionDescription}>
                    Configurá tus preferencias de la aplicación
                  </Text>
                </View>
              </View>
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

              <Text style={styles.loginTitle}>Iniciá sesión</Text>

              <Text style={styles.loginDescription}>
                Ingresá a tu cuenta para administrar tu perfil.
              </Text>

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

                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Ingresá tu contraseña"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <Pressable style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Iniciar sesión</Text>
              </Pressable>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>
                ¿Todavía no tenés una cuenta?
              </Text>

              <Text style={styles.infoDescription}>
                En esta versión podés ingresar directamente con tu email. La
                autenticación real se conectará al backend más adelante.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
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

  loginButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
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
});
