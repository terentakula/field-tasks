import { View, Text, StyleSheet } from 'react-native';
import { TaskStatus } from '../types/task';
import { STATUS_LABELS } from '../storage/taskStore';

const STATUS_COLORS: Record<TaskStatus, string> = {
  new: '#155fd6',
  in_progress: '#bdc4cc',
  completed: '#00d659',
  canceled: '#b40909',
};

export default function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <View style={[styles.badge, { backgroundColor: STATUS_COLORS[status] }]}>
      <Text style={styles.text}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  text: { color: '#fff', fontSize: 12, fontWeight: '600' },
});