import { HistoryAction, HistoryEntry, Task, TaskStatus } from "../types/task";
import * as Crypto from "expo-crypto"
import {create} from "zustand"
import {createJSONStorage, persist} from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"

export type TaskInput = Pick<Task, "title" | "description" | "dueDate" | "location" | "attachedFiles">

export const STATUS_LABELS: Record<TaskStatus, string> = {
    new: "New",
    in_progress: "In Progress",
    completed: "Completed",
    canceled: "Canceled"
}

const now = () => new Date().toISOString()

function makeEntry(taskId: string, action: HistoryAction, description: string): HistoryEntry {
    return {id: Crypto.randomUUID(), taskId, action, description, timestamp: now() }
}

interface TaskState {
    tasks: Task[],
    history: HistoryEntry[],
    hasHydrated: boolean,
    addTask: (input: TaskInput) => Task;
    updateTask: (id: string, input: TaskInput) => void;
    changeStatus: (id: string, status: TaskStatus) => void;
    deleteTask: (id: string) => void;
    purgeTask: (id: string) => void;
    logEvent: (taskId: string, action: HistoryAction, description: string) => void;
}

export const useTaskStore = create<TaskState>() (
    persist(
        (set, get) => ({
            tasks: [],
            history: [],
            hasHydrated: false,
            addTask:(input)=>{
                const timestamp = now()
                const task: Task = {
                    ...input,
                    id: Crypto.randomUUID(),
                    status: "new",
                    createdAt: timestamp,
                    updatedAt: timestamp,
                    syncStatus: "pending",
                }
                set((state)=> ({
                    tasks: [task, ...state.tasks],
                    history: [makeEntry(task.id, "created", `Task "${task.title}" created`), ...state.history]
                }))
                return task
            },
            updateTask:(id, input)=>{
                set((state) => ({
                    tasks: state.tasks.map((t) => 
                        t.id === id ? {...t, ...input, updatedAt: now(), syncStatus: "pending"} : t
                    ),
                    history: [makeEntry(id, "edited", `Task "${input.title}" edited`), ...state.history]
                }))
            },
            changeStatus:(id, status)=>{
                const task = get().tasks.find((t) => t.id === id)
                if(!task || task.status === status) return
                set((state) => ({
                    tasks: state.tasks.map((t)=>
                        t.id === id ? {...t, status, updatedAt: now(), syncStatus: 'pending' } : t
                    ),
                    history: [
                      makeEntry(id, 'status_changed', `"${task.title}": ${STATUS_LABELS[task.status]} → ${STATUS_LABELS[status]}`),
                      ...state.history,
                    ],
                }))
            },
            deleteTask: (id) => {
                const task = get().tasks.find((t) => t.id === id);
                if (!task) return;
                set((state) => ({
                  tasks: state.tasks.map((t) =>
                    t.id === id ? { ...t, deleted: true, updatedAt: now(), syncStatus: 'pending' } : t
                  ),
                  history: [makeEntry(id, 'deleted', `Task "${task.title}" deleted`), ...state.history],
                }));
            },
            purgeTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
            logEvent: (taskId, action, description) =>
                set((state) => ({ history: [makeEntry(taskId, action, description), ...state.history] })),
        }),
        {
        name: 'field-tasks-storage',
              storage: createJSONStorage(() => AsyncStorage),
              partialize: (state) => ({ tasks: state.tasks, history: state.history }),
              onRehydrateStorage: () => () => {
                useTaskStore.setState({ hasHydrated: true });
              },
        },
    )
)