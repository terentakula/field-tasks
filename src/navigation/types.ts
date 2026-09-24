export type TabParamList = {
    Tasks: undefined
    Map: undefined
    History: undefined
    Settings: undefined
}

export type RootStackParamList = {
    Tabs: undefined
    TaskDetails: {taskId: string}
    TaskForm: {taskId?: string}
}