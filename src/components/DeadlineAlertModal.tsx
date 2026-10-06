import React, { useState } from 'react';
import { Task } from '../types';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  Eye,
  Calendar,
  User,
  ArrowRight,
  Filter,
  BellRing
} from 'lucide-react';
import {
  formatThaiDate,
  getDetailedDeadlineInfo,
  DetailedDeadlineCategory
} from '../utils/dateUtils';

interface DeadlineAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  onViewTask: (task: Task) => void;
  onNavigateToFilteredTasks: (filterType: string) => void;
}

export const DeadlineAlertModal: React.FC<DeadlineAlertModalProps> = ({
  isOpen,
  onClose,
  tasks,
  onViewTask,
  onNavigateToFilteredTasks
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'overdue' | 'due_today' | 'due_3_days' | 'due_7_days'>('all');

  if (!isOpen) return null;

  // Active / non-completed tasks evaluated with detailed deadlines
  const activeTasksWithDeadlines = tasks
    .filter((t) => t.status !== 'เสร็จสิ้น')
    .map((task) => ({
      task,
      info: getDetailedDeadlineInfo(task.deadline, task.status)
    }));

  const overdueList = activeTasksWithDeadlines.filter((item) => item.info.category === 'overdue');
  const dueTodayList = activeTasksWithDeadlines.filter((item) => item.info.category === 'due_today');
  const due3DaysList = activeTasksWithDeadlines.filter((item) => item.info.category === 'due_3_days');
  const due7DaysList = activeTasksWithDeadlines.filter((item) => item.info.category === 'due_7_days');

  const filteredItems = activeTasksWithDeadlines.filter((item) => {
    if (selectedFilter === 'all') {
      return item.info.category !== 'normal' && item.info.category !== 'completed';
    }
    return item.info.category === selectedFilter;
  });

  const totalUrgent = overdueList.length + dueTodayList.length + due3DaysList.length + due7DaysList.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-400/30">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                การแจ้งเตือนกำหนดติดตามงาน (In-App Alert)
              </h2>
              <p className="text-xs text-slate-300">
                รายการงานที่ต้องเร่งรัดและติดตามผลการดำเนินงาน กลุ่มงานความมั่นคง
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Counter Summary Pills */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="text-xs text-slate-500 font-semibold mb-2.5 flex items-center justify-between">
            <span>สรุปสถานะกำหนดการติดตามงาน ({totalUrgent} รายการที่ต้องติดตาม):</span>
            <span className="text-[11px] text-slate-400">*คลิกเพื่อกรองรายการ</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Overdue */}
            <button
              onClick={() => setSelectedFilter(selectedFilter === 'overdue' ? 'all' : 'overdue')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedFilter === 'overdue'
                  ? 'bg-rose-100/90 border-rose-400 ring-2 ring-rose-500/20'
                  : 'bg-white border-rose-200 hover:bg-rose-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-rose-800">🔴 เกินกำหนด</span>
                <span className="font-mono font-bold text-rose-900 text-sm">
                  {overdueList.length}
                </span>
              </div>
              <p className="text-[10px] text-rose-600 mt-1">เลยวันกำหนดติดตาม</p>
            </button>

            {/* Due Today */}
            <button
              onClick={() => setSelectedFilter(selectedFilter === 'due_today' ? 'all' : 'due_today')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedFilter === 'due_today'
                  ? 'bg-rose-100/90 border-rose-400 ring-2 ring-rose-500/20'
                  : 'bg-white border-rose-200 hover:bg-rose-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-rose-800">🔴 ครบกำหนดวันนี้</span>
                <span className="font-mono font-bold text-rose-900 text-sm">
                  {dueTodayList.length}
                </span>
              </div>
              <p className="text-[10px] text-rose-600 mt-1">ต้องรายงานผลวันนี้</p>
            </button>

            {/* Due in 3 days */}
            <button
              onClick={() => setSelectedFilter(selectedFilter === 'due_3_days' ? 'all' : 'due_3_days')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedFilter === 'due_3_days'
                  ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-500/20'
                  : 'bg-white border-amber-200 hover:bg-amber-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-amber-800">🟠 ภายใน 3 วัน</span>
                <span className="font-mono font-bold text-amber-900 text-sm">
                  {due3DaysList.length}
                </span>
              </div>
              <p className="text-[10px] text-amber-600 mt-1">เตรียมข้อมูลสรุป</p>
            </button>

            {/* Due in 7 days */}
            <button
              onClick={() => setSelectedFilter(selectedFilter === 'due_7_days' ? 'all' : 'due_7_days')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selectedFilter === 'due_7_days'
                  ? 'bg-yellow-100/90 border-yellow-400 ring-2 ring-yellow-500/20'
                  : 'bg-white border-yellow-200 hover:bg-yellow-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-yellow-800">🟡 ภายใน 7 วัน</span>
                <span className="font-mono font-bold text-yellow-900 text-sm">
                  {due7DaysList.length}
                </span>
              </div>
              <p className="text-[10px] text-yellow-600 mt-1">ติดตามความคืบหน้า</p>
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                ไม่มีรายการงานที่ตรงกับเงื่อนไขการแจ้งเตือน
              </p>
              <p className="text-xs text-slate-400 mt-1">
                การดำเนินงานทุกรายการยังคงอยู่ในกรอบกำหนดเวลาปกติ
              </p>
            </div>
          ) : (
            filteredItems.map(({ task, info }) => (
              <div
                key={task.id}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {task.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] border ${info.badgeClass}`}>
                      {info.label}
                    </span>
                    <span className="text-slate-500 bg-slate-50 px-2 py-0.5 rounded text-[11px] border border-slate-200/60">
                      {task.category}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {task.summary}
                  </h4>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <div className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{task.assignee}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>กำหนด: <strong className="text-slate-700">{formatThaiDate(task.deadline)}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => {
                      onViewTask(task);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>ดูรายละเอียด</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="text-[11px] text-slate-400">
            * ระบบแจ้งเตือนภายใน (In-App Alert) ไม่มีการส่ง SMS หรืออีเมลภายนอก
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNavigateToFilteredTasks(selectedFilter);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>เปิดในตารางจัดการงานทั้งหมด</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
