import React, { useState, useEffect } from 'react';
import {
  Task,
  TaskHistoryItem,
  TaskDocument,
  EvaluationItem,
  UserRole,
  ActiveTab,
  TaskStatus,
  AuditActionType,
  SOTSBackupData
} from './types';
import {
  loadTasks,
  saveTasks,
  resetTasksToDemo,
  loadHistory,
  saveHistory,
  resetHistoryToDemo,
  loadDocuments,
  saveDocuments,
  resetDocumentsToDemo,
  loadEvaluations,
  saveEvaluations,
  resetEvaluationsToDemo,
  loadUserRole,
  saveUserRole
} from './utils/storage';
import { getCurrentDateTimeString } from './utils/dateUtils';
import {
  initAuth,
  googleSignIn,
  googleSignOut,
  getAccessToken
} from './services/googleAuth';
import {
  findOrCreateSOTSDatabase,
  fetchTasksFromSheet,
  appendTaskToSheet,
  updateTaskInSheet,
  deleteTaskFromSheet,
  seedInitialTasksToSheet,
  fetchHistoryFromSheet,
  appendHistoryToSheet,
  seedInitialHistoryToSheet,
  fetchDocumentsFromSheet,
  appendDocumentToSheet,
  deleteDocumentFromSheet,
  seedInitialDocumentsToSheet
} from './services/googleSheets';
import { uploadFileToDrive, deleteFileFromDrive, formatFileSize } from './services/googleDrive';
import { SheetsConnectionStatus } from './components/GoogleSheetsBar';
import { DriveConnectionState } from './components/TaskDocumentsSection';
import { User as FirebaseUser } from 'firebase/auth';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { TaskList } from './components/TaskList';
import { TaskHistoryView } from './components/TaskHistoryView';
import { TaskFormModal } from './components/TaskFormModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { PrintReportModal } from './components/PrintReportModal';
import { StatisticsView } from './components/StatisticsView';
import { EvaluationView } from './components/EvaluationView';
import { ReportsView } from './components/ReportsView';
import { BackupRestoreView } from './components/BackupRestoreView';
import { DeadlineAlertModal } from './components/DeadlineAlertModal';
import { UserGuide } from './components/UserGuide';
import { ComplianceView } from './components/ComplianceView';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { ShieldCheck, Info } from 'lucide-react';

