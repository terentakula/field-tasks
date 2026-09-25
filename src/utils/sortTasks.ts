import { Task, TaskStatus } from "../types/task"

export type SortKey = "createdAt" | "dueDate" | "status"

const STATUS_ORDER: Record<TaskStatus, number> = {
    in_progress: 0,
    new: 1,
    completed: 2,
    canceled: 3
}

export function sortTasks(tasks: Task[], key: SortKey): Task[] {
    const copy = [...tasks]
    switch (key) {
        case "createdAt":
            return copy.sort((a,b) => b.createdAt.localeCompare(a.createdAt))
        case "dueDate":
            return copy.sort((a,b)=> a.dueDate.localeCompare(b.dueDate))
        case "status":
            return copy.sort((a,b)=> STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
    }
}