import { useState } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AttachedFile } from "../types/task";

interface Props {
  file: AttachedFile;
  onRemove?: () => void;
}

export default function AttachmentThumb({ file, onRemove }: Props) {
  const [broken, setBroken] = useState(false);
  const isImage = file.mimeType.startsWith('image/');

  return (
    <View style={styles.box}>
      {broken ? (
        <View style={styles.placeholder}>
          <Ionicons name="alert-circle-outline" size={24} color="#DC2626" />
          <Text style={styles.small}>Unavailable</Text>
        </View>
      ) : isImage ? (
        <Image
          source={{ uri: file.uri }}
          style={styles.image}
          onError={() => setBroken(true)}
        />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="document-text-outline" size={28} color="#2563EB" />
          <Text style={styles.small} numberOfLines={1}>
            {file.name}
          </Text>
        </View>
      )}
      {onRemove && (
        <Pressable
          style={styles.remove}
          onPress={onRemove}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${file.name}`}
        >
          <Ionicons name="close" size={14} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 88,
    height: 88,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  image: { width: "100%", height: "100%" },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  small: { fontSize: 11, color: "#374151", marginTop: 4 },
  remove: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
});
