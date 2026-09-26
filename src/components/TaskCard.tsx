import { Pressable, StyleSheet, Text, View } from "react-native";
import { Task } from "../types/task";
import { formatDateTime } from "../utils/format";
import StatusBadge from "./StatusBadge";

interface Props {
  task: Task;
  onPress: () => void;
}

export default function TaskCard({ task, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open task ${task.title}`}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        <StatusBadge status={task.status} />
      </View>
      <Text style={styles.meta}>Due: {formatDateTime(task.dueDate)}</Text>
      <Text style={styles.meta} numberOfLines={1}>
        {task.location.address}
      </Text>
      <Text style={[styles.sync, task.syncStatus === 'synced' && styles.synced]}>
        {task.syncStatus === 'synced' ? 'Synced' : task.syncStatus === 'pending' ? 'Pending sync' : 'Sync failed'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  pressed: { opacity: 0.7 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: { flex: 1, fontSize: 17, fontWeight: "600" },
  meta: { fontSize: 14, color: "#555", marginTop: 6 },
  sync: { fontSize: 12, color: "#B45309", marginTop: 6 },
   synced: { color: '#059669' },
});
