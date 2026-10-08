import React, { useState, useMemo } from 'react';
import { Task, TaskCategory, TaskStatus, UserRole } from '../types';
import {
  Search,
  Filter,
  RotateCcw,
  PlusCircle,
  Download,
  Printer,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';
import {
  formatThaiDate,
  calculateDeadlineStatus,
  getDeadlineBadgeStyle,
  getStatusBadgeStyle,
  getDetailedDeadlineInfo
} from '../utils/dateUtils';
import { exportTasksToCSV } from '../utils/storage';
import { GoogleSheetsBar, SheetsConnectionStatus } from './GoogleSheetsBar';
import { User as FirebaseUser } from 'firebase/auth';

interface TaskListProps {
  tasks: Task[];
  onOpenCreate: () => void;
  onViewTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onOpenPrint: () => void;
  onResetDemo: () => void;
  userRole: UserRole;
  sheetsStatus: SheetsConnectionStatus;
  googleUser: FirebaseUser | null;
  spreadsheetId: string | null;
  sheetLink?: string;
  sheetsErrorMessage?: string;
  onConnectSheets: () => void;
  onDisconnectSheets: () => void;
  onSyncSheets: () => void;
  initialUrgency?: string;
  initialStatus?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onOpenCreate,
  onViewTask,
  onEditTask,
  onDeleteTask,
  onOpenPrint,
  onResetDemo,
  userRole,
  sheetsStatus,
  googleUser,
  spreadsheetId,
  sheetLink,
  sheetsErrorMessage,
  onConnectSheets,
  onDisconnectSheets,
  onSyncSheets,
  initialUrgency = 'all',
  initialStatus = 'all'
}) => {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>(initialStatus);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>(initialUrgency);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'dateDesc' | 'dateAsc' | 'deadlineAsc' | 'codeAsc'>(
    'dateDesc'
  );

  React.useEffect(() => {
    if (initialUrgency) setSelectedUrgency(initialUrgency);
  }, [initialUrgency]);

  React.useEffect(() => {
    if (initialStatus) setSelectedStatus(initialStatus);
  }, [initialStatus]);

  const canAdd = userRole === 'admin' || userRole === 'staff';
  const canDelete = userRole === 'admin';
  const canReset = userRole === 'admin';

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search query
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchId = task.id.toLowerCase().includes(q);
          const matchCategory = task.category.toLowerCase().includes(q);
          const matchAssignee = task.assignee.toLowerCase().includes(q);
          const matchDepartment = task.department ? task.department.toLowerCase().includes(q) : false;
          const matchSummary = task.summary.toLowerCase().includes(q);
          const matchNotes = task.notes ? task.notes.toLowerCase().includes(q) : false;
          const matchStatus = task.status.toLowerCase().includes(q);

          if (
            !matchId &&
            !matchCategory &&
            !matchAssignee &&
            !matchDepartment &&
            !matchSummary &&
            !matchNotes &&
            !matchStatus
          ) {
            return false;
          }
        }

        // Status Filter
        if (selectedStatus !== 'all' && task.status !== selectedStatus) {
          return false;
        }

        // Category Filter
        if (selectedCategory !== 'all' && task.category !== selectedCategory) {
          return false;
        }

        // Urgency / Deadline Filter
        if (selectedUrgency !== 'all') {
          const detailedInfo = getDetailedDeadlineInfo(task.deadline, task.status);
          if (selectedUrgency === 'overdue' && detailedInfo.category !== 'overdue') return false;
          if (selectedUrgency === 'due_today' && detailedInfo.category !== 'due_today') return false;
          if (selectedUrgency === 'due_3_days' && detailedInfo.category !== 'due_3_days' && detailedInfo.category !== 'due_today') return false;
          if (selectedUrgency === 'due_7_days' && detailedInfo.category !== 'due_7_days') return false;
          if (selectedUrgency === 'normal' && detailedInfo.category !== 'normal' && detailedInfo.category !== 'completed') return false;
          if (selectedUrgency === 'dueSoon' && detailedInfo.category !== 'due_3_days' && detailedInfo.category !== 'due_today') return false;
          if (selectedUrgency === 'onTime' && detailedInfo.category !== 'normal' && detailedInfo.category !== 'completed') return false;
        }

        // Date Range Filter (Received Date)
        if (startDate && task.receivedDate < startDate) {
          return false;
        }
        if (endDate && task.receivedDate > endDate) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'dateDesc') {
          return new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime();
        }
        if (sortBy === 'dateAsc') {
          return new Date(a.receivedDate).getTime() - new Date(b.receivedDate).getTime();
        }
        if (sortBy === 'deadlineAsc') {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortBy === 'codeAsc') {
          return a.id.localeCompare(b.id);
        }
        return 0;
      });
  }, [tasks, searchTerm, selectedStatus, selectedCategory, selectedUrgency, startDate, endDate, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedCategory('all');
    setSelectedUrgency('all');
    setStartDate('');
    setEndDate('');
    setSortBy('dateDesc');
  };

  const handleExportCSV = () => {
    exportTasksToCSV(filteredTasks);
  };

  const isFiltered =
    searchTerm !== '' ||
    selectedStatus !== 'all' ||
    selectedCategory !== 'all' ||
    selectedUrgency !== 'all' ||
    startDate !== '' ||
    endDate !== '';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">จัดการรายการงาน</h1>
          <p className="text-xs text-slate-500 mt-1">
            ค้นหา ตรวจสอบความคืบหน้า บันทึกผล และส่งออกข้อมูลงานด้านความมั่นคง
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="ส่งออกเป็นไฟล์ CSV สำหรับเปิดใน Excel"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            ส่งออก CSV
          </button>

          <button
            onClick={onOpenPrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
            title="พิมพ์เอกสารรายงานสรุป"
          >
            <Printer className="w-4 h-4 text-blue-900" />
            พิมพ์รายงาน
          </button>

          {canReset && (
            <button
              onClick={onResetDemo}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
              title="รีเซ็ตเป็นข้อมูลตัวอย่างเริ่มต้น 12 รายการ"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              รีเซ็ตข้อมูลตัวอย่าง
            </button>
          )}

          {canAdd && (
            <button
              onClick={onOpenCreate}
              className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs sm:text-sm px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              + เพิ่มงานใหม่
            </button>
          )}
        </div>
      </div>

      {/* Google Sheets Connection Banner */}
      <GoogleSheetsBar
        status={sheetsStatus}
        user={googleUser}
        spreadsheetId={spreadsheetId}
        sheetLink={sheetLink}
        errorMessage={sheetsErrorMessage}
        onConnect={onConnectSheets}
        onDisconnect={onDisconnectSheets}
        onSync={onSyncSheets}
        variant="banner"
      />

      {/* Search & Filters Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ค้นหาจากรหัสงาน / ประเภทงาน / ผู้รับผิดชอบ / สาระสำคัญของงาน..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
            >
              ล้างคำค้น
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Status Filter */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">สถานะงาน</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="all">ทั้งหมดทุกสถานะ</option>
              <option value="รอดำเนินการ">รอดำเนินการ</option>
              <option value="อยู่ระหว่างดำเนินการ">อยู่ระหว่างดำเนินการ</option>
              <option value="รอติดตาม">รอติดตาม</option>
              <option value="เสร็จสิ้น">เสร็จสิ้น</option>
              <option value="พัก/รอข้อมูล">พัก/รอข้อมูล</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">ประเภทงาน</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="all">ทั้งหมดทุกประเภท</option>
              <option value="งานประสานงาน">งานประสานงาน</option>
              <option value="งานเอกสาร">งานเอกสาร</option>
              <option value="งานติดตามเรื่อง">งานติดตามเรื่อง</option>
              <option value="งานสนับสนุนการปฏิบัติงาน">งานสนับสนุนการปฏิบัติงาน</option>
              <option value="งานประชุม/ประสานหน่วยงาน">งานประชุม/ประสานหน่วยงาน</option>
              <option value="งานอื่น ๆ">งานอื่น ๆ</option>
            </select>
          </div>

          {/* Urgency / Due Date Filter */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">กำหนดติดตาม</label>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="all">ทั้งหมด</option>
              <option value="overdue">🔴 เกินกำหนด</option>
              <option value="due_today">🔴 ครบกำหนดวันนี้</option>
              <option value="due_3_days">🟠 ครบกำหนดภายใน 3 วัน</option>
              <option value="due_7_days">🟡 ครบกำหนดภายใน 7 วัน</option>
              <option value="normal">🟢 อยู่ในกำหนด</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-slate-500 font-semibold mb-1">เรียงลำดับตาม</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="dateDesc">วันที่รับเรื่อง (ล่าสุดก่อน)</option>
              <option value="dateAsc">วันที่รับเรื่อง (เก่าสุดก่อน)</option>
              <option value="deadlineAsc">กำหนดติดตาม (ใกล้สุดก่อน)</option>
              <option value="codeAsc">รหัสงาน (SEC-001...)</option>
            </select>
          </div>
        </div>

        {/* Date Range Row (ช่วงวันที่รับเรื่อง) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t border-slate-100">
          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              ช่วงวันที่รับเรื่อง (ตั้งแต่วันที่)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
          <div>
            <label className="block text-slate-500 font-semibold mb-1">
              ถึงวันที่
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>
        </div>

        {/* Filter Summary & Reset Action */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-100">
          <div>
            พบข้อมูลที่ตรงกับเงื่อนไข{' '}
            <strong className="text-slate-800 font-bold">{filteredTasks.length}</strong> จาก{' '}
            {tasks.length} รายการ
          </div>

          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-blue-900 hover:text-blue-700 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              รีเซ็ตตัวกรองทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* Main Task Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-24">รหัสงาน</th>
                <th className="py-3.5 px-4 w-28">วันที่รับเรื่อง</th>
                <th className="py-3.5 px-4 w-36">ประเภทงาน</th>
                <th className="py-3.5 px-4 min-w-[240px]">สรุปการดำเนินงาน / เรื่อง</th>
                <th className="py-3.5 px-4 w-44">ผู้รับผิดชอบ</th>
                <th className="py-3.5 px-4 w-32">กำหนดติดตาม</th>
                <th className="py-3.5 px-4 w-32">สถานะ</th>
                <th className="py-3.5 px-4 text-right w-28">การดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-base font-bold text-slate-700">ยังไม่มีรายการงาน</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      ระบบพร้อมสำหรับการบันทึกข้อมูล คลิกปุ่ม "+ เพิ่มงาน" เพื่อลงทะเบียนงานแรกเข้าสู่ระบบ
                    </p>
                    <button
                      onClick={onOpenCreate}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ เพิ่มงาน</span>
                    </button>
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">ไม่พบรายการงานที่ตรงกับเงื่อนไข</p>
                    <p className="text-xs text-slate-400 mt-1">
                      ลองปรับคำค้นหาหรือกดรีเซ็ตตัวกรอง
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const deadlineStatus = calculateDeadlineStatus(task.deadline, task.status);
                  const deadlineBadge = getDeadlineBadgeStyle(deadlineStatus);
                  const statusBadge = getStatusBadgeStyle(task.status);

                  return (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* รหัสงาน */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {task.id}
                      </td>

                      {/* วันที่รับเรื่อง */}
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatThaiDate(task.receivedDate)}
                      </td>

                      {/* ประเภทงาน */}
                      <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                          {task.category}
                        </span>
                      </td>

                      {/* สรุปการดำเนินงาน */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 leading-snug">
                          {task.summary}
                        </div>
                        {task.notes && (
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            หมายเหตุ: {task.notes}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400 mt-1">
                          ขั้นตอนที่ {task.workflowStep}/5
                        </div>
                      </td>

                      {/* ผู้รับผิดชอบ */}
                      <td className="py-3 px-4 text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[160px]" title={task.assignee}>
                            {task.assignee}
                          </span>
                        </div>
                      </td>

                      {/* กำหนดติดตาม */}
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

                      {/* สถานะ */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${statusBadge.bg} ${statusBadge.text} border ${statusBadge.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                          {task.status}
                        </span>
                      </td>

                      {/* การดำเนินการ */}
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
                              title="แก้ไขข้อมูล"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => onDeleteTask(task)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="ลบรายการ"
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
