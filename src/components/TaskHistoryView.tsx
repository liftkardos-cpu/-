import React, { useState, useMemo } from 'react';
import { Task, TaskHistoryItem, UserRole, AuditActionType } from '../types';
import {
  History,
  Search,
  RotateCcw,
  Download,
  Clock,
  User,
  ArrowRight,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
  Activity,
  Layers,
  Filter,
  ShieldCheck,
  Edit,
  Trash2,
  PlusCircle,
  Calendar
} from 'lucide-react';
import { formatThaiDateTime, getStatusBadgeStyle } from '../utils/dateUtils';
import { exportHistoryToCSV } from '../utils/storage';
import { SheetsConnectionStatus } from './GoogleSheetsBar';

interface TaskHistoryViewProps {
  history: TaskHistoryItem[];
  tasks: Task[];
  onViewTask: (task: Task) => void;
  userRole: UserRole;
  sheetsStatus: SheetsConnectionStatus;
  sheetLink?: string;
  onSyncSheets?: () => void;
}

export const TaskHistoryView: React.FC<TaskHistoryViewProps> = ({
  history,
  tasks,
  onViewTask,
  userRole,
  sheetsStatus,
  sheetLink,
  onSyncSheets
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');

  // Filtered history / audit logs
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTask = item.taskId.toLowerCase().includes(q);
        const matchOperator = item.operator.toLowerCase().includes(q);
        const matchDetails = item.details.toLowerCase().includes(q);
        const matchPrev = (item.previousStatus || '').toLowerCase().includes(q);
        const matchNew = (item.newStatus || '').toLowerCase().includes(q);
        const matchAction = (item.action || '').toLowerCase().includes(q);
        if (!matchTask && !matchOperator && !matchDetails && !matchPrev && !matchNew && !matchAction) {
          return false;
        }
      }

      // Task ID filter
      if (selectedTaskId !== 'all' && item.taskId !== selectedTaskId) {
        return false;
      }

      // Action filter
      if (selectedAction !== 'all') {
        const act = item.action || 'เปลี่ยนสถานะ';
        if (act !== selectedAction) return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (item.newStatus !== selectedStatus && item.previousStatus !== selectedStatus) {
          return false;
        }
      }

      return true;
    });
  }, [history, searchQuery, selectedTaskId, selectedStatus, selectedAction]);

  // Unique tasks present in history for dropdown
  const uniqueTaskIds = useMemo(() => {
    const ids = Array.from(new Set(history.map((h) => h.taskId))).filter(Boolean);
    return ids.sort();
  }, [history]);

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTaskId('all');
    setSelectedStatus('all');
    setSelectedAction('all');
  };

  const hasActiveFilters =
    searchQuery !== '' || selectedTaskId !== 'all' || selectedStatus !== 'all' || selectedAction !== 'all';

  const handleExportCSV = () => {
    exportHistoryToCSV(filteredHistory);
  };

  // Metrics
  const uniqueTasksCount = new Set(history.map((h) => h.taskId)).size;
  const statusTransitions = history.filter((h) => (h.action || 'เปลี่ยนสถานะ') === 'เปลี่ยนสถานะ').length;
  const editsCount = history.filter((h) => h.action === 'แก้ไขงาน' || h.action === 'เพิ่มงาน').length;
  const completedTransitions = history.filter((h) => h.newStatus === 'เสร็จสิ้น').length;

  const renderActionBadge = (action?: AuditActionType | string) => {
    const act = action || 'เปลี่ยนสถานะ';
    switch (act) {
      case 'เพิ่มงาน':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
            <PlusCircle className="w-3 h-3 text-emerald-600" />
            เพิ่มงานใหม่
          </span>
        );
      case 'แก้ไขงาน':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
            <Edit className="w-3 h-3 text-blue-600" />
            แก้ไขงาน
          </span>
        );
      case 'ลบงาน':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
            <Trash2 className="w-3 h-3 text-rose-600" />
            ลบงาน
          </span>
        );
      case 'เปลี่ยนกำหนดติดตาม':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
            <Calendar className="w-3 h-3 text-amber-600" />
            เปลี่ยนกำหนดติดตาม
          </span>
        );
      case 'เปลี่ยนผู้รับผิดชอบ':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
            <User className="w-3 h-3 text-purple-600" />
            เปลี่ยนผู้รับผิดชอบ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
            <ArrowRight className="w-3 h-3 text-indigo-600" />
            เปลี่ยนสถานะ
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Google Sheets Integration Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg">
                <History className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">
                ประวัติการดำเนินงาน (Task History & Workflow Logs)
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              บันทึกทุกขั้นตอนการเปลี่ยนแปลงสถานะงานโดยอัตโนมัติ พร้อมชื่อผู้ดำเนินการ วันเวลา และหมายเหตุ
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {sheetsStatus === 'connected' && sheetLink && (
              <a
                href={sheetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors"
                title="เปิดแผ่นงาน Task_History ใน Google Sheets"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>เปิดดู Sheet "Task_History"</span>
              </a>
            )}

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
              title="ส่งออกประวัติเป็นไฟล์ CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ส่งออก CSV</span>
            </button>
          </div>
        </div>

        {/* Sync Status Banner */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">แหล่งข้อมูลประวัติ:</span>
            {sheetsStatus === 'connected' ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Google Sheets (SOTS_Database / แผ่นงาน Task_History)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                ฐานข้อมูลจำลองในเครื่อง (LocalStorage)
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400">
            ระบบจะบันทึกประวัติให้อัตโนมัติทุกครั้งเมื่อมีการเปลี่ยนสถานะงาน
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">บันทึกประวัติทั้งหมด</span>
            <History className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{history.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">รายการเปลี่ยนแปลงสถานะ</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">งานที่มีการขยับสถานะ</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-900">{uniqueTasksCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">จากงานทั้งหมด {tasks.length} รายการ</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">ปิดงานเสร็จสิ้น</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{completedTransitions}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">สถานะเปลี่ยนเป็น "เสร็จสิ้น"</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">การเคลื่อนไหวล่าสุด</span>
            <Activity className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xs font-semibold text-slate-800 truncate">
            {history[0]?.taskId || '-'}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
            {history[0] ? formatThaiDateTime(history[0].timestamp) : 'ยังไม่มีประวัติ'}
          </div>
        </div>
      </div>

      {/* Filter and View Mode Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหารหัสงาน, ผู้ดำเนินการ, สถานะ, หรือรายละเอียด..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:bg-white"
            />
          </div>

          {/* Task ID filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 whitespace-nowrap">รหัสงาน:</label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="all">ทุกรหัสงาน ({history.length})</option>
              {uniqueTaskIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 whitespace-nowrap">สถานะ:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="รับเรื่อง">รับเรื่อง</option>
              <option value="มอบหมาย">มอบหมาย</option>
              <option value="อยู่ระหว่างดำเนินการ">อยู่ระหว่างดำเนินการ</option>
              <option value="รอติดตาม">รอติดตาม</option>
              <option value="เสร็จสิ้น">เสร็จสิ้น</option>
            </select>
          </div>

          {/* Action filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 whitespace-nowrap">การดำเนินการ:</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="all">ทุกการดำเนินการ</option>
              <option value="เพิ่มงาน">เพิ่มงาน</option>
              <option value="แก้ไขงาน">แก้ไขงาน</option>
              <option value="เปลี่ยนสถานะ">เปลี่ยนสถานะ</option>
              <option value="เปลี่ยนกำหนดติดตาม">เปลี่ยนกำหนดติดตาม</option>
              <option value="เปลี่ยนผู้รับผิดชอบ">เปลี่ยนผู้รับผิดชอบ</option>
              <option value="ลบงาน">ลบงาน</option>
            </select>
          </div>

          {/* View toggle */}
          <div className="flex items-center border border-slate-300 rounded-lg p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-white text-blue-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ไทม์ไลน์
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-blue-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ตารางข้อมูล (6 คอลัมน์)
            </button>
          </div>

          {/* Reset filter */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ล้างตัวกรอง</span>
            </button>
          )}
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-between">
          <span>
            แสดงผล <strong>{filteredHistory.length}</strong> จากทั้งหมด {history.length} รายการ
          </span>
          {hasActiveFilters && (
            <span className="text-blue-700 font-medium">กำลังกรองข้อมูล</span>
          )}
        </div>
      </div>

      {/* Main Content: Timeline or Table */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">ไม่พบประวัติการดำเนินงานที่ตรงกับเงื่อนไข</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            ลองปรับเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองเพื่อดูประวัติการดำเนินงานทั้งหมด
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 text-xs font-medium text-blue-900 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ล้างตัวกรองทั้งหมด</span>
            </button>
          )}
        </div>
      ) : viewMode === 'timeline' ? (
        /* Timeline View */
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="relative border-l-2 border-slate-200 ml-4 pl-6 space-y-8">
            {filteredHistory.map((item, index) => {
              const prevStyle = getStatusBadgeStyle(item.previousStatus);
              const newStyle = getStatusBadgeStyle(item.newStatus);
              const matchedTask = tasks.find((t) => t.id === item.taskId);

              return (
                <div key={item.id || index} className="relative group">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                      item.newStatus === 'เสร็จสิ้น'
                        ? 'bg-emerald-600'
                        : item.newStatus === 'รอติดตาม'
                        ? 'bg-amber-500'
                        : item.newStatus === 'อยู่ระหว่างดำเนินการ'
                        ? 'bg-blue-600'
                        : 'bg-indigo-600'
                    }`}
                  />

                  {/* Card Content */}
                  <div className="bg-slate-50/80 hover:bg-slate-50 border border-slate-200/90 rounded-xl p-4 transition-all">
                    {/* Top Row: Date, Task ID, Action Badge & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-blue-950 bg-blue-100/80 px-2.5 py-0.5 rounded border border-blue-200">
                          {item.taskId}
                        </span>
                        {renderActionBadge(item.action)}
                        {matchedTask && (
                          <span className="text-xs text-slate-600 font-medium hidden sm:inline truncate max-w-xs">
                            — {matchedTask.summary}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatThaiDateTime(item.timestamp)}</span>
                        </div>

                        {matchedTask && (
                          <button
                            onClick={() => onViewTask(matchedTask)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-900 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 px-2 py-1 rounded transition-colors cursor-pointer"
                            title="ดูรายละเอียดงานนี้"
                          >
                            <Eye className="w-3 h-3" />
                            <span>ดูงาน</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Old Value vs New Value Transition flow */}
                    <div className="flex items-center gap-2 flex-wrap my-2.5 text-xs bg-white/70 p-2.5 rounded-lg border border-slate-200/60">
                      <span className="text-slate-500 font-medium">
                        {item.action === 'เปลี่ยนผู้รับผิดชอบ'
                          ? 'ผู้รับผิดชอบเดิม:'
                          : item.action === 'เปลี่ยนกำหนดติดตาม'
                          ? 'กำหนดเดิม:'
                          : 'ข้อมูล/สถานะเดิม:'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium ${prevStyle.bg} ${prevStyle.text} border ${prevStyle.border}`}
                      >
                        {item.previousValue || item.previousStatus || '-'}
                      </span>

                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                      <span className="text-slate-500 font-medium">
                        {item.action === 'เปลี่ยนผู้รับผิดชอบ'
                          ? 'ผู้รับผิดชอบใหม่:'
                          : item.action === 'เปลี่ยนกำหนดติดตาม'
                          ? 'กำหนดใหม่:'
                          : 'ข้อมูล/สถานะใหม่:'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold ${newStyle.bg} ${newStyle.text} border ${newStyle.border}`}
                      >
                        {item.newValue || item.newStatus || '-'}
                      </span>
                    </div>

                    {/* Details / Remark */}
                    <div className="mt-2 text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200/70">
                      <span className="font-semibold text-slate-800">รายละเอียด/หมายเหตุ: </span>
                      <span className="text-slate-600">{item.details || '-'}</span>
                    </div>

                    {/* Operator */}
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>ผู้ดำเนินการ:</span>
                        <span className="font-medium text-slate-700">{item.operator || 'เจ้าหน้าที่'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Table View matching Google Sheets (A = วันที่และเวลา, B = รหัสงาน, C = สถานะเดิม, D = สถานะใหม่, E = ผู้ดำเนินการ, F = รายละเอียด/หมายเหตุ) */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">วันที่และเวลา (A)</th>
                  <th className="py-3 px-4 font-semibold">รหัสงาน (B)</th>
                  <th className="py-3 px-4 font-semibold">การดำเนินการ</th>
                  <th className="py-3 px-4 font-semibold">ข้อมูลเดิม (C)</th>
                  <th className="py-3 px-4 font-semibold">ข้อมูลใหม่ (D)</th>
                  <th className="py-3 px-4 font-semibold">ผู้ดำเนินการ (E)</th>
                  <th className="py-3 px-4 font-semibold">รายละเอียด/หมายเหตุ (F)</th>
                  <th className="py-3 px-4 font-semibold text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredHistory.map((item, idx) => {
                  const prevStyle = getStatusBadgeStyle(item.previousStatus);
                  const newStyle = getStatusBadgeStyle(item.newStatus);
                  const matchedTask = tasks.find((t) => t.id === item.taskId);

                  return (
                    <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        {formatThaiDateTime(item.timestamp)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-blue-900">
                        {item.taskId}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {renderActionBadge(item.action)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${prevStyle.bg} ${prevStyle.text} border ${prevStyle.border}`}
                        >
                          {item.previousValue || item.previousStatus || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${newStyle.bg} ${newStyle.text} border ${newStyle.border}`}
                        >
                          {item.newValue || item.newStatus || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-700">
                        {item.operator}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={item.details}>
                        {item.details || '-'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {matchedTask ? (
                          <button
                            onClick={() => onViewTask(matchedTask)}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-900 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>ดูงาน</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
