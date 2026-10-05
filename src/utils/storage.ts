import { Task, EvaluationItem, UserRole, TaskHistoryItem, TaskDocument } from '../types';
import { INITIAL_TASKS, INITIAL_EVALUATIONS, INITIAL_HISTORY, INITIAL_DOCUMENTS } from '../data/mockData';

const STORAGE_KEYS = {
  TASKS: 'sots_tasks_v1',
  HISTORY: 'sots_history_v1',
  DOCUMENTS: 'sots_documents_v1',
  EVALUATIONS: 'sots_evaluations_v1',
  USER_ROLE: 'sots_user_role_v1'
};

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw === null) {
      saveTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      saveTasks(INITIAL_TASKS);
      return INITIAL_TASKS;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load tasks from localStorage', e);
    return INITIAL_TASKS;
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks to localStorage', e);
  }
}

export function resetTasksToDemo(): Task[] {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
    return INITIAL_TASKS;
  } catch (e) {
    console.error('Failed to reset tasks to demo', e);
    return INITIAL_TASKS;
  }
}

export function loadHistory(): TaskHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (raw === null) {
      saveHistory(INITIAL_HISTORY);
      return INITIAL_HISTORY;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_HISTORY;
  } catch (e) {
    console.error('Failed to load history from localStorage', e);
    return INITIAL_HISTORY;
  }
}

export function saveHistory(history: TaskHistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history to localStorage', e);
  }
}

export function resetHistoryToDemo(): TaskHistoryItem[] {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(INITIAL_HISTORY));
    return INITIAL_HISTORY;
  } catch (e) {
    console.error('Failed to reset history to demo', e);
    return INITIAL_HISTORY;
  }
}

export function loadDocuments(): TaskDocument[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (raw === null) {
      saveDocuments(INITIAL_DOCUMENTS);
      return INITIAL_DOCUMENTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_DOCUMENTS;
  } catch (e) {
    console.error('Failed to load documents from localStorage', e);
    return INITIAL_DOCUMENTS;
  }
}

export function saveDocuments(documents: TaskDocument[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
  } catch (e) {
    console.error('Failed to save documents to localStorage', e);
  }
}

export function resetDocumentsToDemo(): TaskDocument[] {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(INITIAL_DOCUMENTS));
    return INITIAL_DOCUMENTS;
  } catch (e) {
    console.error('Failed to reset documents to demo', e);
    return INITIAL_DOCUMENTS;
  }
}

export function loadEvaluations(): EvaluationItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
    if (raw === null) {
      saveEvaluations(INITIAL_EVALUATIONS);
      return INITIAL_EVALUATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_EVALUATIONS;
  } catch (e) {
    console.error('Failed to load evaluations', e);
    return INITIAL_EVALUATIONS;
  }
}

export function saveEvaluations(evaluations: EvaluationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
  } catch (e) {
    console.error('Failed to save evaluations', e);
  }
}

export function resetEvaluationsToDemo(): EvaluationItem[] {
  try {
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(INITIAL_EVALUATIONS));
    return INITIAL_EVALUATIONS;
  } catch (e) {
    console.error('Failed to reset evaluations to demo', e);
    return INITIAL_EVALUATIONS;
  }
}

export function loadUserRole(): UserRole {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    if (raw === 'admin' || raw === 'staff' || raw === 'viewer') {
      return raw;
    }
    return 'admin';
  } catch {
    return 'admin';
  }
}

export function saveUserRole(role: UserRole): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  } catch (e) {
    console.error('Failed to save role', e);
  }
}

/**
 * Exports tasks to CSV with UTF-8 BOM so Microsoft Excel can open Thai characters properly.
 */
export function exportTasksToCSV(tasks: Task[]): void {
  const headers = [
    'รหัสงาน',
    'วันที่รับเรื่อง',
    'ประเภทงาน',
    'หน่วยงาน/ผู้รับผิดชอบ',
    'กำหนดติดตาม',
    'สถานะ',
    'วันที่ติดตามล่าสุด',
    'วันที่ติดตามครั้งถัดไป',
    'ขั้นตอนการทำงาน',
    'ระดับความสำคัญ',
    'สรุปการดำเนินงาน',
    'หมายเหตุ'
  ];

  const escapeField = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const cleanStr = String(str).replace(/"/g, '""');
    return `"${cleanStr}"`;
  };

  const rows = tasks.map(t => [
    escapeField(t.id),
    escapeField(t.receivedDate),
    escapeField(t.category),
    escapeField(t.assignee),
    escapeField(t.deadline),
    escapeField(t.status),
    escapeField(t.lastTrackedDate),
    escapeField(t.nextTrackingDate),
    escapeField(`ขั้นที่ ${t.workflowStep}`),
    escapeField(t.priority),
    escapeField(t.summary),
    escapeField(t.notes)
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `รายงานติดตามงาน_SOTS_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports history items to CSV with UTF-8 BOM so Microsoft Excel can open Thai characters properly.
 */
export function exportHistoryToCSV(history: TaskHistoryItem[]): void {
  const headers = [
    'วันที่และเวลา',
    'รหัสงาน',
    'สถานะเดิม',
    'สถานะใหม่',
    'ผู้ดำเนินการ',
    'รายละเอียด/หมายเหตุ'
  ];

  const escapeField = (str: string | number | undefined | null) => {
    if (str === undefined || str === null) return '""';
    const cleanStr = String(str).replace(/"/g, '""');
    return `"${cleanStr}"`;
  };

  const rows = history.map(h => [
    escapeField(h.timestamp),
    escapeField(h.taskId),
    escapeField(h.previousStatus),
    escapeField(h.newStatus),
    escapeField(h.operator),
    escapeField(h.details)
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ประวัติการดำเนินงาน_SOTS_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
