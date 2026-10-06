export type TaskStatus =
  | 'รับเรื่อง'
  | 'มอบหมาย'
  | 'อยู่ระหว่างดำเนินการ'
  | 'รอติดตาม'
  | 'เสร็จสิ้น'
  | 'รอดำเนินการ'
  | 'พัก/รอข้อมูล';

export type TaskCategory =
  | 'งานประสานงาน'
  | 'งานเอกสาร'
  | 'งานติดตามเรื่อง'
  | 'งานสนับสนุนการปฏิบัติงาน'
  | 'งานประชุม/ประสานหน่วยงาน'
  | 'งานอื่น ๆ';

export type TaskPriority = 'ปกติ' | 'สำคัญ' | 'เร่งด่วน';

export type DeadlineStatus = 'ตามกำหนด' | 'ใกล้ถึงกำหนด' | 'เกินกำหนด' | 'เสร็จสิ้นแล้ว';

export interface Task {
  id: string; // e.g. SEC-001
  receivedDate: string; // YYYY-MM-DD
  category: TaskCategory;
  assignee: string; // e.g. นายสมชาย เจ้าหน้าที่ ก.
  department: string; // e.g. ฝ่ายประสานงานมวลชน กลุ่มงานความมั่นคง
  deadline: string; // YYYY-MM-DD
  status: TaskStatus;
  lastTrackedDate: string; // YYYY-MM-DD
  nextTrackingDate: string; // YYYY-MM-DD
  summary: string; // สรุปการดำเนินงาน / หัวข้องาน
  notes: string; // หมายเหตุ
  workflowStep: 1 | 2 | 3 | 4 | 5; // 1:รับเรื่อง 2:มอบหมาย 3:อยู่ระหว่างดำเนินการ 4:รอติดตาม 5:เสร็จสิ้น
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

export type AuditActionType =
  | 'เพิ่มงาน'
  | 'แก้ไขงาน'
  | 'ลบงาน'
  | 'เปลี่ยนสถานะ'
  | 'เปลี่ยนกำหนดติดตาม'
  | 'เปลี่ยนผู้รับผิดชอบ';

export interface TaskHistoryItem {
  id: string;
  timestamp: string; // e.g. "2026-10-05 09:30:15"
  taskId: string;
  action?: AuditActionType;
  previousValue?: string;
  newValue?: string;
  previousStatus: string;
  newStatus: string;
  operator: string;
  details: string;
}

export type AuditLogItem = TaskHistoryItem;

export interface TaskDocument {
  id: string; // Document ID (e.g. DOC-001)
  taskId: string; // Task ID (e.g. SEC-001)
  fileName: string; // File Name
  fileType: string; // File Type (e.g. PDF, DOCX, JPG)
  fileSize: string; // File Size (e.g. "245 KB")
  driveFileId: string; // Google Drive File ID
  driveUrl: string; // Drive URL
  uploadedDate: string; // Uploaded Date (YYYY-MM-DD or formatted)
  uploadedBy: string; // Uploaded By
}

export type UserRole = 'admin' | 'staff' | 'viewer';

export interface RoleInfo {
  id: UserRole;
  title: string;
  description: string;
  badgeColor: string;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canReset: boolean;
}

export interface EvaluationItem {
  id: string;
  evaluatorName: string;
  role: string;
  date: string;
  ratings: {
    easeOfUse: number; // ความง่ายต่อการใช้งาน
    clarity: number; // ความชัดเจนของข้อมูล
    convenience: number; // ความสะดวกในการติดตามงาน
    layoutSuitability: number; // ความเหมาะสมของรูปแบบระบบ
    operationalBenefit: number; // ประโยชน์ต่อการปฏิบัติงาน
  };
  comments: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'tasks'
  | 'history'
  | 'reports'
  | 'statistics'
  | 'backup'
  | 'evaluation'
  | 'guide'
  | 'compliance';

export interface SOTSBackupData {
  version: string;
  systemName: string;
  exportedAt: string;
  note: string;
  tasks: Task[];
  history: TaskHistoryItem[];
  documents: TaskDocument[];
  evaluations: EvaluationItem[];
}
