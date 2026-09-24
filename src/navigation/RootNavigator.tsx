import {createNativeStackNavigator} from "@react-navigation/native-stack"
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs"
import { RootStackParamList, TabParamList } from "./types"
import {Ionicons} from "@expo/vector-icons"
import TaskListScreen from "../screens/TaskListScreen"
import MapScreen from "../screens/MapScreen"
import HistoryScreen from "../screens/HistoryScreen"
import SettingsScreen from "../screens/SettingsScreen"
import { NavigationContainer } from "@react-navigation/native"
import TaskDetailsScreen from "../screens/TaskDetailsScreen"
import TaskFormScreen from "../screens/TaskFormScreen"


const Stack = createNativeStackNavigator<RootStackParamList>()
const Tab = createBottomTabNavigator<TabParamList>()

const TAB_ICONS: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
    Tasks: "list",
    Map: "map",
    History: "time",
    Settings: "settings"
}

function Tabs() {
    return (
        <Tab.Navigator
            screenOptions={({route}) => ({
                tabBarIcon: ({color, size}) => (
                    <Ionicons name={TAB_ICONS[route.name]} color={color} size={size} />
                )
            })}
        >
            <Tab.Screen name="Tasks" component={TaskListScreen}/>
            <Tab.Screen name="Map" component={MapScreen}/>
            <Tab.Screen name="History" component={HistoryScreen}/>
            <Tab.Screen name="Settings" component={SettingsScreen}/>
        </Tab.Navigator>
    )
}

export default function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Tabs" component={Tabs} options={{headerShown: false}}/>
                <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} options={{title: "Task Details"}}/>
                <Stack.Screen name="TaskForm" component={TaskFormScreen} options={{title: "Task Form"}}/>
            </Stack.Navigator>
        </NavigationContainer>
    )
}