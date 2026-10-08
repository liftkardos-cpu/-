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
  ShieldCheck,
  BellRing,
  Layers,
  BarChart3,
  Award
} from 'lucide-react';
import {
  formatThaiDate,
  calculateDeadlineStatus,
  getDeadlineBadgeStyle,
  getStatusBadgeStyle,
  getDetailedDeadlineInfo
} from '../utils/dateUtils';

interface DashboardProps {
  tasks: Task[];
  onOpenCreate: () => void;
  onViewTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onNavigateToTasks: () => void;
  onNavigateToTasksWithFilter?: (filter: { urgency?: string; status?: string }) => void;
  onOpenDeadlineAlerts?: () => void;
  userRole: UserRole;
}

export const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  onOpenCreate,
  onViewTask,
  onEditTask,
  onDeleteTask,
  onNavigateToTasks,
  onNavigateToTasksWithFilter,
  onOpenDeadlineAlerts,
  userRole
}) => {
  // Total Tasks
  const totalTasks = tasks.length;

  // Status Counts
  const pendingCount = tasks.filter((t) => t.status === 'รอดำเนินการ' || t.status === 'รับเรื่อง').length;
  const inProgressCount = tasks.filter((t) => t.status === 'อยู่ระหว่างดำเนินการ').length;
  const followUpCount = tasks.filter((t) => t.status === 'รอติดตาม').length;
  const onHoldCount = tasks.filter((t) => t.status === 'พัก/รอข้อมูล').length;
  const completedCount = tasks.filter((t) => t.status === 'เสร็จสิ้น').length;

  // Deadline Calculations (from getDetailedDeadlineInfo)
  const tasksWithDeadlines = tasks.map((t) => ({
    task: t,
    info: getDetailedDeadlineInfo(t.deadline, t.status)
  }));

  const overdueCount = tasksWithDeadlines.filter((item) => item.info.category === 'overdue').length;
  const dueTodayCount = tasksWithDeadlines.filter((item) => item.info.category === 'due_today').length;
  const due3DaysCount = tasksWithDeadlines.filter((item) => item.info.category === 'due_3_days').length;
  const due7DaysCount = tasksWithDeadlines.filter((item) => item.info.category === 'due_7_days').length;
  const dueNearCount = due3DaysCount + due7DaysCount; // งานใกล้ครบกำหนด (ภายใน 3-7 วัน)
  const normalCount = tasksWithDeadlines.filter(
    (item) => item.info.category === 'normal' || item.info.category === 'completed'
  ).length;

  // Success / Completion Rate
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Recent 6 tasks sorted by received date
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime())
    .slice(0, 6);

  // Category counts
  const categoryCounts = tasks.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const canAdd = userRole === 'admin' || userRole === 'staff';

  const handleFilterClick = (filter: { urgency?: string; status?: string }) => {
    if (onNavigateToTasksWithFilter) {
      onNavigateToTasksWithFilter(filter);
    } else {
      onNavigateToTasks();
    }
  };

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
              ภาพรวมการดำเนินงาน (Executive Dashboard)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              ระบบสนับสนุนการติดตามงานด้านความมั่นคง (SOTS) ที่ทำการปกครองจังหวัดสงขลา กลุ่มงานความมั่นคง
              ติดตามสถานะ กำหนดเวลา และสรุปผลการปฏิบัติราชการ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canAdd && (
              <button
                onClick={onOpenCreate}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-5 h-5" />
                <span>+ เพิ่มงานใหม่</span>
              </button>
            )}
            {onOpenDeadlineAlerts && (
              <button
                onClick={onOpenDeadlineAlerts}
                className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all border border-amber-400/30 cursor-pointer"
              >
                <BellRing className="w-4 h-4 text-amber-300" />
                <span>แจ้งเตือน ({overdueCount + dueTodayCount + due3DaysCount})</span>
              </button>
            )}
            <button
              onClick={onNavigateToTasks}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium text-sm px-4 py-2.5 rounded-xl transition-all border border-white/15 cursor-pointer"
            >
              <span>ดูงานทั้งหมด</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Overdue & Alert Notice Bar */}
        {(overdueCount > 0 || dueTodayCount > 0 || due3DaysCount > 0) && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5 mr-1">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                สรุปการเตือนกำหนดเวลา:
              </span>
              {overdueCount > 0 && (
                <button
                  onClick={() => handleFilterClick({ urgency: 'overdue' })}
                  className="bg-rose-500/20 border border-rose-500/40 text-rose-300 px-3 py-1 rounded-full font-semibold hover:bg-rose-500/30 cursor-pointer transition-colors"
                >
                  🔴 เกินกำหนด {overdueCount} งาน
                </button>
              )}
              {dueTodayCount > 0 && (
                <button
                  onClick={() => handleFilterClick({ urgency: 'due_today' })}
                  className="bg-rose-500/20 border border-rose-500/40 text-rose-200 px-3 py-1 rounded-full font-semibold hover:bg-rose-500/30 cursor-pointer transition-colors"
                >
                  🔴 ครบกำหนดวันนี้ {dueTodayCount} งาน
                </button>
              )}
              {due3DaysCount > 0 && (
                <button
                  onClick={() => handleFilterClick({ urgency: 'due_3_days' })}
                  className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full font-semibold hover:bg-amber-500/30 cursor-pointer transition-colors"
                >
                  🟠 ครบกำหนดภายใน 3 วัน {due3DaysCount} งาน
                </button>
              )}
              {due7DaysCount > 0 && (
                <button
                  onClick={() => handleFilterClick({ urgency: 'due_7_days' })}
                  className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 px-3 py-1 rounded-full font-semibold hover:bg-yellow-500/30 cursor-pointer transition-colors"
                >
                  🟡 ครบกำหนดภายใน 7 วัน {due7DaysCount} งาน
                </button>
              )}
            </div>

            <span className="text-slate-400 text-[11px]">*คลิกเพื่อเปิดตารางกรองรายการ</span>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* ส่วนที่ 3 & 4: งานใกล้ครบกำหนด & งานเกินกำหนด (4-5 Cards Clickable) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-900" />
            <h2 className="text-sm font-bold text-slate-900">
              ระบบแจ้งเตือนกำหนดติดตามงาน (Deadline Tracking Control)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            คำนวณจากวันที่รับเรื่องเทียบกับวันกำหนดติดตามปัจจุบัน
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Card 1: งานเกินกำหนด 🔴 */}
          <button
            onClick={() => handleFilterClick({ urgency: 'overdue' })}
            className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 transition-all text-left cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-rose-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                🔴 งานเกินกำหนด
              </span>
              <span className="text-xs text-rose-500 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-900 mt-2">
              {overdueCount} <span className="text-xs font-normal text-rose-700">งาน</span>
            </div>
            <p className="text-[11px] text-rose-600 mt-1">เลยกำหนดติดตาม ต้องเร่งรัดด่วน</p>
          </button>

          {/* Card 2: งานครบกำหนดวันนี้ 🔴 */}
          <button
            onClick={() => handleFilterClick({ urgency: 'due_today' })}
            className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 transition-all text-left cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-rose-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                🔴 งานครบกำหนดวันนี้
              </span>
              <span className="text-xs text-rose-500 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-900 mt-2">
              {dueTodayCount} <span className="text-xs font-normal text-rose-700">งาน</span>
            </div>
            <p className="text-[11px] text-rose-600 mt-1">ครบกำหนดติดตามในวันนี้</p>
          </button>

          {/* Card 3: งานใกล้ครบกำหนด 🟠 */}
          <button
            onClick={() => handleFilterClick({ urgency: 'due_3_days' })}
            className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 transition-all text-left cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                🟠 งานใกล้ครบกำหนด
              </span>
              <span className="text-xs text-amber-500 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-900 mt-2">
              {dueNearCount} <span className="text-xs font-normal text-amber-700">งาน</span>
            </div>
            <p className="text-[11px] text-amber-600 mt-1">
              ภายใน 3-7 วัน (3 วัน: {due3DaysCount}, 7 วัน: {due7DaysCount})
            </p>
          </button>

          {/* Card 4: งานปกติ / อยู่ในกำหนด 🟢 */}
          <button
            onClick={() => handleFilterClick({ urgency: 'normal' })}
            className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 transition-all text-left cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                🟢 งานปกติ
              </span>
              <span className="text-xs text-emerald-500 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-900 mt-2">
              {normalCount} <span className="text-xs font-normal text-emerald-700">งาน</span>
            </div>
            <p className="text-[11px] text-emerald-600 mt-1">อยู่ในกำหนดตามแผนปกติ</p>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ส่วนที่ 1, 2, 5: จำนวนงานทั้งหมด, งานตามสถานะ, อัตราความสำเร็จ */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* ส่วนที่ 1: งานทั้งหมด */}
        <button
          onClick={() => handleFilterClick({ status: 'all' })}
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">งานทั้งหมด</span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg group-hover:bg-blue-100 group-hover:text-blue-900 transition-colors">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
              {totalTasks}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">รวมทุกสถานะในระบบ</p>
          </div>
        </button>

        {/* ส่วนที่ 2A: รอดำเนินการ */}
        <button
          onClick={() => handleFilterClick({ status: 'รอดำเนินการ' })}
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">รอดำเนินการ</span>
            <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg group-hover:bg-slate-200 transition-colors">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-bold text-slate-700 font-mono">
              {pendingCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">ลงทะเบียนเข้าใหม่</p>
          </div>
        </button>

        {/* ส่วนที่ 2B: อยู่ระหว่างดำเนินการ */}
        <button
          onClick={() => handleFilterClick({ status: 'อยู่ระหว่างดำเนินการ' })}
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">อยู่ระหว่างดำเนินการ</span>
            <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-bold text-blue-900 font-mono">
              {inProgressCount}
            </div>
            <p className="text-[11px] text-blue-600 mt-0.5">กำลังประสานงาน</p>
          </div>
        </button>

        {/* ส่วนที่ 2C: รอติดตาม */}
        <button
          onClick={() => handleFilterClick({ status: 'รอติดตาม' })}
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">รอติดตาม</span>
            <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg group-hover:bg-amber-100 transition-colors">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-bold text-amber-800 font-mono">
              {followUpCount}
            </div>
            <p className="text-[11px] text-amber-600 mt-0.5">รอรายงานผล</p>
          </div>
        </button>

        {/* ส่วนที่ 2D: พัก/รอข้อมูล */}
        <button
          onClick={() => handleFilterClick({ status: 'พัก/รอข้อมูล' })}
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">พัก/รอข้อมูล</span>
            <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg group-hover:bg-purple-100 transition-colors">
              <PauseCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-bold text-purple-800 font-mono">
              {onHoldCount}
            </div>
            <p className="text-[11px] text-purple-600 mt-0.5">รอข้อมูลเพิ่มเติม</p>
          </div>
        </button>

        {/* ส่วนที่ 5: เสร็จสิ้น & อัตราความสำเร็จ */}
        <button
          onClick={() => handleFilterClick({ status: 'เสร็จสิ้น' })}
          className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow text-left cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">เสร็จสิ้น ({completionRate}%)</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg group-hover:bg-emerald-100 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700 font-mono">
              {completedCount}
            </div>
            <p className="text-[11px] text-emerald-600 mt-0.5 font-semibold">
              อัตราความสำเร็จ {completionRate}%
            </p>
          </div>
        </button>
      </div>

      {/* ======================================================== */}
      {/* ส่วนที่ 6: แนวโน้มการดำเนินงานและสัดส่วนภารกิจ (Analytics Widgets) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Multi-segment Status Progress Bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                ส่วนที่ 6: แนวโน้มและสัดส่วนสถานะการดำเนินงาน
              </h2>
              <p className="text-xs text-slate-500">
                กระบวนการ Workflow 5 ขั้นตอน (รับเรื่อง → มอบหมาย → ดำเนินการ → รอติดตาม → เสร็จสิ้น)
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-900 bg-blue-50 px-2.5 py-1 rounded-md">
              รวม {totalTasks} งาน
            </span>
          </div>

          {totalTasks === 0 ? (
            <div className="py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Layers className="w-9 h-9 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">ยังไม่มีข้อมูลการดำเนินงาน</p>
              <p className="text-xs text-slate-400 mt-1">กรุณาเพิ่มงานเพื่อเริ่มต้นใช้งานระบบ</p>
              {canAdd && (
                <button
                  onClick={onOpenCreate}
                  className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-900 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 transition-colors cursor-pointer shadow-2xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ เพิ่มงานแรกเข้าสู่ระบบ</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Stacked Progress Bar */}
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
                {onHoldCount > 0 && (
                  <div
                    style={{ width: `${(onHoldCount / totalTasks) * 100}%` }}
                    className="bg-purple-500 rounded-xs transition-all"
                    title={`พัก/รอข้อมูล: ${onHoldCount}`}
                  />
                )}
                {completedCount > 0 && (
                  <div
                    style={{ width: `${(completedCount / totalTasks) * 100}%` }}
                    className="bg-emerald-600 rounded-xs transition-all"
                    title={`เสร็จสิ้น: ${completedCount}`}
                  />
                )}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <div>
                    <span className="text-slate-500 block text-[11px]">รอดำเนินการ</span>
                    <span className="font-bold text-slate-800 font-mono">{pendingCount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <div>
                    <span className="text-slate-500 block text-[11px]">ดำเนินการ</span>
                    <span className="font-bold text-blue-900 font-mono">{inProgressCount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div>
                    <span className="text-slate-500 block text-[11px]">รอติดตาม</span>
                    <span className="font-bold text-amber-800 font-mono">{followUpCount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <div>
                    <span className="text-slate-500 block text-[11px]">พัก/รอข้อมูล</span>
                    <span className="font-bold text-purple-800 font-mono">{onHoldCount}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <div>
                    <span className="text-slate-500 block text-[11px]">เสร็จสิ้น</span>
                    <span className="font-bold text-emerald-700 font-mono">{completedCount}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Category Breakdown Widget */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">จำแนกตามประเภทงาน</h2>
            <BarChart3 className="w-4 h-4 text-blue-900" />
          </div>

          {totalTasks === 0 ? (
            <div className="py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <BarChart3 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-700">ยังไม่มีข้อมูลการดำเนินงาน</p>
              <p className="text-[11px] text-slate-400 mt-1">กรุณาเพิ่มงานเพื่อเริ่มต้นใช้งานระบบ</p>
            </div>
          ) : (
            <div className="space-y-2.5 pt-1">
              {Object.entries(categoryCounts).map(([catName, count]) => {
                const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                return (
                  <div key={catName} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 truncate max-w-[160px]">{catName}</span>
                      <span className="font-mono text-slate-500 font-semibold">{count} งาน</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full bg-blue-900 rounded-full transition-all"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* ส่วนที่ 7: งานที่ต้องติดตามล่าสุด (Recent / Urgent Tasks Table) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              ส่วนที่ 7: งานที่ต้องติดตามล่าสุด
            </h2>
            <p className="text-xs text-slate-500">
              แสดง 6 รายการงานล่าสุดที่บันทึกหรือปรับปรุงในระบบเพื่อการติดตามอย่างต่อเนื่อง
            </p>
          </div>
          <button
            onClick={onNavigateToTasks}
            className="text-xs font-semibold text-blue-900 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>เปิดตารางจัดการงานทั้งหมด ({totalTasks} รายการ)</span>
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
                <th className="py-3 px-4">ผู้รับผิดชอบ</th>
                <th className="py-3 px-4">กำหนดติดตาม</th>
                <th className="py-3 px-4">สถานะ</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Inbox className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-700">ยังไม่มีข้อมูลการดำเนินงาน</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      กรุณาเพิ่มงานเพื่อเริ่มต้นใช้งานระบบ
                    </p>
                    {canAdd && (
                      <button
                        onClick={onOpenCreate}
                        className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>+ เพิ่มงานใหม่</span>
                      </button>
                    )}
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
                            className="p-1.5 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(userRole === 'admin' || userRole === 'staff') && (
                            <button
                              onClick={() => onEditTask(task)}
                              className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                              title="แก้ไข"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {userRole === 'admin' && (
                            <button
                              onClick={() => onDeleteTask(task)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
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
