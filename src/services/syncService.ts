import { useTaskStore } from "../storage/taskStore";
import { useSettingsStore } from "../storage/settingsStore";
import { Task } from "../types/task";

let isSyncing = false;

// На сервер не отправляем служебные поля телефона
function toServer(task: Task) {
  const { syncStatus, notificationId, deleted, ...payload } = task;
  return payload;
}

async function request(path: string, options?: RequestInit) {
  const base = useSettingsStore.getState().serverUrl;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    return await fetch(`${base}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function syncNow(): Promise<boolean> {
  const store = useTaskStore.getState();
  if (isSyncing || !store.hasHydrated) return false;
  isSyncing = true;

  try {
    const res = await request("/tasks");
    if (!res.ok) throw new Error(`Server responded ${res.status}`);
    const serverTasks: Task[] = await res.json();

    // 1. Отправляем локальные изменения
    const unsynced = useTaskStore
      .getState()
      .tasks.filter((t) => t.syncStatus !== "synced");
    for (const task of unsynced) {
      const remote = serverTasks.find((r) => r.id === task.id);
      try {
        if (task.deleted) {
          if (remote) {
            const d = await request(`/tasks/${task.id}`, { method: 'DELETE' });
            if (!d.ok && d.status !== 404) throw new Error(`Delete failed: ${d.status}`);
          }
          store.purgeTask(task.id);
          store.logEvent(
            task.id,
            "sync_success",
            `Deletion of "${task.title}" synced`,
          );
          continue;
        }
        // Last-write-wins: если на сервере версия новее, берём её
        if (remote && remote.updatedAt > task.updatedAt) {
          store.upsertFromServer(remote);
          store.logEvent(
            task.id,
            "sync_success",
            `"${task.title}" replaced by newer server version`,
          );
          continue;
        }
        const r = await request(remote ? `/tasks/${task.id}` : "/tasks", {
          method: remote ? "PUT" : "POST",
          body: JSON.stringify(toServer(task)),
        });
        if (!r.ok) throw new Error(`Server responded ${r.status}`);
        store.setSyncStatus(task.id, "synced");
        store.logEvent(task.id, "sync_success", `"${task.title}" synced`);
      } catch {
        store.setSyncStatus(task.id, "faild");
        store.logEvent(
          task.id,
          "sync_failed",
          `"${task.title}" failed to sync`,
        );
      }
    }

    // 2. Заново спрашиваем сервер — уже после наших удалений и изменений
    const freshRes = await request('/tasks');
    if (!freshRes.ok) throw new Error(`Server responded ${freshRes.status}`);
    const freshTasks: Task[] = await freshRes.json();

    const local = useTaskStore.getState().tasks;
    for (const remote of freshTasks) {
      const mine = local.find((t) => t.id === remote.id);
      if (!mine || (mine.syncStatus === 'synced' && remote.updatedAt > mine.updatedAt)) {
        store.upsertFromServer(remote);
      }
    }
    return true;
  } catch (error) {
    console.log("Sync error:", error);
    // Сервер недоступен: ожидающие задачи помечаем как Sync failed
    useTaskStore
      .getState()
      .tasks.filter((t) => t.syncStatus === "pending")
      .forEach((t) => store.setSyncStatus(t.id, "faild"));
    return false;
  } finally {
    isSyncing = false;
  }
}
