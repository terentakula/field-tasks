import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useTaskStore } from "../storage/taskStore";

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface MapMarker {
  id: string;
  title: string;
  lat: number;
  lng: number;
}

function buildMapHtml(markers: MapMarker[]): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>html, body, #map { height: 100%; margin: 0; }</style>
</head>
<body>
<div id="map"></div>
<script>
  function esc(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  var markers = ${JSON.stringify(markers)};
  var map = L.map('map');
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri'
  }).addTo(map);

  var points = [];
  markers.forEach(function (m) {
    var marker = L.marker([m.lat, m.lng]).addTo(map);
    marker.bindTooltip(esc(m.title), { permanent: true, direction: 'top', offset: [-15, -12] });
    marker.on('click', function () {
      window.ReactNativeWebView.postMessage(m.id);
    });
    points.push([m.lat, m.lng]);
  });

  if (points.length > 0) {
    map.fitBounds(points, { padding: [50, 50], maxZoom: 15 });
  } else {
    map.setView([53.9, 27.56], 12);
  }
</script>
</body>
</html>`;
}

export default function MapScreen() {
  const navigation = useNavigation<Nav>();
  const tasks = useTaskStore((s) => s.tasks);

  const markers = useMemo<MapMarker[]>(
    () =>
      tasks
        .filter(
          (t) =>
            !t.deleted &&
            t.location.latitude !== undefined &&
            t.location.longitude !== undefined,
        )
        .map((t) => ({
          id: t.id,
          title: t.title,
          lat: t.location.latitude as number,
          lng: t.location.longitude as number,
        })),
    [tasks],
  );

  const html = useMemo(() => buildMapHtml(markers), [markers]);

  const handleMessage = (event: WebViewMessageEvent) => {
    navigation.navigate("TaskDetails", { taskId: event.nativeEvent.data });
  };

  return (
    <View style={styles.container}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={handleMessage}
        style={styles.container}
      />
      {markers.length === 0 && (
        <View style={styles.banner} pointerEvents="none">
          <Text style={styles.bannerText}>
            No tasks with a map point yet. Choose one in the task form.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  banner: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 16,
    backgroundColor: "rgba(17,24,39,0.85)",
    borderRadius: 10,
    padding: 12,
  },
  bannerText: { color: "#fff", fontSize: 14, textAlign: "center" },
});