export default function App() {
  // Main State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<TaskHistoryItem[]>([]);
  const [documents, setDocuments] = useState<TaskDocument[]>([]);
  const [evaluations, setEvaluations] = useState<EvaluationItem[]>([]);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Google Sheets & Drive Integration State
  const [sheetsStatus, setSheetsStatus] = useState<SheetsConnectionStatus>('disconnected');
  const [driveStatus, setDriveStatus] = useState<DriveConnectionState>('disconnected');
  const [driveErrorMessage, setDriveErrorMessage] = useState<string | undefined>(undefined);
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(null);
  const [sheetLink, setSheetLink] = useState<string | undefined>(undefined);
  const [sheetsErrorMessage, setSheetsErrorMessage] = useState<string | undefined>(undefined);

  // UI Modals & Panels State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [singlePrintTask, setSinglePrintTask] = useState<Task | null>(null);
  const [isDeadlineAlertModalOpen, setIsDeadlineAlertModalOpen] = useState(false);
  const [filterPreset, setFilterPreset] = useState<{ urgency?: string; status?: string }>({});

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Confirmation Modal
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Initial Data Load & Auth Listener
  useEffect(() => {
    const loaded = loadTasks();
    setTasks(loaded);
    const hist = loadHistory();
    setHistory(hist);
    const docs = loadDocuments();
    setDocuments(docs);
    const evals = loadEvaluations();
    setEvaluations(evals);
    const role = loadUserRole();
    setUserRole(role);

    // Initialize Auth listener
    const unsubscribe = initAuth(
      async (user, token) => {
        setGoogleUser(user);
        setDriveStatus('connected');
        // Automatically sync with Google Sheets if user was logged in
        try {
          setSheetsStatus('syncing');
          const sheetInfo = await findOrCreateSOTSDatabase(token);
          setSpreadsheetId(sheetInfo.spreadsheetId);
          setSheetLink(sheetInfo.webViewLink);

          const sheetTasks = await fetchTasksFromSheet(sheetInfo.spreadsheetId, token);
          if (sheetTasks.length > 0) {
            setTasks(sheetTasks);
            saveTasks(sheetTasks);
          }

          const sheetHistory = await fetchHistoryFromSheet(sheetInfo.spreadsheetId, token);
          if (sheetHistory.length > 0) {
            setHistory(sheetHistory);
            saveHistory(sheetHistory);
          }

          const sheetDocs = await fetchDocumentsFromSheet(sheetInfo.spreadsheetId, token);
          if (sheetDocs.length > 0) {
            setDocuments(sheetDocs);
            saveDocuments(sheetDocs);
          }

          setSheetsStatus('connected');
        } catch (err: any) {
          console.error('Auto sync error:', err);
          setSheetsStatus('connected');
        }
      },
      () => {
        setGoogleUser(null);
        setSheetsStatus('disconnected');
        setDriveStatus('disconnected');
        setSpreadsheetId(null);
        setSheetLink(undefined);
      }
    );

    return () => unsubscribe();
  }, []);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const newToast: ToastMessage = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      title,
      message
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Google Sheets Handlers
  const handleConnectSheets = async () => {
    setSheetsErrorMessage(undefined);
    setSheetsStatus('connecting');

    try {
      const authResult = await googleSignIn();
      if (!authResult) {
        setSheetsStatus('disconnected');
        setDriveStatus('disconnected');
        return;
      }

      setGoogleUser(authResult.user);
      const token = authResult.accessToken;
      setDriveStatus('connected');

      addToast('info', 'กำลังค้นหาหรือสร้างไฟล์ SOTS_Database...', 'เชื่อมต่อกับ Google Drive สำเร็จ');

      // Find or create spreadsheet SOTS_Database
      const sheetInfo = await findOrCreateSOTSDatabase(token);
      setSpreadsheetId(sheetInfo.spreadsheetId);
      setSheetLink(sheetInfo.webViewLink);

      if (sheetInfo.isNew) {
        // Seed current tasks, history and documents into new sheet
        await seedInitialTasksToSheet(sheetInfo.spreadsheetId, tasks, token);
        await seedInitialHistoryToSheet(sheetInfo.spreadsheetId, history, token);
        await seedInitialDocumentsToSheet(sheetInfo.spreadsheetId, documents, token);
        addToast('success', 'สร้างไฟล์ SOTS_Database สำเร็จ', 'นำเข้าข้อมูลงาน ประวัติ และเอกสารเข้าสู่ Google Sheets เรียบร้อยแล้ว');
      }

      // Read tasks, history and documents from sheet
      const sheetTasks = await fetchTasksFromSheet(sheetInfo.spreadsheetId, token);
      if (sheetTasks.length > 0) {
        setTasks(sheetTasks);
        saveTasks(sheetTasks);
      }

      const sheetHistory = await fetchHistoryFromSheet(sheetInfo.spreadsheetId, token);
      if (sheetHistory.length > 0) {
        setHistory(sheetHistory);
        saveHistory(sheetHistory);
      }

      const sheetDocs = await fetchDocumentsFromSheet(sheetInfo.spreadsheetId, token);
      if (sheetDocs.length > 0) {
        setDocuments(sheetDocs);
        saveDocuments(sheetDocs);
      }

      setSheetsStatus('connected');
      addToast(
        'success',
        'เชื่อมต่อ Google Sheets และ Drive สำเร็จ',
        `พร้อมใช้งานฐานข้อมูล SOTS_Database (${sheetTasks.length || tasks.length} รายการ)`
      );
    } catch (err: any) {
      console.error('Google Sheets connection error:', err);
      const msg = err.message || 'ไม่สามารถเชื่อมต่อ Google Sheets ได้';
      setSheetsErrorMessage(msg);
      setSheetsStatus('error');
      addToast('error', 'การเชื่อมต่อ Google Sheets ขัดข้อง', msg);
    }
  };

  const handleSyncSheets = async () => {
    if (!spreadsheetId) {
      handleConnectSheets();
      return;
    }

    setSheetsErrorMessage(undefined);
    setSheetsStatus('syncing');

    try {
      const token = await getAccessToken();
      if (!token) {
        // Need re-auth
        await handleConnectSheets();
        return;
      }

      setDriveStatus('connected');
      const sheetTasks = await fetchTasksFromSheet(spreadsheetId, token);
      setTasks(sheetTasks);
      saveTasks(sheetTasks);

      const sheetHistory = await fetchHistoryFromSheet(spreadsheetId, token);
      if (sheetHistory.length > 0) {
        setHistory(sheetHistory);
        saveHistory(sheetHistory);
      }

      const sheetDocs = await fetchDocumentsFromSheet(spreadsheetId, token);
      if (sheetDocs.length > 0) {
        setDocuments(sheetDocs);
        saveDocuments(sheetDocs);
      }

      setSheetsStatus('sync_success');
      setTimeout(() => setSheetsStatus('connected'), 3000);
      addToast('success', 'ซิงค์ข้อมูลสำเร็จ', `ดึงข้อมูลล่าสุดจาก Google Sheets เรียบร้อยแล้ว (${sheetTasks.length} รายการ)`);
    } catch (err: any) {
      console.error('Sync error:', err);
      const msg = err.message || 'เกิดข้อผิดพลาดในการซิงค์ข้อมูล';
      setSheetsErrorMessage(msg);
      setSheetsStatus('error');
      addToast('error', 'ซิงค์ข้อมูลไม่สำเร็จ', msg);
    }
  };

  const handleDisconnectSheets = async () => {
    try {
      await googleSignOut();
      setSheetsStatus('disconnected');
      setDriveStatus('disconnected');
      setGoogleUser(null);
      setSpreadsheetId(null);
      setSheetLink(undefined);
      setSheetsErrorMessage(undefined);
      addToast('info', 'ยกเลิกการเชื่อมต่อแล้ว', 'ระบบสลับมาใช้ข้อมูลจำลองในเครื่อง (LocalStorage)');
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  // Change Role Handler
  const handleChangeRole = (newRole: UserRole) => {
    setUserRole(newRole);
    saveUserRole(newRole);
    addToast('info', `สลับสิทธิ์การใช้งานเป็น: ${newRole === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : newRole === 'staff' ? 'เจ้าหน้าที่ (Staff)' : 'ผู้ดู (Viewer)'}`);
  };

  // Create or Update Task
  const handleSaveTask = async (taskData: Omit<Task, 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    let updatedTasks: Task[];
    const isEdit = Boolean(editingTask);

    if (editingTask) {
      const targetId = editingTask.id;
      const updatedTaskItem: Task = {
        ...taskData,
        id: targetId,
        createdAt: editingTask.createdAt,
        updatedAt: now
      };

      updatedTasks = tasks.map((t) => (t.id === targetId ? updatedTaskItem : t));
      setTasks(updatedTasks);
      saveTasks(updatedTasks);

      // If status changed on edit, create history record
      let actionType: AuditActionType = 'แก้ไขงาน';
      let prevVal: string | undefined = undefined;
      let newVal: string | undefined = undefined;
      let detailsText = `ปรับปรุงข้อมูลรายละเอียดงานรหัส ${targetId}`;

      if (editingTask.status !== taskData.status) {
        actionType = 'เปลี่ยนสถานะ';
        prevVal = editingTask.status;
        newVal = taskData.status;
        detailsText = `ปรับปรุงสถานะงานจาก "${editingTask.status}" เป็น "${taskData.status}"`;
      } else if (editingTask.deadline !== taskData.deadline) {
        actionType = 'เปลี่ยนกำหนดติดตาม';
        prevVal = editingTask.deadline;
        newVal = taskData.deadline;
        detailsText = `ปรับเปลี่ยนกำหนดติดตามจาก "${editingTask.deadline}" เป็น "${taskData.deadline}"`;
      } else if (editingTask.assignee !== taskData.assignee) {
        actionType = 'เปลี่ยนผู้รับผิดชอบ';
        prevVal = editingTask.assignee;
        newVal = taskData.assignee;
        detailsText = `เปลี่ยนผู้รับผิดชอบจาก "${editingTask.assignee}" เป็น "${taskData.assignee}"`;
      }

      const editHistItem: TaskHistoryItem = {
        id: `HIST-${Date.now()}`,
        timestamp: getCurrentDateTimeString(),
        taskId: targetId,
        action: actionType,
        previousValue: prevVal,
        newValue: newVal,
        previousStatus: editingTask.status,
        newStatus: taskData.status,
        operator:
          userRole === 'admin'
            ? 'ผู้ดูแลระบบ (Admin)'
            : userRole === 'staff'
            ? taskData.assignee || 'เจ้าหน้าที่ (Staff)'
            : 'ผู้บันทึก',
        details: detailsText
      };
      const nextHistory = [editHistItem, ...history];
      setHistory(nextHistory);
      saveHistory(nextHistory);

      if (sheetsStatus === 'connected' && spreadsheetId) {
        try {
          const token = await getAccessToken();
          if (token) {
            await appendHistoryToSheet(spreadsheetId, editHistItem, token);
          }
        } catch (err: any) {
          console.error('History append error:', err);
        }
      }

      // If also viewing this task, update detail modal
      if (viewingTask && viewingTask.id === targetId) {
        setViewingTask(updatedTaskItem);
      }

      // If connected to Google Sheets, update sheet row
      if (sheetsStatus === 'connected' && spreadsheetId) {
        try {
          const token = await getAccessToken();
          if (token) {
            await updateTaskInSheet(spreadsheetId, updatedTaskItem, token);
            addToast('success', 'แก้ไขข้อมูลเรียบร้อยแล้ว', `อัปเดตข้อมูลรหัส ${targetId} ใน Google Sheets แล้ว`);
          }
        } catch (err: any) {
          console.error('Google Sheets update error:', err);
          addToast('error', 'บันทึกในเครื่องแล้ว แต่ซิงค์ Google Sheets ขัดข้อง', err.message);
        }
      } else {
        addToast('success', 'แก้ไขข้อมูลเรียบร้อยแล้ว', `บันทึกการเปลี่ยนแปลงรหัส ${targetId} แล้ว`);
      }
    } else {
      // Create new
      const newTask: Task = {
        ...taskData,
        createdAt: now,
        updatedAt: now
      };
      updatedTasks = [newTask, ...tasks];
      setTasks(updatedTasks);
      saveTasks(updatedTasks);

      // Create initial history record for new task
      const newHistItem: TaskHistoryItem = {
        id: `HIST-${Date.now()}`,
        timestamp: getCurrentDateTimeString(),
        taskId: newTask.id,
        action: 'เพิ่มงาน',
        previousStatus: 'รับเรื่อง',
        newStatus: newTask.status,
        operator:
          userRole === 'admin'
            ? 'ผู้ดูแลระบบ (Admin)'
            : userRole === 'staff'
            ? newTask.assignee || 'เจ้าหน้าที่ (Staff)'
            : 'ผู้บันทึก',
        details: `ลงทะเบียนงานใหม่: ${newTask.summary} (${newTask.category})`
      };
      const nextHistory = [newHistItem, ...history];
      setHistory(nextHistory);
      saveHistory(nextHistory);

      // If connected to Google Sheets, append row & history
      if (sheetsStatus === 'connected' && spreadsheetId) {
        try {
          const token = await getAccessToken();
          if (token) {
            await appendTaskToSheet(spreadsheetId, newTask, token);
            await appendHistoryToSheet(spreadsheetId, newHistItem, token);
            addToast('success', 'เพิ่มงานเรียบร้อยแล้ว', `บันทึกงานใหม่รหัส ${newTask.id} ลง Google Sheets แล้ว`);
          }
        } catch (err: any) {
          console.error('Google Sheets append error:', err);
          addToast('error', 'บันทึกในเครื่องแล้ว แต่ซิงค์ Google Sheets ขัดข้อง', err.message);
        }
      } else {
        addToast('success', 'เพิ่มงานเรียบร้อยแล้ว', `บันทึกงานใหม่รหัส ${newTask.id} เข้าสู่ระบบแล้ว`);
      }
    }

    setIsFormOpen(false);
    setEditingTask(null);
  };

  // Delete Task Handler
  const handleDeleteTaskPrompt = (task: Task) => {
    setConfirmModalState({
      isOpen: true,
      title: 'ยืนยันการลบรายการงาน',
      message: `คุณต้องการลบรายการงานรหัส "${task.id}" (${task.summary}) หรือไม่? ${
        sheetsStatus === 'connected' ? 'รายการนี้จะถูกลบออกจาก Google Sheets ด้วย' : ''
      }`,
      confirmText: 'ลบรายการ',
      cancelText: 'ยกเลิก',
      isDestructive: true,
      onConfirm: async () => {
        const nextTasks = tasks.filter((t) => t.id !== task.id);
        setTasks(nextTasks);
        saveTasks(nextTasks);
        setConfirmModalState((prev) => ({ ...prev, isOpen: false }));

        if (viewingTask && viewingTask.id === task.id) {
          setViewingTask(null);
        }

        // Add audit log for deleted task
        const deleteHistItem: TaskHistoryItem = {
          id: `HIST-${Date.now()}`,
          timestamp: getCurrentDateTimeString(),
          taskId: task.id,
          action: 'ลบงาน',
          previousStatus: task.status,
          newStatus: 'ลบรายการ',
          operator: userRole === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'เจ้าหน้าที่ (Staff)',
          details: `ลบรายการงานรหัส ${task.id}: ${task.summary}`
        };
        const nextHistory = [deleteHistItem, ...history];
        setHistory(nextHistory);
        saveHistory(nextHistory);

        // If connected to Google Sheets, delete row from sheet
        if (sheetsStatus === 'connected' && spreadsheetId) {
          try {
            const token = await getAccessToken();
            if (token) {
              await deleteTaskFromSheet(spreadsheetId, task.id, token);
              await appendHistoryToSheet(spreadsheetId, deleteHistItem, token);
              addToast('success', 'ลบงานเรียบร้อยแล้ว', `ลบรหัส ${task.id} ออกจาก Google Sheets แล้ว`);
            }
          } catch (err: any) {
            console.error('Google Sheets delete error:', err);
            addToast('error', 'ลบจากในเครื่องแล้ว แต่ซิงค์ Google Sheets ขัดข้อง', err.message);
          }
        } else {
          addToast('success', 'ลบงานเรียบร้อยแล้ว', `ลบรหัส ${task.id} ออกจากระบบแล้ว`);
        }
      }
    });
  };

  // Reset Demo Data Handler
  const handleResetDemoPrompt = () => {
    setConfirmModalState({
      isOpen: true,
      title: 'ยืนยันการรีเซ็ตข้อมูลตัวอย่าง',
      message: 'คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นข้อมูลตัวอย่างเริ่มต้น 12 รายการหรือไม่? ข้อมูลงาน ประวัติ และเอกสารที่คุณเพิ่มหรือแก้ไขไว้จะถูกแทนที่ด้วยชุดข้อมูลสาธิตเริ่มต้น',
      confirmText: 'ยืนยันการรีเซ็ต',
      cancelText: 'ยกเลิก',
      isDestructive: false,
      onConfirm: () => {
        const fresh = resetTasksToDemo();
        setTasks(fresh);
        const freshHist = resetHistoryToDemo();
        setHistory(freshHist);
        const freshDocs = resetDocumentsToDemo();
        setDocuments(freshDocs);
        setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
        addToast('success', 'รีเซ็ตข้อมูลตัวอย่างเรียบร้อยแล้ว', 'คืนค่าข้อมูลตัวอย่างงาน 12 รายการ ประวัติ 11 รายการ และเอกสารเริ่มต้นพร้อมใช้งาน');
      }
    });
  };

  // Quick Status Change from Detail View
  const handleQuickStatusChange = async (
    taskId: string,
    newStatus: TaskStatus,
    comment?: string,
    operator?: string
  ) => {
    const nextStep =
      newStatus === 'รับเรื่อง' || newStatus === 'รอดำเนินการ'
        ? 1
        : newStatus === 'มอบหมาย'
        ? 2
        : newStatus === 'อยู่ระหว่างดำเนินการ'
        ? 3
        : newStatus === 'รอติดตาม'
        ? 4
        : newStatus === 'เสร็จสิ้น'
        ? 5
        : 2;

    let targetUpdated: Task | null = null;
    const oldTask = tasks.find((t) => t.id === taskId);
    const oldStatus = oldTask ? oldTask.status : '-';

    const nextTasks = tasks.map((t) => {
      if (t.id === taskId) {
        const updated = {
          ...t,
          status: newStatus,
          workflowStep: nextStep as 1 | 2 | 3 | 4 | 5,
          updatedAt: new Date().toISOString()
        };
        targetUpdated = updated;
        if (viewingTask && viewingTask.id === taskId) {
          setViewingTask(updated);
        }
        return updated;
      }
      return t;
    });

    setTasks(nextTasks);
    saveTasks(nextTasks);

    // Create automatic history item
    const nowStr = getCurrentDateTimeString();
    const opName =
      operator ||
      (userRole === 'admin'
        ? 'ผู้ดูแลระบบ (Admin)'
        : userRole === 'staff'
        ? oldTask?.assignee || 'เจ้าหน้าที่ (Staff)'
        : 'ผู้บันทึก');

    const detailText = comment || `ปรับสถานะงานจาก "${oldStatus}" เป็น "${newStatus}"`;

    const newHistItem: TaskHistoryItem = {
      id: `HIST-${Date.now()}`,
      timestamp: nowStr,
      taskId,
      action: 'เปลี่ยนสถานะ',
      previousValue: oldStatus,
      newValue: newStatus,
      previousStatus: oldStatus,
      newStatus,
      operator: opName,
      details: detailText
    };

    const nextHistory = [newHistItem, ...history];
    setHistory(nextHistory);
    saveHistory(nextHistory);

    addToast('success', 'อัปเดตสถานะงานเรียบร้อยแล้ว', `เปลี่ยนสถานะรหัส ${taskId} เป็น "${newStatus}"`);

    // Sync with Google Sheets if connected
    if (sheetsStatus === 'connected' && spreadsheetId) {
      try {
        const token = await getAccessToken();
        if (token) {
          if (targetUpdated) {
            await updateTaskInSheet(spreadsheetId, targetUpdated, token);
          }
          await appendHistoryToSheet(spreadsheetId, newHistItem, token);
        }
      } catch (err: any) {
        console.error('Quick status update sheet error:', err);
      }
    }
  };

  // Google Drive & Local Document Upload Handler
  const handleUploadDocument = async (taskId: string, file: File, uploaderName: string) => {
    try {
      let driveFileId = `local-${Date.now()}`;
      let driveUrl = '';
      const now = new Date();
      const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';

      // Check if connected to Google Drive
      const token = await getAccessToken();
      if (token) {
        setDriveStatus('uploading');
        try {
          const driveResult = await uploadFileToDrive(file, taskId, token);
          driveFileId = driveResult.fileId;
          driveUrl = driveResult.webViewLink;
          setDriveStatus('connected');
        } catch (err: any) {
          console.error('Drive upload failed, fallback to local file metadata', err);
          setDriveErrorMessage(err.message);
          setDriveStatus('connected');
        }
      }

      const newDoc: TaskDocument = {
        id: `DOC-${Date.now().toString().slice(-5)}`,
        taskId,
        fileName: file.name,
        fileType: ext,
        fileSize: formatFileSize(file.size),
        driveFileId,
        driveUrl: driveUrl || '',
        uploadedDate: dateFormatted,
        uploadedBy: uploaderName
      };

      const nextDocs = [newDoc, ...documents];
      setDocuments(nextDocs);
      saveDocuments(nextDocs);

      // If connected to Google Sheets, append to Documents sheet
      if (sheetsStatus === 'connected' && spreadsheetId && token) {
        try {
          await appendDocumentToSheet(spreadsheetId, newDoc, token);
        } catch (err: any) {
          console.error('Failed to append doc to sheets:', err);
        }
      }

      // Add Audit Log entry
      const auditItem: TaskHistoryItem = {
        id: `HIST-${Date.now()}`,
        timestamp: getCurrentDateTimeString(),
        taskId,
        action: 'แก้ไขงาน',
        previousStatus: tasks.find((t) => t.id === taskId)?.status || '-',
        newStatus: tasks.find((t) => t.id === taskId)?.status || '-',
        operator: uploaderName,
        details: `แนบเอกสารประกอบงาน "${file.name}" (${newDoc.fileSize})`
      };
      const nextHistory = [auditItem, ...history];
      setHistory(nextHistory);
      saveHistory(nextHistory);

      if (sheetsStatus === 'connected' && spreadsheetId && token) {
        try {
          await appendHistoryToSheet(spreadsheetId, auditItem, token);
        } catch (e) {
          console.error('History sync error:', e);
        }
      }

      addToast('success', 'อัปโหลดเอกสารเรียบร้อยแล้ว', `บันทึกไฟล์ "${file.name}" ผูกกับงาน ${taskId} แล้ว`);
    } catch (error: any) {
      console.error('Upload document error:', error);
      addToast('error', 'อัปโหลดเอกสารไม่สำเร็จ', error.message || 'เกิดข้อผิดพลาดในการอัปโหลด');
      throw error;
    }
  };

  // Google Drive & Local Document Delete Handler
  const handleDeleteDocument = async (doc: TaskDocument) => {
    try {
      const token = await getAccessToken();

      // If it has a real Google Drive file ID (not local-/demo-), delete from Drive
      if (token && doc.driveFileId && !doc.driveFileId.startsWith('local-') && !doc.driveFileId.startsWith('demo-')) {
        try {
          await deleteFileFromDrive(doc.driveFileId, token);
        } catch (err: any) {
          console.error('Failed to delete file from Google Drive:', err);
        }
      }

      // If connected to Google Sheets, delete from Documents sheet
      if (sheetsStatus === 'connected' && spreadsheetId && token) {
        try {
          await deleteDocumentFromSheet(spreadsheetId, doc.id, token);
        } catch (err: any) {
          console.error('Failed to delete document row from Sheets:', err);
        }
      }

      // Remove from state & localStorage
      const nextDocs = documents.filter((d) => d.id !== doc.id);
      setDocuments(nextDocs);
      saveDocuments(nextDocs);

      // Add audit entry
      const auditItem: TaskHistoryItem = {
        id: `HIST-${Date.now()}`,
        timestamp: getCurrentDateTimeString(),
        taskId: doc.taskId,
        action: 'แก้ไขงาน',
        previousStatus: tasks.find((t) => t.id === doc.taskId)?.status || '-',
        newStatus: tasks.find((t) => t.id === doc.taskId)?.status || '-',
        operator: userRole === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'เจ้าหน้าที่ (Staff)',
        details: `ลบเอกสารประกอบงาน "${doc.fileName}" รหัส ${doc.id}`
      };
      const nextHistory = [auditItem, ...history];
      setHistory(nextHistory);
      saveHistory(nextHistory);

      if (sheetsStatus === 'connected' && spreadsheetId && token) {
        try {
          await appendHistoryToSheet(spreadsheetId, auditItem, token);
        } catch (e) {
          console.error('History sync error:', e);
        }
      }

      addToast('success', 'ลบเอกสารเรียบร้อยแล้ว', `ลบไฟล์ "${doc.fileName}" ออกจากระบบแล้ว`);
    } catch (error: any) {
      console.error('Delete document error:', error);
      addToast('error', 'ลบเอกสารไม่สำเร็จ', error.message || 'เกิดข้อผิดพลาดในการลบไฟล์');
      throw error;
    }
  };

  // Restore Backup Data Handler
  const handleRestoreData = (backup: SOTSBackupData) => {
    if (backup.tasks && Array.isArray(backup.tasks)) {
      setTasks(backup.tasks);
      saveTasks(backup.tasks);
    }
    if (backup.history && Array.isArray(backup.history)) {
      setHistory(backup.history);
      saveHistory(backup.history);
    }
    if (backup.documents && Array.isArray(backup.documents)) {
      setDocuments(backup.documents);
      saveDocuments(backup.documents);
    }
    if (backup.evaluations && Array.isArray(backup.evaluations)) {
      setEvaluations(backup.evaluations);
      saveEvaluations(backup.evaluations);
    }
    addToast(
      'success',
      'กู้คืนข้อมูลสำเร็จ',
      `นำเข้าข้อมูลงาน ${backup.tasks?.length || 0} รายการ และประวัติ ${backup.history?.length || 0} รายการเรียบร้อย`
    );
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Open View Modal
  const handleViewTask = (task: Task) => {
    setViewingTask(task);
  };

  // Print Handlers
  const handleOpenPrintAll = () => {
    setSinglePrintTask(null);
    setIsPrintModalOpen(true);
  };

  const handlePrintSingleTask = (task: Task) => {
    setSinglePrintTask(task);
    setIsPrintModalOpen(true);
  };

  // Submit Evaluation
  const handleSubmitEvaluation = (item: EvaluationItem) => {
    const updated = [item, ...evaluations];
    setEvaluations(updated);
    saveEvaluations(updated);
    addToast('success', 'บันทึกการประเมินผลเรียบร้อยแล้ว', 'ขอบคุณสำหรับข้อเสนอแนะในการปรับปรุงระบบ');
  };

  const handleResetEvaluations = () => {
    const fresh = resetEvaluationsToDemo();
    setEvaluations(fresh);
    addToast('info', 'รีเซ็ตแบบประเมินตัวอย่างแล้ว', 'คืนค่าแบบประเมินเริ่มต้น 3 รายการเรียบร้อย');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-['Sarabun',sans-serif]">
      {/* Toast System */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        message={confirmModalState.message}
        confirmText={confirmModalState.confirmText}
        cancelText={confirmModalState.cancelText}
        isDestructive={confirmModalState.isDestructive}
        onConfirm={confirmModalState.onConfirm}
        onCancel={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Task Create / Edit Modal */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialTask={editingTask}
        existingIds={tasks.map((t) => t.id)}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={viewingTask}
        isOpen={Boolean(viewingTask)}
        onClose={() => setViewingTask(null)}
        onEdit={(task) => {
          setViewingTask(null);
          handleOpenEdit(task);
        }}
        onQuickStatusChange={handleQuickStatusChange}
        userRole={userRole}
        onPrintTask={handlePrintSingleTask}
        taskHistory={history}
        documents={documents}
        onUploadDocument={handleUploadDocument}
        onDeleteDocument={handleDeleteDocument}
        driveStatus={driveStatus}
        driveErrorMessage={driveErrorMessage}
      />

      {/* Deadline Alert Modal */}
      <DeadlineAlertModal
        isOpen={isDeadlineAlertModalOpen}
        onClose={() => setIsDeadlineAlertModalOpen(false)}
        tasks={tasks}
        onViewTask={(task) => {
          setIsDeadlineAlertModalOpen(false);
          handleViewTask(task);
        }}
        onNavigateToFilteredTasks={(filterType) => {
          setIsDeadlineAlertModalOpen(false);
          setFilterPreset({ urgency: filterType });
          setActiveTab('tasks');
        }}
      />

      {/* Print Report Modal */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setSinglePrintTask(null);
        }}
        tasks={tasks}
        singleTask={singlePrintTask}
      />

      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'tasks') {
            setFilterPreset({});
          }
          setActiveTab(tab);
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        userRole={userRole}
        onResetDemo={handleResetDemoPrompt}
        taskCount={tasks.length}
        historyCount={history.length}
      />

      {/* Main Content Area (Offset by sidebar width on desktop) */}
      <div className="lg:pl-72 flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCreate={handleOpenCreate}
          userRole={userRole}
          onChangeRole={handleChangeRole}
          sheetsStatus={sheetsStatus}
          onConnectSheets={handleConnectSheets}
          onDisconnectSheets={handleDisconnectSheets}
          onSyncSheets={handleSyncSheets}
        />

        {/* Academic Prototype Banner Notification */}
        <div className="bg-blue-900 text-white px-4 sm:px-8 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-blue-950">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-300 shrink-0" />
            <span>
              <strong>ต้นแบบโครงงานพัฒนางาน CWIE</strong> ที่ทำการปกครองจังหวัดสงขลา – กลุ่มงานความมั่นคง
              (มหาวิทยาลัยทักษิณ)
            </span>
          </div>
          <span className="text-[11px] text-blue-200">
            {sheetsStatus === 'connected' ? (
              <span className="text-emerald-300 font-semibold">
                ● กำลังเชื่อมต่อกับ Google Sheets (SOTS_Database / Tasks)
              </span>
            ) : (
              <span>ฐานข้อมูลจำลอง (LocalStorage) · พร้อมเชื่อมต่อ Google Sheets และ Drive</span>
            )}
          </span>
        </div>

        {/* Dynamic Page Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              tasks={tasks}
              onOpenCreate={handleOpenCreate}
              onViewTask={handleViewTask}
              onEditTask={handleOpenEdit}
              onDeleteTask={handleDeleteTaskPrompt}
              onNavigateToTasks={() => {
                setFilterPreset({});
                setActiveTab('tasks');
              }}
              onNavigateToTasksWithFilter={(f) => {
                setFilterPreset(f);
                setActiveTab('tasks');
              }}
              onOpenDeadlineAlerts={() => setIsDeadlineAlertModalOpen(true)}
              userRole={userRole}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskList
              tasks={tasks}
              onOpenCreate={handleOpenCreate}
              onViewTask={handleViewTask}
              onEditTask={handleOpenEdit}
              onDeleteTask={handleDeleteTaskPrompt}
              onOpenPrint={handleOpenPrintAll}
              onResetDemo={handleResetDemoPrompt}
              userRole={userRole}
              sheetsStatus={sheetsStatus}
              googleUser={googleUser}
              spreadsheetId={spreadsheetId}
              sheetLink={sheetLink}
              sheetsErrorMessage={sheetsErrorMessage}
              onConnectSheets={handleConnectSheets}
              onDisconnectSheets={handleDisconnectSheets}
              onSyncSheets={handleSyncSheets}
              initialUrgency={filterPreset.urgency || 'all'}
              initialStatus={filterPreset.status || 'all'}
            />
          )}

          {activeTab === 'history' && (
            <TaskHistoryView
              history={history}
              tasks={tasks}
              onViewTask={handleViewTask}
              userRole={userRole}
              sheetsStatus={sheetsStatus}
              sheetLink={sheetLink}
              onSyncSheets={handleSyncSheets}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              tasks={tasks}
              onViewTask={handleViewTask}
              onPrintReportModal={handleOpenPrintAll}
            />
          )}

          {activeTab === 'statistics' && <StatisticsView tasks={tasks} />}

          {activeTab === 'backup' && (
            <BackupRestoreView
              tasks={tasks}
              history={history}
              documents={documents}
              evaluations={evaluations}
              onRestoreData={handleRestoreData}
              onResetDemo={handleResetDemoPrompt}
              userRole={userRole}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'evaluation' && (
            <EvaluationView
              evaluations={evaluations}
              onSubmitEvaluation={handleSubmitEvaluation}
              onResetEvaluations={handleResetEvaluations}
            />
          )}

          {activeTab === 'guide' && <UserGuide />}

          {activeTab === 'compliance' && <ComplianceView />}
        </main>

        {/* Footer (Requirement #23: Every page must display this footer) */}
        <footer className="bg-white border-t border-slate-200 py-6 px-4 sm:px-8 text-center text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto space-y-1.5">
            <p className="font-semibold text-slate-700">
              SOTS Prototype | CWIE Project | Educational Prototype
            </p>
            <p className="text-[11px] text-slate-400">
              ระบบต้นแบบเพื่อการศึกษา ไม่ใช่ระบบราชการอย่างเป็นทางการ
            </p>
            <p className="text-[10px] text-slate-400">
              โครงงานพัฒนางานสหกิจศึกษาและการศึกษาเชิงบูรณาการกับการทำงาน (CWIE) มหาวิทยาลัยทักษิณ ร่วมกับ ที่ทำการปกครองจังหวัดสงขลา กลุ่มงานความมั่นคง
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
