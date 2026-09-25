import { Controller, useForm } from "react-hook-form";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from "react-native";
import { TaskFormValues, taskSchema } from "../utils/taskValidation";
import { zodResolver } from "@hookform/resolvers/zod";

export default function TaskFormScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: new Date(),
      address: "",
    },
  });

  const onSubmit = (values: TaskFormValues) => {
    console.log(values);
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
});
