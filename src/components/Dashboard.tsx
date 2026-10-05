import React from 'react';
import { Task, UserRole, TaskStatus } from '../types';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  PauseCircle,
  ShieldCheck
} from 'lucide-react';
import {
  formatThaiDate,
  calculateDeadlineStatus,
  getDeadlineBadgeStyle,
  getStatusBadgeStyle
} from '../utils/dateUtils';

interface DashboardProps {
  tasks: Task[];
  onOpenCreate: () => void;
  onViewTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onNavigateToTasks: () => void;
  userRole: UserRole;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  onOpenCreate,
  onViewTask,
  onEditTask,
  onDeleteTask,
  onNavigateToTasks,
  userRole
}) => {
  // Dynamic Calculations from current tasks array
  const totalTasks = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'รอดำเนินการ').length;
  const inProgressCount = tasks.filter((t) => t.status === 'อยู่ระหว่างดำเนินการ').length;
  const followUpCount = tasks.filter((t) => t.status === 'รอติดตาม').length;
  const completedCount = tasks.filter((t) => t.status === 'เสร็จสิ้น').length;
  const onHoldCount = tasks.filter((t) => t.status === 'พัก/รอข้อมูล').length;

  // Deadline calculations
  const overdueCount = tasks.filter(
    (t) => calculateDeadlineStatus(t.deadline, t.status) === 'เกินกำหนด'
  ).length;
  const dueSoonCount = tasks.filter(
    (t) => calculateDeadlineStatus(t.deadline, t.status) === 'ใกล้ถึงกำหนด'
  ).length;

  // Recent 6 tasks sorted by updated date / received date
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime())
    .slice(0, 6);

  // Category counts
  const categoryCounts = tasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const canAdd = userRole === 'admin' || userRole === 'staff';
  const canDelete = userRole === 'admin';

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
              โครงงานพัฒนางาน CWIE มหาวิทยาลัยทักษิณ
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              ภาพรวมการดำเนินงาน
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              ระบบสนับสนุนการติดตามงานด้านความมั่นคง (SOTS) ที่ทำการปกครองจังหวัดสงขลา กลุ่มงานความมั่นคง
              ช่วยบันทึก มอบหมาย และติดตามสถานะความคืบหน้าของงานธุรการและงานประสานงานอย่างมีประสิทธิภาพ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canAdd && (
              <button
                onClick={onOpenCreate}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <PlusCircle className="w-5 h-5" />
                + เพิ่มงานใหม่
              </button>
            )}
            <button
              onClick={onNavigateToTasks}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all border border-white/15"
            >
              ดูงานทั้งหมด
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Overdue / Due Soon Alert Ribbon if any */}
        {(overdueCount > 0 || dueSoonCount > 0) && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-4 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              การแจ้งเตือนกำหนดเวลา:
            </span>
            {overdueCount > 0 && (
              <span className="bg-rose-500/20 border border-rose-500/40 text-rose-300 px-3 py-1 rounded-full font-semibold">
                ⚠️ มีงานเกินกำหนด {overdueCount} รายการ
              </span>
            )}
            {dueSoonCount > 0 && (
              <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full font-semibold">
                ⏳ มีงานใกล้ถึงกำหนดภายใน 3 วัน {dueSoonCount} รายการ
              </span>
            )}
          </div>
        )}
      </div>

      {/* 5 Primary Summary Cards (Requirement: At least 5 cards with dynamic calculation) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: งานทั้งหมด */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">งานทั้งหมด</span>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
              {totalTasks}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">รายการงานในระบบ</p>
          </div>
        </div>

        {/* Card 2: รอดำเนินการ */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">รอดำเนินการ</span>
            <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-700 font-mono">
              {pendingCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {totalTasks > 0 ? Math.round((pendingCount / totalTasks) * 100) : 0}% ของงานทั้งหมด
            </p>
          </div>
        </div>

        {/* Card 3: อยู่ระหว่างดำเนินการ */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">อยู่ระหว่างดำเนินการ</span>
            <div className="p-2 bg-blue-50 text-blue-800 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-blue-900 font-mono">
              {inProgressCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">กำลังปฏิบัติการ/ประสานงาน</p>
          </div>
        </div>

        {/* Card 4: รอติดตาม */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">รอติดตาม</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-amber-700 font-mono">
              {followUpCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">รอผลตอบกลับจากหน่วยงาน</p>
          </div>
        </div>

        {/* Card 5: เสร็จสิ้น */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">เสร็จสิ้น</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono">
              {completedCount}
            </div>
            <p className="text-[11px] text-emerald-600 mt-1 font-medium">
              สำเร็จแล้ว {totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Progress */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">สัดส่วนสถานะงานในระบบ</h2>
              <p className="text-xs text-slate-500">จำแนกตามสถานะการดำเนินงานปัจจุบัน</p>
            </div>
            <span className="text-xs font-semibold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md">
              รวม {totalTasks} รายการ
            </span>
          </div>

          {/* Multi-segment stacked progress bar */}
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5 p-0.5">
            {pendingCount > 0 && (
              <div
                style={{ width: `${(pendingCount / totalTasks) * 100}%` }}
                className="bg-slate-400 rounded-xs transition-all"
                title={`รอดำเนินการ: ${pendingCount}`}
              />
            )}
            {inProgressCount > 0 && (
              <div
                style={{ width: `${(inProgressCount / totalTasks) * 100}%` }}
                className="bg-blue-600 rounded-xs transition-all"
                title={`อยู่ระหว่างดำเนินการ: ${inProgressCount}`}
              />
            )}
            {followUpCount > 0 && (
              <div
                style={{ width: `${(followUpCount / totalTasks) * 100}%` }}
                className="bg-amber-500 rounded-xs transition-all"
                title={`รอติดตาม: ${followUpCount}`}
              />
            )}
            {completedCount > 0 && (
              <div
                style={{ width: `${(completedCount / totalTasks) * 100}%` }}
                className="bg-emerald-600 rounded-xs transition-all"
                title={`เสร็จสิ้น: ${completedCount}`}
              />
            )}
            {onHoldCount > 0 && (
              <div
                style={{ width: `${(onHoldCount / totalTasks) * 100}%` }}
                className="bg-purple-500 rounded-xs transition-all"
                title={`พัก/รอข้อมูล: ${onHoldCount}`}
              />
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <div>
                <span className="text-slate-500 block">รอดำเนินการ</span>
                <span className="font-bold text-slate-800 font-mono">{pendingCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <div>
                <span className="text-slate-500 block">อยู่ระหว่างดำเนินการ</span>
                <span className="font-bold text-blue-900 font-mono">{inProgressCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div>
                <span className="text-slate-500 block">รอติดตาม</span>
                <span className="font-bold text-amber-700 font-mono">{followUpCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <div>
                <span className="text-slate-500 block">เสร็จสิ้น</span>
                <span className="font-bold text-emerald-700 font-mono">{completedCount}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <div>
                <span className="text-slate-500 block">พัก/รอข้อมูล</span>
                <span className="font-bold text-purple-700 font-mono">{onHoldCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deadline Status Widget */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">การควบคุมกำหนดเวลา</h2>
            <p className="text-xs text-slate-500 mt-0.5">การตรวจสอบวันครบกำหนดส่งงาน</p>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs">
                <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ตามกำหนดเวลา / เสร็จสิ้น
                </span>
                <span className="font-bold font-mono text-emerald-900">
                  {totalTasks - overdueCount - dueSoonCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50 border border-amber-100 text-xs">
                <span className="font-semibold text-amber-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  ใกล้ถึงกำหนด (ภายใน 3 วัน)
                </span>
                <span className="font-bold font-mono text-amber-900">{dueSoonCount}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-xs">
                <span className="font-semibold text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  เกินกำหนดส่งงาน
                </span>
                <span className="font-bold font-mono text-rose-900">{overdueCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            * คำนวณอัตโนมัติจากวันกำหนดติดตามเทียบกับวันที่ปัจจุบัน
          </div>
        </div>
      </div>

      {/* Section: รายการงานล่าสุด (Requirement #4) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">รายการงานล่าสุด</h2>
            <p className="text-xs text-slate-500">
              แสดง 6 รายการที่บันทึกหรือปรับปรุงล่าสุดในระบบ
            </p>
          </div>
          <button
            onClick={onNavigateToTasks}
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1"
          >
            เปิดตารางจัดการงานทั้งหมด ({totalTasks} รายการ)
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">รหัสงาน</th>
                <th className="py-3 px-4">วันที่รับเรื่อง</th>
                <th className="py-3 px-4">ประเภทงาน</th>
                <th className="py-3 px-4">สรุปงาน</th>
                <th className="py-3 px-4">หน่วยงาน/ผู้รับผิดชอบ</th>
                <th className="py-3 px-4">กำหนดติดตาม</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-right">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    ไม่มีรายการงานในระบบ
                  </td>
                </tr>
              ) : (
                recentTasks.map((task) => {
                  const deadlineStatus = calculateDeadlineStatus(task.deadline, task.status);
                  const deadlineBadge = getDeadlineBadgeStyle(deadlineStatus);
                  const statusBadge = getStatusBadgeStyle(task.status);

                  return (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {task.id}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatThaiDate(task.receivedDate)}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {task.category}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 line-clamp-1">
                          {task.summary}
                        </div>
                        {task.notes && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {task.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{task.assignee}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">
                          {formatThaiDate(task.deadline)}
                        </div>
                        <span
                          className={`inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${deadlineBadge.bg}`}
                        >
                          {deadlineBadge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusBadge.bg} ${statusBadge.text} border ${statusBadge.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewTask(task)}
                            className="p-1.5 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(userRole === 'admin' || userRole === 'staff') && (
                            <button
                              onClick={() => onEditTask(task)}
                              className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors"
                              title="แก้ไข"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {userRole === 'admin' && (
                            <button
                              onClick={() => onDeleteTask(task)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="ลบ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
