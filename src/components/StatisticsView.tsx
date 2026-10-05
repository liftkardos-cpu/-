import React from 'react';
import { Task } from '../types';
import {
  BarChart3,
  PieChart,
  CheckCircle2,
  Clock,
  Briefcase,
  Users,
  Shield,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { calculateDeadlineStatus } from '../utils/dateUtils';

interface StatisticsViewProps {
  tasks: Task[];
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({ tasks }) => {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === 'เสร็จสิ้น').length;
  const inProgress = tasks.filter((t) => t.status === 'อยู่ระหว่างดำเนินการ').length;
  const pending = tasks.filter((t) => t.status === 'รอดำเนินการ').length;
  const followUp = tasks.filter((t) => t.status === 'รอติดตาม').length;
  const onHold = tasks.filter((t) => t.status === 'พัก/รอข้อมูล').length;

  const overdue = tasks.filter(
    (t) => calculateDeadlineStatus(t.deadline, t.status) === 'เกินกำหนด'
  ).length;
  const dueSoon = tasks.filter(
    (t) => calculateDeadlineStatus(t.deadline, t.status) === 'ใกล้ถึงกำหนด'
  ).length;
  const onTime = total - overdue - dueSoon;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const onTimeRate = total > 0 ? Math.round(((total - overdue) / total) * 100) : 100;

  // Category counts
  const categoryMap: Record<string, number> = {};
  tasks.forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + 1;
  });

  const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  // Officer / Assignee distribution
  const assigneeMap: Record<string, number> = {};
  tasks.forEach((t) => {
    // simplified short name
    const shortName = t.assignee.split('(')[0].trim();
    assigneeMap[shortName] = (assigneeMap[shortName] || 0) + 1;
  });

  const assignees = Object.entries(assigneeMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-900" />
          สถิติการดำเนินงานด้านความมั่นคง
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          รายงานวิเคราะห์ข้อมูลงานเชิงตัวเลข สำหรับประกอบรายงานผลการดำเนินงานโครงงาน CWIE
        </p>
      </div>

      {/* KPI Performance Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">
            อัตรางานที่ดำเนินการสำเร็จ
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600 font-mono">
              {completionRate}%
            </span>
            <span className="text-xs text-slate-400">({completed}/{total} งาน)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">
            อัตราการดำเนินงานตามกำหนด
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-900 font-mono">
              {onTimeRate}%
            </span>
            <span className="text-xs text-slate-400">ไม่เกินกำหนด</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-blue-900 h-full rounded-full transition-all"
              style={{ width: `${onTimeRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">
            งานที่กำลังขับเคลื่อนอยู่
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600 font-mono">
              {inProgress + followUp}
            </span>
            <span className="text-xs text-slate-400">รายการงาน</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            (อยู่ระหว่างดำเนินการ {inProgress} + รอติดตาม {followUp})
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">
            งานที่ต้องเร่งรัดติดตาม
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-600 font-mono">
              {overdue}
            </span>
            <span className="text-xs text-rose-500 font-medium">เกินกำหนด</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            มีงานใกล้ถึงกำหนดอีก {dueSoon} รายการ
          </p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Status Distribution Bar Chart */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-900" />
              1. การกระจายตัวของสถานะงาน
            </h2>
            <span className="text-xs text-slate-400">จำนวนรายการ</span>
          </div>

          <div className="space-y-3.5 pt-2">
            {/* รอดำเนินการ */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-600">รอดำเนินการ</span>
                <span className="font-mono text-slate-800">
                  {pending} งาน ({total > 0 ? Math.round((pending / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-slate-400 h-full rounded-full transition-all"
                  style={{ width: `${total > 0 ? (pending / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* อยู่ระหว่างดำเนินการ */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-blue-900">อยู่ระหว่างดำเนินการ</span>
                <span className="font-mono text-slate-800">
                  {inProgress} งาน ({total > 0 ? Math.round((inProgress / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${total > 0 ? (inProgress / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* รอติดตาม */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-amber-700">รอติดตาม</span>
                <span className="font-mono text-slate-800">
                  {followUp} งาน ({total > 0 ? Math.round((followUp / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${total > 0 ? (followUp / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* เสร็จสิ้น */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-emerald-700">เสร็จสิ้นแล้ว</span>
                <span className="font-mono text-slate-800">
                  {completed} งาน ({total > 0 ? Math.round((completed / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* พัก/รอข้อมูล */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-purple-700">พัก/รอข้อมูล</span>
                <span className="font-mono text-slate-800">
                  {onHold} งาน ({total > 0 ? Math.round((onHold / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all"
                  style={{ width: `${total > 0 ? (onHold / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-900" />
              2. สัดส่วนงานตามประเภท
            </h2>
            <span className="text-xs text-slate-400">จำแนกตามภารกิจ</span>
          </div>

          <div className="space-y-3 pt-2">
            {categories.map(([category, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{category}</span>
                    <span className="font-mono text-slate-800 font-semibold">
                      {count} งาน ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-700 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Officer Workload Distribution */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-900" />
              3. ปริมาณงานรายเจ้าหน้าที่ผู้รับผิดชอบ
            </h2>
            <span className="text-xs text-slate-400">ชื่อสมมติในระบบ</span>
          </div>

          <div className="space-y-3 pt-2">
            {assignees.map(([name, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 truncate max-w-[240px]">
                      {name}
                    </span>
                    <span className="font-mono text-slate-800 font-semibold">{count} งาน</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-800 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 4: Deadline Performance Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-900" />
              4. สถานะการควบคุมกำหนดเวลา
            </h2>
            <span className="text-xs text-slate-400">วิเคราะห์ตามความเร่งด่วน</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                ตามกำหนดเวลา
              </span>
              <span className="font-mono font-bold text-slate-800">{onTime} รายการ</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-amber-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                ใกล้ถึงกำหนด (ภายใน 3 วัน)
              </span>
              <span className="font-mono font-bold text-slate-800">{dueSoon} รายการ</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-rose-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                เกินกำหนดส่งงาน
              </span>
              <span className="font-mono font-bold text-slate-800">{overdue} รายการ</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            * สถิตินี้สร้างขึ้นจากระบบต้นแบบ SOTS เพื่อใช้เป็นกรณีศึกษาในการติดตามงานทางราชการ
            ช่วยให้ผู้บังคับบัญชาและเจ้าหน้าที่สามารถเร่งรัดงานได้อย่างตรงจุด
          </p>
        </div>
      </div>
    </div>
  );
};
