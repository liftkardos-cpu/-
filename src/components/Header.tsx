import React from 'react';
import { UserRole } from '../types';
import { ROLES } from '../data/mockData';
import {
  Menu,
  PlusCircle,
  Shield,
  UserCheck,
  Calendar,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Unlink,
  Loader2,
  BellRing
} from 'lucide-react';
import { formatThaiDateFull } from '../utils/dateUtils';
import { SheetsConnectionStatus } from './GoogleSheetsBar';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenCreate: () => void;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  sheetsStatus: SheetsConnectionStatus;
  onConnectSheets: () => void;
  onDisconnectSheets: () => void;
  onSyncSheets: () => void;
  onOpenDeadlineAlerts?: () => void;
  urgentAlertCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenCreate,
  userRole,
  onChangeRole,
  sheetsStatus,
  onConnectSheets,
  onDisconnectSheets,
  onSyncSheets,
  onOpenDeadlineAlerts,
  urgentAlertCount = 0
}) => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const currentRoleInfo = ROLES[userRole];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & System Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
            aria-label="เปิดเมนู"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                ระบบสนับสนุนการติดตามงานด้านความมั่นคง
              </h1>
              <span className="hidden sm:inline-block bg-blue-900 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                ต้นแบบ
              </span>
            </div>
            <div className="text-xs font-semibold text-blue-950">
              Security Work Tracking and Support System (SOTS)
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              ต้นแบบเพื่อการศึกษา CWIE — ไม่ใช่ระบบราชการอย่างเป็นทางการ
            </div>
          </div>
        </div>

        {/* Right: Date, Sheets Controls, Role Switcher, Quick Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Current Date Widget (Hidden on small mobile) */}
          <div className="hidden 2xl:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-blue-900" />
            <span>วันนี้: {formatThaiDateFull(todayStr)}</span>
          </div>

          {/* In-App Deadline Alert Notification Bell */}
          {onOpenDeadlineAlerts && (
            <button
              onClick={onOpenDeadlineAlerts}
              className="relative p-2 text-slate-600 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
              title="การแจ้งเตือนกำหนดติดตามงาน"
            >
              <BellRing className="w-4 h-4" />
              {urgentAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-mono text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {urgentAlertCount > 9 ? '9+' : urgentAlertCount}
                </span>
              )}
            </button>
          )}

          {/* Google Sheets Connection Button in Header */}
          {sheetsStatus === 'connected' || sheetsStatus === 'sync_success' || sheetsStatus === 'syncing' ? (
            <div className="flex items-center gap-1 bg-emerald-50/80 border border-emerald-200 px-2 py-1 rounded-lg">
              <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 pr-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                ต่อ Sheets แล้ว
              </span>
              <button
                onClick={onSyncSheets}
                disabled={sheetsStatus === 'syncing'}
                className="p-1 text-slate-600 hover:text-blue-900 rounded transition-colors"
                title="ซิงค์ข้อมูล Google Sheets"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${sheetsStatus === 'syncing' ? 'animate-spin text-blue-600' : ''}`}
                />
              </button>
              <button
                onClick={onDisconnectSheets}
                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                title="ยกเลิกการเชื่อมต่อ Google Sheets"
              >
                <Unlink className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onConnectSheets}
              disabled={sheetsStatus === 'connecting'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs disabled:opacity-50"
              title="เชื่อมต่อฐานข้อมูล Google Sheets"
            >
              {sheetsStatus === 'connecting' ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">เชื่อมต่อ Google Sheets</span>
              <span className="sm:hidden">ต่อ Sheets</span>
            </button>
          )}

          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
            <UserCheck className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
            <span className="text-[11px] text-slate-500 font-medium hidden md:inline">
              สิทธิ์:
            </span>
            <select
              value={userRole}
              onChange={(e) => onChangeRole(e.target.value as UserRole)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              title="สลับสิทธิ์การใช้งานเพื่อทดสอบการทำงาน"
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          {/* Quick Add Button */}
          {(userRole === 'admin' || userRole === 'staff') && (
            <button
              onClick={onOpenCreate}
              className="flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg transition-colors shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">+ เพิ่มงานใหม่</span>
              <span className="sm:hidden">+ เพิ่ม</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
