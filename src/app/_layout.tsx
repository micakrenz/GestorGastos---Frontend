import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { useEffect } from "react";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { AuthProvider } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { user, isReady } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const onAuthScreen = segments[0] === "auth";

  useEffect(() => {
    if (!isReady) return;
    if (!user && !onAuthScreen) router.replace("/auth");
    else if (user && onAuthScreen) router.replace("/(tabs)");
  }, [isReady, user, onAuthScreen, router]);

  return (
    <>
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="detalle" options={{ headerShown: false }} />
        <Stack.Screen name="editar" options={{ headerShown: false }} />
        <Stack.Screen name="mapa" options={{ headerShown: false }} />
        <Stack.Screen name="presupuesto" options={{ headerShown: false }} />
        <Stack.Screen name="objetivos" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
