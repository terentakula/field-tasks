import { View, Text, Switch, StyleSheet } from "react-native";
import { CANDIDATE_CODE } from "../constants";
import { useSettingsStore } from "../storage/settingsStore";

export default function SettingsScreen() {
  const demo = useSettingsStore((s) => s.demoNotifications);
  const toggleDemo = useSettingsStore((s) => s.toggleDemoNotifications);

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
});
