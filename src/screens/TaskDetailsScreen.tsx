import { StyleSheet, Text, View } from "react-native";

export default function TaskDetailsScreen() {
    return(
        <View style={styles.container}>
            <Text>TaskDetailsScreen</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    }
})