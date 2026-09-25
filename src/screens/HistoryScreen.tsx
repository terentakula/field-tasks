import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { HistoryAction } from "../types/task";
import { Ionicons } from "@expo/vector-icons";
import { useTaskStore } from "../storage/taskStore";
import { formatDateTime } from "../utils/format";

const ACTION_META: Record<HistoryAction, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  created: { label: 'Created', icon: 'add-circle-outline' },
  edited: { label: 'Edited', icon: 'create-outline' },
  status_changed: { label: 'Status changed', icon: 'swap-horizontal-outline' },
  attachment_added: { label: 'Attachment added', icon: 'attach-outline' },
  attachment_removed: { label: 'Attachment removed', icon: 'close-circle-outline' },
  deleted: { label: 'Deleted', icon: 'trash-outline' },
  sync_success: { label: 'Synced', icon: 'cloud-done-outline' },
  sync_failed: { label: 'Sync failed', icon: 'cloud-offline-outline' },
};

export default function HistoryScreen() {
    const history = useTaskStore((s)=> s.history)
    const hasHydrated = useTaskStore((s)=> s.hasHydrated)

    if(!hasHydrated){
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large"/>
            </View>
        )
    }


    return(
        <FlatList
            data={history}
            keyExtractor={(entry)=> entry.id}
            contentContainerStyle={history.length === 0 ? styles.emptyContainer : styles.list}
            renderItem={({item})=> {
                const meta = ACTION_META[item.action]
                return (
                    <View style={styles.item}>
                        <Ionicons name={meta.icon} size={22} color="#2563eb"/>
                        <View style={styles.flex}>
                            <Text style={styles.action}>{meta.label}</Text>
                            <Text style={styles.description}>{item.description}</Text>
                            <Text style={styles.time}>{formatDateTime(item.timestamp)}</Text>
                        </View>
                    </View>
                )
            }}
            ListEmptyComponent={
                <View style={styles.center}>
                  <Ionicons name="time-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>No activity yet</Text>
                  <Text style={styles.time}>Actions with tasks will appear here</Text>
                </View>
            }
        />
    )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  list: { padding: 16 },
  emptyContainer: { flexGrow: 1 },
  item: {
    flexDirection: 'row', gap: 12, padding: 12, marginBottom: 8,
    backgroundColor: '#fff', borderRadius: 10,
  },
  flex: { flex: 1 },
  action: { fontSize: 12, fontWeight: '700', color: '#2563EB', textTransform: 'uppercase' },
  description: { fontSize: 15, color: '#111', marginTop: 2 },
  time: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 12 },
});