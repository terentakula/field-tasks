import { Controller, useForm } from "react-hook-form";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  Alert,
} from "react-native";
import { TaskFormValues, taskSchema } from "../utils/taskValidation";
import { zodResolver } from "@hookform/resolvers/zod";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { formatDateTime } from "../utils/format";
import { PRESET_LOCATIONS, PresetLocation } from "../constants";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { TaskInput, useTaskStore } from "../storage/taskStore";
import { useEffect, useState } from "react";
import { AttachedFile } from "../types/task";
import AttachmentThumb from "../components/AttachmentThumb";
import { pickDocument, pickImage } from "../services/attachmentService";
import { useSettingsStore } from '../storage/settingsStore';
import { scheduleReminder, cancelReminder, notificationsSupported } from '../services/notificationService';

function pickDateTime(current: Date, onPicked: (date: Date) => void) {
  DateTimePickerAndroid.open({
    value: current,
    mode: "date",
    minimumDate: new Date(),
    onChange: (event, date) => {
      if (event.type !== "set" || !date) return;
      DateTimePickerAndroid.open({
        value: date,
        mode: "time",
        is24Hour: true,
        onChange: (event, dataTime) => {
          if (event.type !== "set" || !dataTime) return;
          onPicked(dataTime);
        },
      });
    },
  });
}

type Nav = NativeStackNavigationProp<RootStackParamList>;
type FormRoute = RouteProp<RootStackParamList, "TaskForm">;

export default function TaskFormScreen() {

  const navigation = useNavigation<Nav>();
  const { params } = useRoute<FormRoute>();
  const existing = useTaskStore((s) =>
    s.tasks.find((t) => t.id === params?.taskId),
  );
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const setNotificationId = useTaskStore((s) => s.setNotificationId);
  const demoMode = useSettingsStore((s) => s.demoNotifications);
  const isEdit = Boolean(existing);

  const  [attachments, setAttachments] = useState<AttachedFile[]>(existing?.attachedFiles ?? [])
  const addAttachment = async (pick: () => Promise<AttachedFile | null>) => {
    try {
        const file = await pick();
        if (file) setAttachments((prev) => [...prev, file]);
    } catch (error) {
        console.log('Attachment error:', error);
        Alert.alert('Could not attach file', 'Please try again or choose another file.');
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((f) => f.id !== id));
  };

  const {
    control,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: existing
      ? {
          title: existing.title,
          description: existing.description,
          dueDate: new Date(existing.dueDate),
          address: existing.location.address,
          latitude: existing.location.latitude,
          longitude: existing.location.longitude,
        }
      : {
          title: "",
          description: "",
          dueDate: new Date(Date.now() + 60 * 60 * 1000),
          address: "",
          latitude: undefined,
          longitude: undefined,
        },
  });

  useEffect(()=>{
    navigation.setOptions({title: isEdit ? "Edit Task" : "New task"})
  },[navigation, isEdit])

  const [lat, lng] = watch(["latitude", "longitude"]);

  const selectPoint = (point?: PresetLocation) => {
    setValue("latitude", point?.latitude);
    setValue("longitude", point?.longitude);
  };

    const onSubmit = async (values: TaskFormValues) => {
    if (!isEdit && values.dueDate.getTime() <= Date.now()) {
      setError('dueDate', { message: 'Due date must be in the future' });
      return;
    }

    const input: TaskInput = {
      title: values.title,
      description: values.description,
      dueDate: values.dueDate.toISOString(),
      location: {
        address: values.address,
        latitude: values.latitude,
        longitude: values.longitude,
      },
      attachedFiles: attachments,
    };

    let taskId: string;
    if (existing) {
      await cancelReminder(existing.notificationId);
      updateTask(existing.id, input);
      taskId = existing.id;
    } else {
      taskId = addTask(input).id;
    }

    try {
      const notificationId = await scheduleReminder(taskId, input.title, input.dueDate, demoMode);
      setNotificationId(taskId, notificationId);
      if (notificationsSupported && !notificationId && new Date(input.dueDate).getTime() > Date.now()) {
        Alert.alert('Reminder not scheduled', 'Allow notifications in system settings to get task reminders.');
      }
    } catch (error) {
      console.log('Notification error:', error);
      Alert.alert('Reminder not scheduled', 'The task was saved, but the reminder could not be created.');
    }

    navigation.goBack();
  };
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>Title</Text>
      <Controller
        control={control}
        name="title"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Fix air conditioner"
          />
        )}
      />
      {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}

      <Text style={styles.label}>Description</Text>
      <Controller
        control={control}
        name="description"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            style={[styles.multiline, errors.description && styles.inputError]}
            value={value}
            multiline
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Fix air conditioner"
          />
        )}
      />
      {errors.description && (
        <Text style={styles.error}>{errors.description.message}</Text>
      )}

      <Text style={styles.label}>Due date & time</Text>
      <Controller
        control={control}
        name="dueDate"
        render={({ field: { value, onChange } }) => (
          <Pressable
            style={[styles.input, errors.dueDate && styles.inputError]}
            onPress={() => pickDateTime(value, onChange)}
            accessibilityRole="button"
            accessibilityLabel="Choose due date and time"
          >
            <Text style={styles.dateText}>
              {formatDateTime(value.toISOString())}
            </Text>
          </Pressable>
        )}
      />
      {errors.dueDate && (
        <Text style={styles.error}>{errors.dueDate.message}</Text>
      )}

      <Text style={styles.label}>Address</Text>
      <Controller
        control={control}
        name="address"
        render={({ field: { value, onChange, onBlur } }) => (
          <TextInput
            style={[styles.input, errors.address && styles.inputError]}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="Minsk"
          />
        )}
      />
      {errors.address && (
        <Text style={styles.error}>{errors.address.message}</Text>
      )}

      <Text style={styles.label}>Map point (optional)</Text>
      <View style={styles.chips}>
        <Pressable
          style={[styles.chip, lat === undefined && styles.chipActive]}
          onPress={() => selectPoint(undefined)}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.chipText,
              lat === undefined && styles.chipTextActive,
            ]}
          >
            None
          </Text>
        </Pressable>
        {PRESET_LOCATIONS.map((p) => {
          const active = lat === p.latitude && lng === p.longitude;
          return (
            <Pressable
              key={p.label}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => selectPoint(p)}
              accessibilityRole="button"
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {p.label}
              </Text>
            </Pressable>
          );
        })}
      </View>


      <Text style={styles.label}>Attachments</Text>
      {attachments.length > 0 && (
        <View style={styles.chips}>
          {attachments.map((f) => (
            <AttachmentThumb key={f.id} file={f} onRemove={() => removeAttachment(f.id)} />
          ))}
        </View>
      )}
      <View style={styles.chips}>
        <Pressable style={styles.chip} onPress={() => addAttachment(pickImage)} accessibilityRole="button">
          <Text style={styles.chipText}>+ Photo</Text>
        </Pressable>
        <Pressable style={styles.chip} onPress={() => addAttachment(pickDocument)} accessibilityRole="button">
          <Text style={styles.chipText}>+ PDF</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.button}
        onPress={handleSubmit(onSubmit)}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>Save task</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 6 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  multiline: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    minHeight: 100,
    textAlignVertical: "top",
  },
  dateText: { fontSize: 16 },
  inputError: { borderColor: "#DC2626" },
  error: { color: "#DC2626", fontSize: 13 },
  button: {
    marginTop: 24,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
  },
  chipActive: { backgroundColor: "#2563EB" },
  chipText: { fontSize: 14, color: "#111" },
  chipTextActive: { color: "#fff", fontWeight: "600" },
});
