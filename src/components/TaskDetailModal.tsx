import React, { useState } from 'react';
import { Task, UserRole, TaskStatus, TaskHistoryItem, TaskDocument } from '../types';
import {
  X,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Printer,
  Building2,
  FileSpreadsheet,
  History,
  ArrowRight,
  Send
} from 'lucide-react';
import {
  formatThaiDateFull,
  formatThaiDateTime,
  calculateDeadlineStatus,
  getDeadlineBadgeStyle,
  getStatusBadgeStyle
} from '../utils/dateUtils';
import { TaskDocumentsSection, DriveConnectionState } from './TaskDocumentsSection';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onQuickStatusChange: (
    taskId: string,
    newStatus: TaskStatus,
    comment?: string,
    operator?: string
  ) => void;
  userRole: UserRole;
  onPrintTask: (task: Task) => void;
  taskHistory?: TaskHistoryItem[];
  documents?: TaskDocument[];
  onUploadDocument?: (taskId: string, file: File, uploaderName: string) => Promise<void>;
  onDeleteDocument?: (doc: TaskDocument) => Promise<void>;
  driveStatus?: DriveConnectionState;
  driveErrorMessage?: string;
}

const WORKFLOW_STEPS = [
  { step: 1, title: 'รับเรื่อง', status: 'รับเรื่อง' as TaskStatus, desc: 'เจ้าหน้าที่รับเรื่องเข้าสู่กลุ่มงานความมั่นคง' },
  { step: 2, title: 'มอบหมาย', status: 'มอบหมาย' as TaskStatus, desc: 'มอบหมายเจ้าหน้าที่รับผิดชอบงาน' },
  { step: 3, title: 'อยู่ระหว่างดำเนินการ', status: 'อยู่ระหว่างดำเนินการ' as TaskStatus, desc: 'ดำเนินการตามภารกิจและประสานงาน' },
  { step: 4, title: 'รอติดตาม', status: 'รอติดตาม' as TaskStatus, desc: 'รอรายงานผลหรือติดตามความคืบหน้า' },
  { step: 5, title: 'เสร็จสิ้น', status: 'เสร็จสิ้น' as TaskStatus, desc: 'ภารกิจแล้วเสร็จ บันทึกผลและปิดงาน' }
];

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onQuickStatusChange,
  userRole,
  onPrintTask,
  taskHistory = [],
  documents = [],
  onUploadDocument,
  onDeleteDocument,
  driveStatus = 'disconnected',
  driveErrorMessage
}) => {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [selectedNewStatus, setSelectedNewStatus] = useState<TaskStatus>('อยู่ระหว่างดำเนินการ');
  const [statusComment, setStatusComment] = useState('');
  const [operatorName, setOperatorName] = useState('');

  if (!isOpen || !task) return null;

  const deadlineStatus = calculateDeadlineStatus(task.deadline, task.status);
  const deadlineBadge = getDeadlineBadgeStyle(deadlineStatus);
  const statusBadge = getStatusBadgeStyle(task.status);
  const canEdit = userRole === 'admin' || userRole === 'staff';

  const defaultOperator =
    userRole === 'admin'
      ? 'ผู้ดูแลระบบ (Admin)'
      : userRole === 'staff'
      ? task.assignee || 'เจ้าหน้าที่ผู้รับผิดชอบ'
      : 'ผู้บันทึก';

  // Specific history for this task
  const thisTaskHistory = taskHistory.filter((h) => h.taskId === task.id);

  const handleOpenStatusChangeForm = (newSt: TaskStatus) => {
    setSelectedNewStatus(newSt);
    setStatusComment('');
    setOperatorName(defaultOperator);
    setIsChangingStatus(true);
  };

  const handleConfirmStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    onQuickStatusChange(
      task.id,
      selectedNewStatus,
      statusComment.trim() || undefined,
      operatorName.trim() || defaultOperator
    );
    setIsChangingStatus(false);
    setStatusComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-1 rounded text-sm font-bold">
              {task.id}
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold">รายละเอียดงานและการติดตาม</h2>
              <p className="text-xs text-slate-300">
                กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา (ต้นแบบ CWIE)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintTask(task)}
              className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="พิมพ์เอกสารสรุปงาน"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Status & Deadline Alert Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <span className="text-xs text-slate-500 block mb-0.5">สถานะงานปัจจุบัน</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text} border ${statusBadge.border}`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
                  {task.status}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-xs text-slate-500 block mb-0.5">สถานะกำหนดติดตาม</span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${deadlineBadge.bg}`}
                >
                  {deadlineStatus === 'เกินกำหนด' && <AlertTriangle className="w-3.5 h-3.5" />}
                  {deadlineStatus === 'เสร็จสิ้นแล้ว' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {deadlineBadge.label}
                </span>
              </div>
              <div className="h-8 w-px bg-slate-200 hidden sm:block" />
              <div>
                <span className="text-xs text-slate-500 block mb-0.5">ระดับความสำคัญ</span>
                <span className="text-xs font-medium text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                  {task.priority || 'ปกติ'}
                </span>
              </div>
            </div>

            {/* Quick Status Change Action */}
            {canEdit && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">ปรับเปลี่ยนสถานะ:</span>
                <select
                  value={task.status}
                  onChange={(e) => handleOpenStatusChangeForm(e.target.value as TaskStatus)}
                  className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-900 cursor-pointer"
                >
                  <option value="รับเรื่อง">รับเรื่อง</option>
                  <option value="มอบหมาย">มอบหมาย</option>
                  <option value="อยู่ระหว่างดำเนินการ">อยู่ระหว่างดำเนินการ</option>
                  <option value="รอติดตาม">รอติดตาม</option>
                  <option value="เสร็จสิ้น">เสร็จสิ้น</option>
                  <option value="พัก/รอข้อมูล">พัก/รอข้อมูล</option>
                </select>
              </div>
            )}
          </div>

          {/* Workflow Interactive Bar (5 ขั้นตอนหลัก: รับเรื่อง → มอบหมาย → อยู่ระหว่างดำเนินการ → รอติดตาม → เสร็จสิ้น) */}
          <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-900" />
                Workflow การดำเนินงาน (รับเรื่อง → มอบหมาย → อยู่ระหว่างดำเนินการ → รอติดตาม → เสร็จสิ้น)
              </h3>
              {canEdit && (
                <span className="text-[11px] text-slate-400">
                  คลิกที่แต่ละขั้นตอนเพื่อปรับสถานะงานได้ทันที
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {WORKFLOW_STEPS.map((stepItem) => {
                const isCurrent =
                  task.status === stepItem.status ||
                  (task.workflowStep === stepItem.step &&
                    task.status !== 'เสร็จสิ้น' &&
                    task.status !== 'รับเรื่อง');

                const isPast =
                  task.status === 'เสร็จสิ้น'
                    ? true
                    : task.workflowStep > stepItem.step;

                return (
                  <button
                    key={stepItem.step}
                    type="button"
                    disabled={!canEdit}
                    onClick={() => handleOpenStatusChangeForm(stepItem.status)}
                    className={`text-left relative p-3 rounded-lg border transition-all ${
                      isCurrent
                        ? 'border-blue-900 bg-blue-50/80 ring-2 ring-blue-900/20 shadow-xs'
                        : isPast
                        ? 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-blue-300'
                        : 'border-dashed border-slate-200 bg-white text-slate-400 hover:border-slate-400'
                    } ${canEdit ? 'cursor-pointer hover:shadow-xs' : 'cursor-default'}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCurrent
                            ? 'bg-blue-900 text-white'
                            : isPast
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isPast && stepItem.step < task.workflowStep ? '✓' : stepItem.step}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-blue-900 bg-blue-100 px-1.5 py-0.5 rounded">
                          สถานะปัจจุบัน
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold text-slate-800 leading-snug">
                      {stepItem.title}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-tight hidden sm:block">
                      {stepItem.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* In-modal Status Change Form with Note & Operator */}
            {isChangingStatus && canEdit && (
              <form
                onSubmit={handleConfirmStatusChange}
                className="mt-4 p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3 animate-in fade-in duration-150"
              >
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                    <History className="w-4 h-4 text-blue-800" />
                    <span>บันทึกการเปลี่ยนสถานะเป็น:</span>
                    <span className="bg-blue-900 text-white px-2 py-0.5 rounded text-xs">
                      {selectedNewStatus}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsChangingStatus(false)}
                    className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      ผู้ดำเนินการ / ผู้บันทึก:
                    </label>
                    <input
                      type="text"
                      value={operatorName}
                      onChange={(e) => setOperatorName(e.target.value)}
                      placeholder="เช่น นายสมชาย เจ้าหน้าที่ ก. หรือ ผู้ดูแลระบบ"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-900"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      รายละเอียด / หมายเหตุการเปลี่ยนสถานะ:
                    </label>
                    <input
                      type="text"
                      value={statusComment}
                      onChange={(e) => setStatusComment(e.target.value)}
                      placeholder="เช่น มอบหมายงานแล้ว, ดำเนินการเสร็จสิ้นตามระเบียบ"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsChangingStatus(false)}
                    className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ยืนยันบันทึกประวัติ</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* 3 Structured Information Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Section 1: ข้อมูลพื้นฐาน */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-slate-900">
                <Building2 className="w-4 h-4 text-blue-900" />
                ข้อมูลพื้นฐาน
              </div>

              <div>
                <span className="text-xs text-slate-400 block">รหัสงาน</span>
                <span className="text-sm font-mono font-semibold text-slate-800">{task.id}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">วันที่รับเรื่อง</span>
                <span className="text-sm font-medium text-slate-800">
                  {formatThaiDateFull(task.receivedDate)}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">ประเภทงาน</span>
                <span className="text-sm font-medium text-slate-800">{task.category}</span>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">หน่วยงาน/ผู้รับผิดชอบ</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <User className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-sm font-medium text-slate-800">{task.assignee}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 block">สังกัด</span>
                <span className="text-xs text-slate-600">{task.department}</span>
              </div>
            </div>

            {/* Section 2: การติดตาม */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 shadow-2xs">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-slate-900">
                <Clock className="w-4 h-4 text-blue-900" />
                การติดตามและกำหนดเวลา
              </div>

              <div>
                <span className="text-xs text-slate-400 block">วันที่กำหนดติดตาม (แล้วเสร็จ)</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold text-slate-900">
                    {formatThaiDateFull(task.deadline)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-xs text-slate-400 block">วันที่ติดตามล่าสุด</span>
                  <span className="text-xs font-medium text-slate-700">
                    {formatThaiDateFull(task.lastTrackedDate)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">วันที่ติดตามครั้งถัดไป</span>
                  <span className="text-xs font-medium text-blue-900 font-semibold">
                    {formatThaiDateFull(task.nextTrackingDate)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400 block mb-1">การประเมินกำหนดการ</span>
                <div className={`p-2.5 rounded-lg border text-xs leading-relaxed ${deadlineBadge.bg}`}>
                  {deadlineStatus === 'เกินกำหนด' && (
                    <span>
                      ⚠️ <strong>งานนี้เกินกำหนดส่ง/ติดตามแล้ว</strong> กรุณาเร่งรัดผู้รับผิดชอบหรือประสานงานหน่วยงานที่เกี่ยวข้อง
                    </span>
                  )}
                  {deadlineStatus === 'ใกล้ถึงกำหนด' && (
                    <span>
                      ⏳ <strong>ใกล้ถึงกำหนดติดตาม (ภายใน 3 วัน)</strong> โปรดตรวจสอบความพร้อมของเอกสาร/ผลการประสาน
                    </span>
                  )}
                  {deadlineStatus === 'ตามกำหนด' && (
                    <span>
                      ✓ <strong>อยู่ตามแผนกำหนดการ</strong> สามารถติดตามงานตามรอบปกติได้
                    </span>
                  )}
                  {deadlineStatus === 'เสร็จสิ้นแล้ว' && (
                    <span>
                      ✓ <strong>ดำเนินการแล้วเสร็จตามกระบวนการ</strong> ปิดงานและจัดเก็บในสารบรรณเรียบร้อย
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: ผลการดำเนินงาน & สรุป */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-sm font-bold text-slate-900">
              <FileSpreadsheet className="w-4 h-4 text-blue-900" />
              ผลการดำเนินงานและรายละเอียด
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1">
                สรุปการดำเนินงาน / หัวข้องาน
              </span>
              <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-800 leading-relaxed border border-slate-100">
                {task.summary || '-'}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-700 block mb-1">
                หมายเหตุ / บันทึกการประสานงาน
              </span>
              <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 leading-relaxed border border-slate-100">
                {task.notes || 'ไม่มีบันทึกเพิ่มเติม'}
              </div>
            </div>
          </div>

          {/* Section: เอกสารประกอบงาน (Google Drive Documents) */}
          <TaskDocumentsSection
            taskId={task.id}
            documents={documents}
            onUpload={async (file, uploader) => {
              if (onUploadDocument) {
                await onUploadDocument(task.id, file, uploader);
              }
            }}
            onDelete={async (doc) => {
              if (onDeleteDocument) {
                await onDeleteDocument(doc);
              }
            }}
            driveStatus={driveStatus}
            driveErrorMessage={driveErrorMessage}
            userRole={userRole}
            defaultUploader={defaultOperator}
          />

          {/* Section 4: ประวัติการดำเนินงานเฉพาะรายการนี้ (Timeline) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <History className="w-4 h-4 text-blue-900" />
                ประวัติและบันทึก Timeline การดำเนินงาน ({thisTaskHistory.length} รายการ)
              </div>
              <span className="text-[11px] text-slate-400">
                บันทึกลงใน Google Sheets (Sheet "Task_History") อัตโนมัติ
              </span>
            </div>

            {thisTaskHistory.length === 0 ? (
              <div className="text-center py-6 text-slate-400 bg-slate-50 rounded-lg border border-slate-100">
                <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">ยังไม่มีบันทึกประวัติสำหรับงานรหัส {task.id}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  เมื่อมีการปรับเปลี่ยนสถานะ ระบบจะบันทึกประวัติ วันเวลา และผู้ดำเนินการให้โดยอัตโนมัติ
                </p>
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-3 pl-5 space-y-4 my-2">
                {thisTaskHistory.map((item, idx) => {
                  const prevStyle = getStatusBadgeStyle(item.previousStatus);
                  const newStyle = getStatusBadgeStyle(item.newStatus);

                  return (
                    <div key={item.id || idx} className="relative">
                      <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-blue-900 border-2 border-white shadow-xs" />
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500">
                          <span className="font-mono text-slate-700 font-medium">
                            {formatThaiDateTime(item.timestamp)}
                          </span>
                          <span className="text-slate-500">
                            ผู้ดำเนินการ: <strong className="text-slate-700">{item.operator}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap text-xs">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] ${prevStyle.bg} ${prevStyle.text} border ${prevStyle.border}`}>
                            {item.previousStatus}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${newStyle.bg} ${newStyle.text} border ${newStyle.border}`}>
                            {item.newStatus}
                          </span>
                        </div>

                        {item.details && (
                          <div className="text-slate-600 bg-white p-2 rounded border border-slate-200/60 text-[11px]">
                            {item.details}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Educational Disclaimer Banner */}
          <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center">
            * ข้อมูลในหน้านี้เป็นข้อมูลจำลองเพื่อการศึกษาโครงงาน CWIE มหาวิทยาลัยทักษิณ
            มิใช่ข้อมูลราชการจริงหรือข้อมูลลับด้านความมั่นคง
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
          <div className="text-xs text-slate-500">
            ปรับปรุงล่าสุดเมื่อ: {new Date(task.updatedAt || Date.now()).toLocaleDateString('th-TH')}
          </div>
          <div className="flex items-center gap-3">
            {canEdit && (
              <button
                type="button"
                onClick={() => onEdit(task)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                <Edit className="w-4 h-4 text-slate-600" />
                แก้ไขข้อมูล
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
