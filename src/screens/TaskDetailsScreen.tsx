import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { RootStackParamList } from "../navigation/types";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { TaskStatus } from "../types/task";
import { STATUS_LABELS, useTaskStore } from "../storage/taskStore";
import StatusBadge from "../components/StatusBadge";
import { formatDateTime } from "../utils/format";
import AttachmentThumb from "../components/AttachmentThumb";
import { cancelReminder } from "../services/notificationService";

type Nav = NativeStackNavigationProp<RootStackParamList>;
type DetaliRoute = RouteProp<RootStackParamList, "TaskDetails">;

const STATUS_ACTIONS: TaskStatus[] = ["in_progress", "completed", "canceled"];

export default function TaskDetailsScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<DetaliRoute>();
  const task = useTaskStore((s) =>
    s.tasks.find((t) => t.id === params.taskId && !t.deleted),
  );
  const history = useTaskStore((s) => s.history);
  const changeStatus = useTaskStore((s) => s.changeStatus);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const setNotificationId = useTaskStore((s) => s.setNotificationId);

  if (!task) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>This task no longer exists.</Text>
      </View>
    );
  }

  const taskHistory = history.filter((h) => h.taskId === task.id);

  const confirmDelete = () => {
    Alert.alert("Delete task?", `"${task.title}" will be removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          cancelReminder(task.notificationId);
          deleteTask(task.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        <StatusBadge status={task.status} />
      </View>

      <Text style={styles.label}>Description</Text>
      <Text style={styles.body}>{task.description}</Text>

      <Text style={styles.label}>Due</Text>
      <Text style={styles.body}>{formatDateTime(task.dueDate)}</Text>

      <Text style={styles.label}>Location</Text>
      <Text style={styles.body}>{task.location.address}</Text>
      {task.location.latitude !== undefined && (
        <Text style={styles.muted}>
          {task.location.latitude}, {task.location.longitude}
        </Text>
      )}

      <Text style={styles.label}>Attachments</Text>
      {task.attachedFiles.length === 0 ? (
        <Text style={styles.muted}>No attachments</Text>
      ) : (
        <View style={styles.row}>
          {task.attachedFiles.map((f) => (
            <AttachmentThumb key={f.id} file={f} />
          ))}
        </View>
      )}

      <Text style={styles.label}>Change status</Text>
      <View style={styles.row}>
        {STATUS_ACTIONS.filter((s) => s !== task.status).map((s) => (
          <Pressable
            key={s}
            style={styles.secondaryButton}
            onPress={() => {
              changeStatus(task.id, s);
              if (s === "completed" || s === "canceled") {
                cancelReminder(task.notificationId);
                setNotificationId(task.id, undefined);
              }
            }}
            accessibilityRole="button"
          >
            <Text style={styles.secondaryText}>{STATUS_LABELS[s]}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.row}>
        <Pressable
          style={[styles.primaryButton, styles.flex]}
          onPress={() => navigation.navigate("TaskForm", { taskId: task.id })}
          accessibilityRole="button"
        >
          <Text style={styles.primaryText}>Edit</Text>
        </Pressable>
        <Pressable
          style={[styles.dangerButton, styles.flex]}
          onPress={confirmDelete}
          accessibilityRole="button"
        >
          <Text style={styles.primaryText}>Delete</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>History</Text>
      {taskHistory.map((entry) => (
        <View key={entry.id} style={styles.historyItem}>
          <Text style={styles.muted}>{formatDateTime(entry.timestamp)}</Text>
          <Text style={styles.body}>{entry.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 4, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  title: { flex: 1, fontSize: 22, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "600", color: "#6B7280", marginTop: 16 },
  body: { fontSize: 16, color: "#111" },
  muted: { fontSize: 14, color: "#6B7280" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  flex: { flex: 1 },
  secondaryButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#2563EB",
  },
  secondaryText: { color: "#2563EB", fontWeight: "600" },
  primaryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  dangerButton: {
    backgroundColor: "#DC2626",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  historyItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
});
