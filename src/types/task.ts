export type TaskStatus = 'new' | 'in_progress' | 'completed' | 'canceled'
export type SyncStatus = 'pending' | 'synced' | 'faild'

export interface AttachedFile {
    id: string
    uri: string
    name: string
    mimeType: string
}

export interface TaskLocation {
    address: string
    latitude?: number
    longitude?: number
}

export interface Task {
    id: string
    title: string
    description: string
    dueDate: string
    location: TaskLocation
    attachedFiles: AttachedFile[]
    status: TaskStatus
    createdAt: string
    updatedAt: string
    syncStatus: SyncStatus
    notificationId?: string
    deleted?: boolean
}

export type HistoryAction =
  | 'created' | 'edited' | 'status_changed'
  | 'attachment_added' | 'attachment_removed'
  | 'deleted' | 'sync_success' | 'sync_failed';

export interface HistoryEntry {
  id: string;
  taskId: string;
  action: HistoryAction;
  description: string;
  timestamp: string;
}

