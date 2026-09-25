import { Pressable, StyleSheet, Text, View } from "react-native";
import { Task, TaskStatus } from "../types/task";
import { STATUS_LABELS } from "../storage/taskStore";
import { formatDateTime } from "../utils/format";

interface Props {
  task: Task;
  onPress: () => void;
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  new: "#155fd6",
  in_progress: "#bdc4cc",
  completed: "#00d659",
  canceled: "#b40909",
};

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
        <View
          style={[
            styles.badge,
            { backgroundColor: STATUS_COLORS[task.status] },
          ]}
        >
          <Text style={styles.badgeText}>{STATUS_LABELS[task.status]}</Text>
        </View>
      </View>
      <Text style={styles.meta}>Due: {formatDateTime(task.dueDate)}</Text>
      <Text style={styles.meta} numberOfLines={1}>
        {task.location.adress}
      </Text>
      {task.syncStatus !== "synced" && (
        <Text style={styles.sync}>
          {task.syncStatus === "pending" ? "Pending sync" : "Sync faild"}
        </Text>
      )}
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
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  meta: { fontSize: 14, color: "#555", marginTop: 6 },
  sync: { fontSize: 12, color: "#B45309", marginTop: 6 },
});
