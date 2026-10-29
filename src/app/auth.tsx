import { useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

export default function AuthScreen() {
  const { isLoading, login, register } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    if (isRegistering && !name.trim()) {
      Alert.alert("Nombre inválido", "Ingresá tu nombre.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
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
    } catch (error) {
      Alert.alert(isRegistering ? "No se pudo crear la cuenta" : "No se pudo iniciar sesión", error instanceof Error ? error.message : "Intentá nuevamente.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Image source={require("../../assets/images/logo-finan.png")} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.title}>{isRegistering ? "Creá tu cuenta" : "Iniciá sesión"}</Text>
          <Text style={styles.subtitle}>{isRegistering ? "Tus gastos y objetivos quedarán guardados en tu cuenta." : "Ingresá para ver tus gastos, presupuestos y objetivos."}</Text>

          <View style={styles.form}>
            {isRegistering && <Field label="Nombre" value={name} onChangeText={setName} placeholder="Tu nombre" autoCapitalize="words" />}
            <Field label="Email" value={email} onChangeText={setEmail} placeholder="tu@email.com" keyboardType="email-address" autoCapitalize="none" />
            <View style={styles.field}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordInputRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={isRegistering ? "Al menos 8 caracteres" : "Tu contraseña"}
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  onPress={() => setShowPassword((visible) => !visible)}
                  style={styles.passwordToggle}
                >
                  <Text style={styles.passwordToggleText}>{showPassword ? "Ocultar" : "Ver"}</Text>
                </Pressable>
              </View>
            </View>
            <Pressable style={[styles.submit, isLoading && styles.disabled]} onPress={submit} disabled={isLoading}>
              <Text style={styles.submitText}>{isLoading ? "Conectando..." : isRegistering ? "Crear cuenta" : "Iniciar sesión"}</Text>
            </Pressable>
          </View>

          <Pressable onPress={() => setIsRegistering((value) => !value)} style={styles.switch}>
            <Text style={styles.switchText}>{isRegistering ? "¿Ya tenés cuenta? Iniciá sesión" : "¿No tenés cuenta? Registrate"}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, ...props }: { label: string } & React.ComponentProps<typeof TextInput>) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput style={styles.input} placeholderTextColor="#94A3B8" autoCorrect={false} {...props} /></View>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingVertical: 36 },
  brand: { alignItems: "center", marginBottom: 34 },
  logoImage: { width: 250, height: 105 },
  title: { color: "#0F172A", fontSize: 28, fontWeight: "700", textAlign: "center" },
  subtitle: { marginTop: 10, color: "#64748B", fontSize: 15, lineHeight: 22, textAlign: "center" },
  form: { marginTop: 30, gap: 18 },
  field: { gap: 8 },
  label: { color: "#334155", fontSize: 14, fontWeight: "600" },
  input: { height: 52, borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 12, backgroundColor: "white", paddingHorizontal: 14, color: "#0F172A", fontSize: 16 },
  passwordInputRow: { height: 52, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#CBD5E1", borderRadius: 12, backgroundColor: "white" },
  passwordInput: { flex: 1, height: "100%", borderWidth: 0, backgroundColor: "transparent" },
  passwordToggle: { paddingHorizontal: 14, height: "100%", justifyContent: "center" },
  passwordToggleText: { color: "#2563EB", fontSize: 14, fontWeight: "600" },
  submit: { height: 54, marginTop: 6, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#2563EB" },
  disabled: { opacity: 0.65 },
  submitText: { color: "white", fontSize: 16, fontWeight: "700" },
  switch: { alignItems: "center", paddingVertical: 22 },
  switchText: { color: "#2563EB", fontSize: 15, fontWeight: "600" },
});
