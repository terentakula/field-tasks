import { StyleSheet, Text, View } from "react-native";
import { CANDIDATE_CODE } from "../constants";

export default function SettingsScreen() {
    return(
        <View style={styles.container}>
            <Text style={styles.label}></Text>
            <Text style={styles.code}>{CANDIDATE_CODE}</Text>
        </View>
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    label: {
        fontSize: 16,
        opacity: 0.6,
        marginBottom: 10
    },
    code: {
        fontSize: 18,
        fontWeight: "700",
    },
})