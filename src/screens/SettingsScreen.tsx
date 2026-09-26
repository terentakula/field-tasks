import {
  View,
  Text,
  Switch,
  StyleSheet,
  Alert,
  TextInput,
  Pressable,
} from "react-native";
import { CANDIDATE_CODE } from "../constants";
import { useSettingsStore } from "../storage/settingsStore";
import { syncNow } from "../services/syncService";

export default function SettingsScreen() {
  const demo = useSettingsStore((s) => s.demoNotifications);
  const toggleDemo = useSettingsStore((s) => s.toggleDemoNotifications);

  const serverUrl = useSettingsStore((s) => s.serverUrl);
  const setServerUrl = useSettingsStore((s) => s.setServerUrl);

  const handleSync = async () => {
    const ok = await syncNow();
    Alert.alert(
      ok ? "Sync complete" : "Sync failed",
      ok
        ? "All changes are on the server."
        : "Check the server address and your connection.",
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.flex}>
          <Text style={styles.title}>Demo notifications</Text>
          <Text style={styles.hint}>
            Reminder fires 45 seconds after saving a task (for testing)
          </Text>
        </View>
        <Switch
          value={demo}
          onValueChange={toggleDemo}
          accessibilityLabel="Demo notifications"
        />
      </View>

      <Text style={styles.label}>Mock server URL</Text>
      <TextInput
        style={styles.input}
        value={serverUrl}
        onChangeText={setServerUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />
      <Pressable
        style={styles.button}
        onPress={handleSync}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Sync now</Text>
      </Pressable>

      <Text style={styles.label}>Candidate code</Text>
      <Text style={styles.code}>{CANDIDATE_CODE}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  flex: { flex: 1 },
  title: { fontSize: 16, fontWeight: "600" },
  hint: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  label: { fontSize: 14, color: "#6B7280", marginTop: 24 },
  code: { fontSize: 18, fontWeight: "600", marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginTop: 6,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 12,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
