import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RootNavigator from "./src/navigation/RootNavigator";
import "./src/services/notificationService";
import { useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import { syncNow } from "./src/services/syncService";

export default function App() {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) syncNow();
    });
    const timer = setInterval(syncNow, 30000);
    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <RootNavigator />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
