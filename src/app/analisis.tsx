import { StyleSheet, Text, View } from "react-native";

export default function AnalisisScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Análisis</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FB",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0D1B2A",
  },
});
