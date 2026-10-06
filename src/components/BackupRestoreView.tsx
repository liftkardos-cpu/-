import React, { useState, useRef } from 'react';
import { Task, TaskHistoryItem, TaskDocument, EvaluationItem, SOTSBackupData, UserRole } from '../types';
import {
  Database,
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  FileJson,
  ShieldAlert,
  Server,
  Layers,
  FileText,
  Clock,
  History,
  Info,
  Calendar
} from 'lucide-react';
import { formatThaiDateTime } from '../utils/dateUtils';
import { ConfirmModal } from './ConfirmModal';

interface BackupRestoreViewProps {
  tasks: Task[];
  history: TaskHistoryItem[];
  documents: TaskDocument[];
  evaluations: EvaluationItem[];
  onRestoreData: (backup: SOTSBackupData) => void;
  onResetDemo: () => void;
  userRole: UserRole;
  onShowToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const BackupRestoreView: React.FC<BackupRestoreViewProps> = ({
  tasks,
  history,
  documents,
  evaluations,
  onRestoreData,
  onResetDemo,
  userRole,
  onShowToast
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<SOTSBackupData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canManage = userRole === 'admin';

  // Export JSON Backup
  const handleExportJSON = () => {
    const backup: SOTSBackupData = {
      version: '1.2.0',
      systemName: 'ระบบสนับสนุนการติดตามงานด้านความมั่นคง (ต้นแบบ) - SOTS',
      exportedAt: new Date().toISOString(),
      note: 'ข้อมูลสำรองระบบ SOTS (ชุดข้อมูลจำลองเพื่อการศึกษา CWIE)',
      tasks,
      history,
      documents,
      evaluations
    };

    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `SOTS_Backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onShowToast(
      'success',
      'สำรองข้อมูลสำเร็จ',
      `ส่งออกไฟล์ SOTS_Backup_${dateStr}.json (รวมงาน ${tasks.length} รายการ, ประวัติ ${history.length} รายการ, เอกสาร ${documents.length} รายการ)`
    );
  };

  // Handle File Selection & Validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParseError(null);
    setParsedBackup(null);

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setParseError('ไฟล์ต้องเป็นนามสกุล .json เท่านั้น');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = JSON.parse(text);

        // Validation Checks
        if (!data || typeof data !== 'object') {
          throw new Error('รูปแบบไฟล์ JSON ไม่ถูกต้อง');
        }

        if (!Array.isArray(data.tasks)) {
          throw new Error('ไม่พบโครงสร้างข้อมูล tasks ในไฟล์สำรอง');
        }

        // Validate basic task structure
        if (data.tasks.length > 0 && (!data.tasks[0].id || !data.tasks[0].summary)) {
          throw new Error('ข้อมูล tasks ในไฟล์สำรองไม่ตรงตามมาตรฐานของระบบ SOTS');
        }

        const validBackup: SOTSBackupData = {
          version: data.version || '1.0.0',
          systemName: data.systemName || 'SOTS',
          exportedAt: data.exportedAt || new Date().toISOString(),
          note: data.note || 'ข้อมูลสำรอง SOTS',
          tasks: data.tasks || [],
          history: Array.isArray(data.history) ? data.history : [],
          documents: Array.isArray(data.documents) ? data.documents : [],
          evaluations: Array.isArray(data.evaluations) ? data.evaluations : []
        };

        setParsedBackup(validBackup);
      } catch (err: any) {
        setParseError(err.message || 'ไม่สามารถอ่านไฟล์ JSON ได้');
        setParsedBackup(null);
      }
    };

    reader.onerror = () => {
      setParseError('เกิดข้อผิดพลาดในการอ่านไฟล์');
    };

    reader.readAsText(file);
  };

  // Confirm and Restore Data
  const handleConfirmRestore = () => {
    if (!parsedBackup) return;

    try {
      onRestoreData(parsedBackup);
      setIsConfirmModalOpen(false);
      setSelectedFile(null);
      setParsedBackup(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      onShowToast(
        'success',
        'กู้คืนข้อมูลสำเร็จ',
        `นำเข้างาน ${parsedBackup.tasks.length} รายการ, ประวัติ ${parsedBackup.history.length} รายการ และเอกสาร ${parsedBackup.documents.length} รายการ เรียบร้อยแล้ว`
      );
    } catch (err: any) {
      onShowToast('error', 'การกู้คืนข้อมูลขัดข้อง', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-medium">
              <Database className="w-3.5 h-3.5 text-blue-300" />
              การจัดการข้อมูลและการสำรอง
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              การสำรองและกู้คืนข้อมูล (Backup & Restore)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              สำรองข้อมูลทั้งหมดในระบบ SOTS ลงในคอมพิวเตอร์ของคุณแบบ Local JSON หรือกู้คืนชุดข้อมูลเดิมกลับเข้าสู่ระบบ
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์สำรอง (Export JSON)</span>
            </button>
          </div>
        </div>

        {/* Current State Summary Pill */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-400" />
            <span>รายการงานปัจจุบัน: <strong className="text-white font-mono">{tasks.length}</strong> งาน</span>
          </div>
          <div className="flex items-center gap-1.5">
            <History className="w-4 h-4 text-amber-400" />
            <span>ประวัติ/Audit Log: <strong className="text-white font-mono">{history.length}</strong> บันทึก</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>เอกสารแนบ: <strong className="text-white font-mono">{documents.length}</strong> ไฟล์</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Export vs Import */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Export Backup */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-blue-50 text-blue-900 rounded-xl">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  1. สำรองข้อมูลออกเป็นไฟล์ (Export JSON)
                </h3>
                <p className="text-xs text-slate-500">
                  ดาวน์โหลดข้อมูลทั้งหมดเก็บไว้ในเครื่องคอมพิวเตอร์
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              การกดปุ่มสำรองข้อมูลจะทำการรวบรวมข้อมูลทั้งหมดในระบบ ได้แก่:
            </p>

            <ul className="text-xs text-slate-600 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ข้อมูลงานทั้งหมด ({tasks.length} รายการ พร้อมสถานะและกำหนดติดตาม)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ประวัติการดำเนินงานและ Audit Log ({history.length} รายการ)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>รายการเอกสารประกอบงาน ({documents.length} รายการ)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ผลการประเมินการใช้งาน ({evaluations.length} รายการ)</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              ไฟล์ที่ได้: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">SOTS_Backup_YYYY-MM-DD.json</code>
            </span>
            <button
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>ดาวน์โหลดไฟล์ JSON</span>
            </button>
          </div>
        </div>

        {/* Box 2: Import / Restore Backup */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-amber-50 text-amber-800 rounded-xl">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  2. กู้คืนข้อมูลจากไฟล์ (Import JSON)
                </h3>
                <p className="text-xs text-slate-500">
                  นำไฟล์ข้อมูลสำรอง JSON ที่เคย Export ไว้กลับเข้าสู่ระบบ
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              เลือกไฟล์สำรอง <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-700">.json</code> ระบบจะตรวจสอบโครงสร้างข้อมูลก่อนให้ยืนยันการกู้คืน
            </p>

            <div className="space-y-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-900 hover:file:bg-blue-200 cursor-pointer border border-slate-300 rounded-xl bg-slate-50 p-1.5"
              />
            </div>

            {/* Parse Error */}
            {parseError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Valid File Summary Preview */}
            {parsedBackup && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ไฟล์ข้อมูลสำรองถูกต้อง พร้อมสำหรับการกู้คืน</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-700 pt-1">
                  <div>• งานทั้งหมด: <strong>{parsedBackup.tasks.length} รายการ</strong></div>
                  <div>• ประวัติ/Audit: <strong>{parsedBackup.history.length} รายการ</strong></div>
                  <div>• เอกสารประกอบ: <strong>{parsedBackup.documents.length} รายการ</strong></div>
                  <div>• ส่งออกเมื่อ: <strong>{formatThaiDateTime(parsedBackup.exportedAt)}</strong></div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              * ข้อมูลเดิมในระบบจะถูกเขียนทับด้วยข้อมูลจากไฟล์สำรอง
            </span>
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={!parsedBackup || !canManage}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>เริ่มการกู้คืนข้อมูล</span>
            </button>
          </div>
        </div>
      </div>

      {/* Box 3: Reset Demo Data Option */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <RotateCcw className="w-4 h-4 text-blue-900" />
            <span>คืนค่าข้อมูลตัวอย่างเริ่มต้น (Reset Demo Data)</span>
          </div>
          <p className="text-xs text-slate-500">
            หากต้องการเริ่มทดสอบใหม่ สามารถรีเซ็ตข้อมูลทั้งหมดกลับเป็นข้อมูลจำลองเริ่มต้น 12 รายการได้ตลอดเวลา
          </p>
        </div>

        {canManage && (
          <button
            onClick={onResetDemo}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>รีเซ็ตข้อมูลตัวอย่าง</span>
          </button>
        )}
      </div>

      {/* Academic Disclaimer */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
        <div className="flex items-center gap-2 font-bold text-amber-950">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>ข้อกำหนดความปลอดภัยและการใช้งาน (CWIE Prototype Notice):</span>
        </div>
        <p className="leading-relaxed text-[11px] text-amber-800">
          ข้อมูลในระบบ SOTS เป็นชุดข้อมูลจำลองเพื่อการศึกษาโครงงาน CWIE มหาวิทยาลัยทักษิณเท่านั้น
          ห้ามนำข้อมูลจริง ข้อมูลลับทางราชการ ข้อมูลส่วนบุคคลตาม PDPA หรือข้อมูลด้านความมั่นคงมาเก็บไว้ในระบบเด็ดขาด
        </p>
      </div>

      {/* Confirmation Modal before Restore */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title="ยืนยันการกู้คืนข้อมูลจากไฟล์สำรอง"
        message={`คุณต้องการกู้คืนข้อมูลจากไฟล์ "${selectedFile?.name}" หรือไม่? การกู้คืนจะแทนที่รายการงานปัจจุบัน (${tasks.length} รายการ) ด้วยข้อมูลจากไฟล์สำรอง (${parsedBackup?.tasks.length} รายการ) และปรับปรุงประวัติการดำเนินงานทั้งหมดทันที`}
        confirmText="ยืนยันการกู้คืนข้อมูล"
        cancelText="ยกเลิก"
        isDestructive={true}
        onConfirm={handleConfirmRestore}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </div>
  );
};
