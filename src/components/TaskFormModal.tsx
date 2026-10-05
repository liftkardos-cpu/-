import React, { useState, useEffect } from 'react';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '../types';
import { X, Save, AlertCircle, Calendar, Hash, User, Briefcase, FileText } from 'lucide-react';
import { getTodayDateString } from '../utils/dateUtils';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'createdAt' | 'updatedAt'>) => void;
  initialTask?: Task | null;
  existingIds: string[];
}

const CATEGORIES: TaskCategory[] = [
  'งานประสานงาน',
  'งานเอกสาร',
  'งานติดตามเรื่อง',
  'งานสนับสนุนการปฏิบัติงาน',
  'งานประชุม/ประสานหน่วยงาน',
  'งานอื่น ๆ'
];

const STATUSES: TaskStatus[] = [
  'รอดำเนินการ',
  'อยู่ระหว่างดำเนินการ',
  'รอติดตาม',
  'เสร็จสิ้น',
  'พัก/รอข้อมูล'
];

const PRIORITIES: TaskPriority[] = ['ปกติ', 'สำคัญ', 'เร่งด่วน'];

const DEFAULT_ASSIGNEES = [
  'นายสมชาย เจ้าหน้าที่ ก. (ฝ่ายประสานมวลชน)',
  'นางสาวสุดา เจ้าหน้าที่ ข. (งานสารบรรณและความมั่นคง)',
  'นายกิตติ เจ้าหน้าที่ ค. (งานนโยบายและแผน)',
  'นายวิชาญ เจ้าหน้าที่ ง. (ฝ่ายติดตามประเมินผล)',
  'ฝ่ายความมั่นคง อ.เมืองสงขลา (ประสานงานร่วม)'
];

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  existingIds
}) => {
  const isEditing = Boolean(initialTask);
  const today = getTodayDateString();

  const [id, setId] = useState('');
  const [receivedDate, setReceivedDate] = useState(today);
  const [category, setCategory] = useState<TaskCategory>('งานประสานงาน');
  const [assignee, setAssignee] = useState('');
  const [department, setDepartment] = useState('กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState<TaskStatus>('รอดำเนินการ');
  const [lastTrackedDate, setLastTrackedDate] = useState(today);
  const [nextTrackingDate, setNextTrackingDate] = useState('');
  const [summary, setSummary] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('ปกติ');
  const [workflowStep, setWorkflowStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate next ID when creating new
  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (initialTask) {
        setId(initialTask.id);
        setReceivedDate(initialTask.receivedDate || today);
        setCategory(initialTask.category);
        setAssignee(initialTask.assignee || '');
        setDepartment(initialTask.department || 'กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา');
        setDeadline(initialTask.deadline || '');
        setStatus(initialTask.status);
        setLastTrackedDate(initialTask.lastTrackedDate || today);
        setNextTrackingDate(initialTask.nextTrackingDate || '');
        setSummary(initialTask.summary || '');
        setNotes(initialTask.notes || '');
        setPriority(initialTask.priority || 'ปกติ');
        setWorkflowStep(initialTask.workflowStep || 1);
      } else {
        // Find next SEC-XXX
        let maxNum = 0;
        existingIds.forEach((currId) => {
          const match = currId.match(/SEC-(\d+)/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        });
        const nextId = `SEC-${String(maxNum + 1).padStart(3, '0')}`;
        setId(nextId);
        setReceivedDate(today);
        setCategory('งานประสานงาน');
        setAssignee(DEFAULT_ASSIGNEES[0]);
        setDepartment('กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา');
        // Default deadline: 7 days ahead
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 7);
        const y = futureDate.getFullYear();
        const m = String(futureDate.getMonth() + 1).padStart(2, '0');
        const d = String(futureDate.getDate()).padStart(2, '0');
        setDeadline(`${y}-${m}-${d}`);
        setStatus('รอดำเนินการ');
        setLastTrackedDate(today);
        // Default next tracking: 3 days ahead
        const trackDate = new Date();
        trackDate.setDate(trackDate.getDate() + 3);
        const ty = trackDate.getFullYear();
        const tm = String(trackDate.getMonth() + 1).padStart(2, '0');
        const td = String(trackDate.getDate()).padStart(2, '0');
        setNextTrackingDate(`${ty}-${tm}-${td}`);
        setSummary('');
        setNotes('');
        setPriority('ปกติ');
        setWorkflowStep(1);
      }
    }
  }, [isOpen, initialTask, existingIds, today]);

  // Adjust workflowStep based on status if user changes status
  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus);
    if (newStatus === 'รอดำเนินการ') setWorkflowStep(1);
    else if (newStatus === 'อยู่ระหว่างดำเนินการ') setWorkflowStep(3);
    else if (newStatus === 'รอติดตาม') setWorkflowStep(4);
    else if (newStatus === 'เสร็จสิ้น') setWorkflowStep(5);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const normalizedId = id.trim().toUpperCase();

    if (!normalizedId) {
      newErrors.id = 'กรุณาระบุรหัสงาน';
    } else if (!isEditing && existingIds.some((exist) => exist.toUpperCase() === normalizedId)) {
      newErrors.id = 'รหัสงานนี้มีอยู่ในระบบแล้ว';
    }

    if (!receivedDate) {
      newErrors.receivedDate = 'กรุณาระบุวันที่รับเรื่อง';
    }

    if (!assignee.trim()) {
      newErrors.assignee = 'กรุณาระบุหน่วยงานหรือผู้รับผิดชอบ';
    }

    if (!deadline) {
      newErrors.deadline = 'กรุณาระบุวันที่กำหนดติดตาม';
    } else if (receivedDate && deadline < receivedDate) {
      newErrors.deadline = 'วันที่กำหนดติดตามต้องไม่ก่อนวันที่รับเรื่อง';
    }

    if (!summary.trim()) {
      newErrors.summary = 'กรุณาระบุสรุปการดำเนินงาน / หัวข้องาน';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: id.trim().toUpperCase(),
      receivedDate,
      category,
      assignee: assignee.trim(),
      department: department.trim(),
      deadline,
      status,
      lastTrackedDate: lastTrackedDate || today,
      nextTrackingDate: nextTrackingDate || deadline,
      summary: summary.trim(),
      notes: notes.trim(),
      workflowStep,
      priority
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-lg border border-blue-400/20 text-blue-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {isEditing ? 'แก้ไขข้อมูลงานด้านความมั่นคง' : '+ เพิ่มงานใหม่ในระบบ'}
              </h2>
              <p className="text-xs text-slate-300">
                กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา (ข้อมูลจำลอง)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Security Notice Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <span>
              <strong>ข้อควรระวัง:</strong> ระบบนี้เป็นต้นแบบ CWIE เพื่อการศึกษา
              ห้ามบันทึกข้อมูลลับทางราชการ ข้อมูลคดี ข้อมูลผู้ต้องสงสัย หรือข้อมูลส่วนบุคคลจริง
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. รหัสงาน */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                1. รหัสงาน <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="เช่น SEC-001"
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border font-mono ${
                    errors.id
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-blue-900 focus:ring-blue-100'
                  } focus:outline-none focus:ring-2`}
                  disabled={isEditing}
                />
              </div>
              {errors.id && <p className="text-xs text-rose-500 mt-1">{errors.id}</p>}
            </div>

            {/* 2. วันที่รับเรื่อง */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                2. วันที่รับเรื่อง <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  value={receivedDate}
                  onChange={(e) => setReceivedDate(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                    errors.receivedDate
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-blue-900 focus:ring-blue-100'
                  } focus:outline-none focus:ring-2`}
                />
              </div>
              {errors.receivedDate && (
                <p className="text-xs text-rose-500 mt-1">{errors.receivedDate}</p>
              )}
            </div>

            {/* 3. ประเภทงาน */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                3. ประเภทงาน (งานธุรการ/สนับสนุนทั่วไป) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TaskCategory)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-900 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. หน่วยงาน/ผู้รับผิดชอบ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                4. หน่วยงาน/ผู้รับผิดชอบ (ชื่อสมมติ) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  list="assignees-list"
                  placeholder="เช่น นายสมชาย เจ้าหน้าที่ ก."
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                    errors.assignee
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-blue-900 focus:ring-blue-100'
                  } focus:outline-none focus:ring-2`}
                />
                <datalist id="assignees-list">
                  {DEFAULT_ASSIGNEES.map((item) => (
                    <option key={item} value={item} />
                  ))}
                </datalist>
              </div>
              {errors.assignee && <p className="text-xs text-rose-500 mt-1">{errors.assignee}</p>}
            </div>

            {/* หน่วยงาน / กลุ่มงาน / สังกัด */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                หน่วยงาน / สังกัด
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="เช่น กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-900 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
            </div>

            {/* 5. วันที่กำหนดติดตาม (Deadline) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                5. วันที่กำหนดติดตาม (กำหนดแล้วเสร็จ) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border ${
                    errors.deadline
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-blue-900 focus:ring-blue-100'
                  } focus:outline-none focus:ring-2`}
                />
              </div>
              {errors.deadline && <p className="text-xs text-rose-500 mt-1">{errors.deadline}</p>}
            </div>

            {/* 6. สถานะ */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                6. สถานะงาน <span className="text-rose-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-900 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white font-medium"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* 7. วันที่ติดตามล่าสุด */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                7. วันที่ติดตามล่าสุด
              </label>
              <input
                type="date"
                value={lastTrackedDate}
                onChange={(e) => setLastTrackedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-900 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
            </div>

            {/* 8. วันที่ติดตามครั้งถัดไป */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                8. วันที่ติดตามครั้งถัดไป
              </label>
              <input
                type="date"
                value={nextTrackingDate}
                onChange={(e) => setNextTrackingDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-900 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
            </div>

            {/* ระดับความสำคัญ & ขั้นตอนงาน */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ระดับความเร่งด่วนทางเอกสาร
              </label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      priority === p
                        ? p === 'เร่งด่วน'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : p === 'สำคัญ'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ขั้นตอนการปฏิบัติงาน (5 ขั้นตอน)
              </label>
              <select
                value={workflowStep}
                onChange={(e) =>
                  setWorkflowStep(parseInt(e.target.value, 10) as 1 | 2 | 3 | 4 | 5)
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-900 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white"
              >
                <option value={1}>1. รับเรื่อง / รับข้อมูล</option>
                <option value={2}>2. บันทึกข้อมูล</option>
                <option value={3}>3. มอบหมาย / ประสานงาน</option>
                <option value={4}>4. ติดตามสถานะ</option>
                <option value={5}>5. บันทึกผล / ดำเนินการแล้วเสร็จ</option>
              </select>
            </div>
          </div>

          {/* 9. สรุปการดำเนินงาน */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              9. สรุปการดำเนินงาน / เรื่องที่ได้รับมอบหมาย <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="ระบุสาระสำคัญของงาน เช่น ประสานงานจัดเตรียมเอกสารการประชุมคณะกรรมการฯ ประจำเดือน..."
              className={`w-full px-3 py-2 text-sm rounded-lg border ${
                errors.summary
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-300 focus:border-blue-900 focus:ring-blue-100'
              } focus:outline-none focus:ring-2`}
            />
            {errors.summary && <p className="text-xs text-rose-500 mt-1">{errors.summary}</p>}
          </div>

          {/* 10. หมายเหตุ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              10. หมายเหตุ / ข้อมูลเพิ่มเติมสำหรับการประสานงาน
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น รอเอกสารหนังสือตอบรับจากอำเภอเพิ่มเติมภายในวันที่..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-blue-900 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'บันทึกการแก้ไข' : 'บันทึกงานใหม่'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
