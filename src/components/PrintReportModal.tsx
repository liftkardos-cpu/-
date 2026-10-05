import React from 'react';
import { Task } from '../types';
import { Printer, X, FileText, CheckCircle2 } from 'lucide-react';
import { formatThaiDate, calculateDeadlineStatus } from '../utils/dateUtils';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  singleTask?: Task | null;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  singleTask
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isSingle = Boolean(singleTask);
  const items = isSingle && singleTask ? [singleTask] : tasks;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-300 overflow-hidden my-4 print:m-0 print:border-none print:shadow-none">
        {/* Controls bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-300" />
            <span className="font-bold text-sm">
              {isSingle ? 'ตัวอย่างก่อนพิมพ์: เอกสารสรุปงานรายข้อ' : 'ตัวอย่างก่อนพิมพ์: รายงานสรุปการติดตามงาน'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              สั่งพิมพ์เอกสาร (Print / Save as PDF)
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="p-8 sm:p-12 text-slate-900 bg-white font-['Sarabun',sans-serif] max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0">
          {/* Official Letterhead */}
          <div className="text-center pb-6 border-b-2 border-slate-800 mb-6">
            <div className="inline-block p-2 rounded-full border border-slate-300 mb-2">
              <span className="text-xs font-bold text-slate-800 tracking-wider">
                ที่ทำการปกครองจังหวัดสงขลา
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              รายงานสรุปการติดตามงานด้านความมั่นคง (ต้นแบบ)
            </h1>
            <p className="text-sm text-slate-700 mt-1 font-semibold">
              กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              ระบบสนับสนุนการติดตามงานด้านความมั่นคง (SOTS) — โครงงานพัฒนางาน CWIE มหาวิทยาลัยทักษิณ
            </p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-600 px-2 pt-2 border-t border-slate-200">
              <span>วันที่จัดพิมพ์: {new Date().toLocaleDateString('th-TH', { dateStyle: 'full' })}</span>
              <span>จำนวนงานทั้งหมดในรายงาน: {items.length} รายการ</span>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-left text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="p-2 border-r border-slate-300 w-16 text-center">รหัสงาน</th>
                <th className="p-2 border-r border-slate-300 w-24 text-center">วันที่รับเรื่อง</th>
                <th className="p-2 border-r border-slate-300 w-32">ประเภทงาน</th>
                <th className="p-2 border-r border-slate-300">สาระสำคัญ / สรุปการดำเนินงาน</th>
                <th className="p-2 border-r border-slate-300 w-36">ผู้รับผิดชอบ</th>
                <th className="p-2 border-r border-slate-300 w-24 text-center">กำหนดติดตาม</th>
                <th className="p-2 w-24 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {items.map((task, idx) => {
                const deadlineStatus = calculateDeadlineStatus(task.deadline, task.status);
                return (
                  <tr
                    key={task.id}
                    className={`border-b border-slate-300 ${
                      idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'
                    }`}
                  >
                    <td className="p-2 border-r border-slate-300 font-mono font-bold text-center">
                      {task.id}
                    </td>
                    <td className="p-2 border-r border-slate-300 text-center">
                      {formatThaiDate(task.receivedDate)}
                    </td>
                    <td className="p-2 border-r border-slate-300 font-medium">{task.category}</td>
                    <td className="p-2 border-r border-slate-300">
                      <div className="font-semibold text-slate-900">{task.summary}</div>
                      {task.notes && (
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          หมายเหตุ: {task.notes}
                        </div>
                      )}
                    </td>
                    <td className="p-2 border-r border-slate-300">{task.assignee}</td>
                    <td className="p-2 border-r border-slate-300 text-center">
                      <div>{formatThaiDate(task.deadline)}</div>
                      <span className="text-[10px] text-slate-500">({deadlineStatus})</span>
                    </td>
                    <td className="p-2 text-center font-semibold">
                      {task.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Signatures block for academic / official report */}
          <div className="mt-12 grid grid-cols-2 gap-8 text-center text-xs text-slate-800 pt-6">
            <div>
              <p className="mb-14">ลงชื่อ........................................................</p>
              <p className="font-bold">( นักศึกษาสหกิจศึกษา CWIE )</p>
              <p className="text-slate-500 mt-1">ผู้จัดทำระบบและบันทึกข้อมูลจำลอง</p>
              <p className="text-slate-500">มหาวิทยาลัยทักษิณ</p>
            </div>
            <div>
              <p className="mb-14">ลงชื่อ........................................................</p>
              <p className="font-bold">( ........................................................ )</p>
              <p className="text-slate-500 mt-1">เจ้าหน้าที่ผู้ควบคุมการปฏิบัติงาน CWIE</p>
              <p className="text-slate-500">กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา</p>
            </div>
          </div>

          {/* Disclaimer Footer */}
          <div className="mt-12 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-400">
            เอกสารนี้สร้างขึ้นจากระบบ Security Work Tracking and Support System (SOTS) ต้นแบบเพื่อการศึกษา CWIE
            <br />
            ข้อมูลทั้งหมดเป็นข้อมูลสมมติเพื่อการทดลองเท่านั้น มิใช่เอกสารราชการจริง
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            ปิด
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-sm"
          >
            <Printer className="w-4 h-4" />
            พิมพ์เอกสาร
          </button>
        </div>
      </div>
    </div>
  );
};
