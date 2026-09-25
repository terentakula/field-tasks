import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RootStackParamList } from "../navigation/types";
import { SortKey, sortTasks } from "../utils/sortTasks";
import { useNavigation } from "@react-navigation/native";
import { useTaskStore } from "../storage/taskStore";
import { useMemo, useState } from "react";
import TaskCard from "../components/TaskCard";
import { Ionicons } from "@expo/vector-icons";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "createdAt", label: "Date added" },
  { key: "dueDate", label: "Due date" },
  { key: "status", label: "Status" },
];

export default function TaskListScreen() {
  const navigation = useNavigation<Nav>();
  const tasks = useTaskStore((s) => s.tasks);
  const hasHydrated = useTaskStore((s) => s.hasHydrated);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");

  const visibleTasks = useMemo(
    () =>
      sortTasks(
        tasks.filter((t) => !t.deleted),
        sortKey,
      ),
    [tasks, sortKey],
  );

  if (!hasHydrated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((o) => {
          const active = sortKey === o.key;
          return (
            <Pressable
              key={o.key}
              onPress={() => setSortKey(o.key)}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={visibleTasks}
        keyExtractor={(t) => t.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() =>
              navigation.navigate("TaskDetails", { taskId: item.id })
            }
          />
        )}
        contentContainerStyle={
          visibleTasks.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="clipboard-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptyText}>
              Tap + to create your first task
            </Text>
          </View>
        }
      />

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate("TaskForm", {})}
        accessibilityRole="button"
        accessibilityLabel="Create task"
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  sortRow: { flexDirection: "row", gap: 8, padding: 16, paddingBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
  },
  chipActive: { backgroundColor: "#2563EB" },
  chipText: { fontSize: 14, color: "#111" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  list: { padding: 16, paddingBottom: 96 },
  emptyContainer: { flexGrow: 1 },
  emptyTitle: { fontSize: 18, fontWeight: "600", marginTop: 12 },
  emptyText: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
});
