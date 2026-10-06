import React, { useState, useMemo } from 'react';
import { Task, TaskCategory, TaskStatus } from '../types';
import {
  FileText,
  Calendar,
  Download,
  Printer,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Inbox,
  Filter,
  BarChart3,
  Layers,
  Building2,
  GraduationCap,
  Shield,
  Eye
} from 'lucide-react';
import {
  formatThaiDate,
  formatThaiDateFull,
  calculateDeadlineStatus,
  getDeadlineBadgeStyle,
  getStatusBadgeStyle,
  getDetailedDeadlineInfo
} from '../utils/dateUtils';

interface ReportsViewProps {
  tasks: Task[];
  onViewTask: (task: Task) => void;
  onPrintReportModal: () => void;
}

type DateRangePreset = 'today' | '7days' | 'this_month' | 'custom' | 'all';

export const ReportsView: React.FC<ReportsViewProps> = ({
  tasks,
  onViewTask,
  onPrintReportModal
}) => {
  const [datePreset, setDatePreset] = useState<DateRangePreset>('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Calculate range bounds
  const { start, end, rangeTitle } = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    if (datePreset === 'today') {
      return { start: todayStr, end: todayStr, rangeTitle: `วันนี้ (${formatThaiDate(todayStr)})` };
    }
    if (datePreset === '7days') {
      const past7 = new Date();
      past7.setDate(today.getDate() - 7);
      const past7Str = `${past7.getFullYear()}-${String(past7.getMonth() + 1).padStart(2, '0')}-${String(
        past7.getDate()
      ).padStart(2, '0')}`;
      return {
        start: past7Str,
        end: todayStr,
        rangeTitle: `7 วันที่ผ่านมา (${formatThaiDate(past7Str)} - ${formatThaiDate(todayStr)})`
      };
    }
    if (datePreset === 'this_month') {
      const monthStart = `${y}-${m}-01`;
      return {
        start: monthStart,
        end: todayStr,
        rangeTitle: `เดือนนี้ (${formatThaiDate(monthStart)} - ${formatThaiDate(todayStr)})`
      };
    }
    if (datePreset === 'custom') {
      return {
        start: customStartDate,
        end: customEndDate,
        rangeTitle:
          customStartDate || customEndDate
            ? `กำหนดช่วงวันที่ (${formatThaiDate(customStartDate) || 'เริ่มต้น'} ถึง ${
                formatThaiDate(customEndDate) || 'ปัจจุบัน'
              })`
            : 'กำหนดช่วงวันที่เอง'
      };
    }
    return { start: '', end: '', rangeTitle: 'ข้อมูลทั้งหมดในระบบ' };
  }, [datePreset, customStartDate, customEndDate]);

  // Filter tasks by date range and optional category/status filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Date filter based on receivedDate
      if (start && t.receivedDate < start) return false;
      if (end && t.receivedDate > end) return false;

      // Category filter
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;

      // Status filter
      if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;

      return true;
    });
  }, [tasks, start, end, selectedCategory, selectedStatus]);

  // Statistics
  const total = filteredTasks.length;
  const completed = filteredTasks.filter((t) => t.status === 'เสร็จสิ้น').length;
  const inProgress = filteredTasks.filter((t) => t.status === 'อยู่ระหว่างดำเนินการ').length;
  const followUp = filteredTasks.filter((t) => t.status === 'รอติดตาม').length;
  const received = filteredTasks.filter((t) => t.status === 'รับเรื่อง' || t.status === 'รอดำเนินการ').length;
  const assigned = filteredTasks.filter((t) => t.status === 'มอบหมาย').length;

  const overdue = filteredTasks.filter(
    (t) => calculateDeadlineStatus(t.deadline, t.status) === 'เกินกำหนด'
  ).length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Category counts
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredTasks.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [filteredTasks]);

  // Status counts
  const statusStats = [
    { label: 'รับเรื่อง', count: received, color: 'bg-slate-500', text: 'text-slate-700' },
    { label: 'มอบหมาย', count: assigned, color: 'bg-indigo-600', text: 'text-indigo-800' },
    { label: 'อยู่ระหว่างดำเนินการ', count: inProgress, color: 'bg-blue-600', text: 'text-blue-800' },
    { label: 'รอติดตาม', count: followUp, color: 'bg-amber-500', text: 'text-amber-800' },
    { label: 'เสร็จสิ้น', count: completed, color: 'bg-emerald-600', text: 'text-emerald-800' }
  ];

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'รหัสงาน',
      'วันที่รับเรื่อง',
      'ประเภทงาน',
      'ผู้รับผิดชอบ',
      'กำหนดติดตาม',
      'สถานะ',
      'สรุปการดำเนินงาน',
      'ระดับความสำคัญ'
    ];

    const rows = filteredTasks.map((t) => [
      `"${t.id}"`,
      `"${t.receivedDate}"`,
      `"${t.category}"`,
      `"${t.assignee}"`,
      `"${t.deadline}"`,
      `"${t.status}"`,
      `"${(t.summary || '').replace(/"/g, '""')}"`,
      `"${t.priority || 'ปกติ'}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOTS_Report_${datePreset}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Direct print view
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-medium">
              <FileText className="w-3.5 h-3.5 text-blue-300" />
              รายงานสรุปผลการดำเนินงาน
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              รายงานสรุปการดำเนินงาน (Executive Summary Report)
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา (ต้นแบบ CWIE มหาวิทยาลัยทักษิณ)
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/15 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onPrintReportModal}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report (พิมพ์รายงาน)</span>
            </button>
          </div>
        </div>

        {/* Date Presets Selector */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-300" />
            เลือกช่วงเวลา:
          </span>

          <button
            onClick={() => setDatePreset('today')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              datePreset === 'today'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            วันนี้
          </button>

          <button
            onClick={() => setDatePreset('7days')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              datePreset === '7days'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            7 วันที่ผ่านมา
          </button>

          <button
            onClick={() => setDatePreset('this_month')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              datePreset === 'this_month'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            เดือนนี้
          </button>

          <button
            onClick={() => setDatePreset('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              datePreset === 'all'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            ทั้งหมด
          </button>

          <button
            onClick={() => setDatePreset('custom')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              datePreset === 'custom'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'bg-white/10 text-slate-300 hover:bg-white/15'
            }`}
          >
            กำหนดช่วงวันที่เอง
          </button>

          {datePreset === 'custom' && (
            <div className="flex items-center gap-2 ml-2 mt-2 sm:mt-0">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-slate-800 text-white border border-slate-700 px-2.5 py-1 rounded-lg text-xs"
              />
              <span className="text-slate-400">ถึง</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-slate-800 text-white border border-slate-700 px-2.5 py-1 rounded-lg text-xs"
              />
            </div>
          )}
        </div>
      </div>

      {/* Official Printable Header for CWIE Documentation (Visible on Screen & Print) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-900 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
              <Shield className="w-7 h-7 text-blue-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                รายงานผลการบริหารจัดการและติดตามภารกิจความมั่นคง
              </h2>
              <p className="text-xs text-slate-500">
                กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา | ช่วงเวลา: <strong className="text-slate-800">{rangeTitle}</strong>
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            <div>พิมพ์เมื่อ: {formatThaiDateFull(new Date().toISOString().slice(0, 10))}</div>
            <div className="text-[11px] text-slate-400">เอกสารประกอบโครงงาน CWIE มหาวิทยาลัยทักษิณ</div>
          </div>
        </div>

        {/* 6 Key Performance Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-5">
          {/* Total Tasks */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <span className="text-xs text-slate-500 font-medium block">จำนวนงานทั้งหมด</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 mt-1">
              {total}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">ในรอบรายงาน</span>
          </div>

          {/* Completed */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <span className="text-xs text-emerald-700 font-medium block">งานเสร็จสิ้น</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-800 mt-1">
              {completed}
            </div>
            <span className="text-[10px] text-emerald-600 mt-0.5 block">ปิดภารกิจแล้ว</span>
          </div>

          {/* In Progress */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-center">
            <span className="text-xs text-blue-700 font-medium block">อยู่ระหว่างดำเนินการ</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-blue-800 mt-1">
              {inProgress}
            </div>
            <span className="text-[10px] text-blue-600 mt-0.5 block">กำลังปฏิบัติงาน</span>
          </div>

          {/* Follow-up */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <span className="text-xs text-amber-700 font-medium block">งานรอติดตาม</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-800 mt-1">
              {followUp}
            </div>
            <span className="text-[10px] text-amber-600 mt-0.5 block">รอผลตอบกลับ</span>
          </div>

          {/* Overdue */}
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
            <span className="text-xs text-rose-700 font-medium block">งานเกินกำหนด</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-rose-800 mt-1">
              {overdue}
            </div>
            <span className="text-[10px] text-rose-600 mt-0.5 block">ต้องเร่งรัดด่วน</span>
          </div>

          {/* Completion Rate */}
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
            <span className="text-xs text-indigo-700 font-medium block">อัตราการดำเนินงาน</span>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-indigo-800 mt-1">
              {completionRate}%
            </div>
            <span className="text-[10px] text-indigo-600 mt-0.5 block">สำเร็จแล้ว</span>
          </div>
        </div>

        {/* Charts & Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100">
          {/* Status Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Layers className="w-4 h-4 text-blue-900" />
              <span>สัดส่วนงานตามสถานะการดำเนินงาน</span>
            </div>
            <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              {statusStats.map((st) => {
                const pct = total > 0 ? Math.round((st.count / total) * 100) : 0;
                return (
                  <div key={st.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{st.label}</span>
                      <span className="font-mono text-slate-500">
                        {st.count} งาน ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full ${st.color} rounded-full transition-all`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <BarChart3 className="w-4 h-4 text-blue-900" />
              <span>สัดส่วนงานตามประเภทภารกิจ</span>
            </div>
            <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              {categoryStats.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  ไม่มีข้อมูลงานในช่วงเวลาที่เลือก
                </div>
              ) : (
                categoryStats.map(([catName, count]) => {
                  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={catName} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium text-slate-700">{catName}</span>
                        <span className="font-mono text-slate-500">
                          {count} งาน ({pct}%)
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-blue-900 rounded-full transition-all"
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Detailed Table of Tasks in Period */}
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <FileText className="w-4 h-4 text-blue-900" />
              <span>รายการงานในรอบรายงาน ({filteredTasks.length} รายการ)</span>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">รหัสงาน</th>
                    <th className="py-2.5 px-3">วันที่รับเรื่อง</th>
                    <th className="py-2.5 px-3">ประเภทงาน</th>
                    <th className="py-2.5 px-3">สรุปงาน</th>
                    <th className="py-2.5 px-3">ผู้รับผิดชอบ</th>
                    <th className="py-2.5 px-3">กำหนดติดตาม</th>
                    <th className="py-2.5 px-3">สถานะ</th>
                    <th className="py-2.5 px-3 text-right print:hidden">การกระทำ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400">
                        ไม่พบข้อมูลงานในช่วงเวลาที่เลือก
                      </td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => {
                      const deadlineBadge = getDeadlineBadgeStyle(
                        calculateDeadlineStatus(task.deadline, task.status)
                      );
                      const statusBadge = getStatusBadgeStyle(task.status);

                      return (
                        <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                            {task.id}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                            {formatThaiDate(task.receivedDate)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-800 whitespace-nowrap">
                            {task.category}
                          </td>
                          <td className="py-2.5 px-3 max-w-xs font-medium text-slate-900 line-clamp-1">
                            {task.summary}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                            {task.assignee}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="font-mono text-slate-700 block">
                              {formatThaiDate(task.deadline)}
                            </span>
                            <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded border ${deadlineBadge.bg}`}>
                              {deadlineBadge.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                              {task.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap print:hidden">
                            <button
                              onClick={() => onViewTask(task)}
                              className="p-1 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              title="ดูรายละเอียด"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
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

        {/* Academic / CWIE Certification Sign-off Block */}
        <div className="mt-8 pt-6 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs text-slate-600">
          <div className="space-y-10">
            <p className="text-slate-500">ผู้จัดทำรายงานโครงงาน CWIE</p>
            <div>
              <div className="border-b border-dotted border-slate-400 w-48 mx-auto" />
              <p className="mt-2 font-medium text-slate-800">( นายนิสิตผู้ปฏิบัติงาน CWIE )</p>
              <p className="text-[11px] text-slate-400 mt-0.5">นิสิตคณะวิทยาศาสตร์ มหาวิทยาลัยทักษิณ</p>
            </div>
          </div>

          <div className="space-y-10">
            <p className="text-slate-500">พนักงานที่ปรึกษา / ผู้ควบคุมการปฏิบัติงาน</p>
            <div>
              <div className="border-b border-dotted border-slate-400 w-48 mx-auto" />
              <p className="mt-2 font-medium text-slate-800">( .................................................... )</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                กลุ่มงานความมั่นคง ที่ทำการปกครองจังหวัดสงขลา
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 text-[11px] text-slate-400 text-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
          * ข้อมูลในรายงานนี้เป็นข้อมูลจำลองเพื่อการศึกษาโครงงาน CWIE มหาวิทยาลัยทักษิณ
          ยังไม่มีการนำไปใช้งานจริงในทางราชการ
        </div>
      </div>
    </div>
  );
};
