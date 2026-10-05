import React from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  Unlink,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Database
} from 'lucide-react';
import { User } from 'firebase/auth';

export type SheetsConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'syncing'
  | 'sync_success'
  | 'error';

interface GoogleSheetsBarProps {
  status: SheetsConnectionStatus;
  user: User | null;
  spreadsheetId: string | null;
  sheetLink?: string;
  errorMessage?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onSync: () => void;
  variant?: 'banner' | 'header';
}

export const GoogleSheetsBar: React.FC<GoogleSheetsBarProps> = ({
  status,
  user,
  spreadsheetId,
  sheetLink,
  errorMessage,
  onConnect,
  onDisconnect,
  onSync,
  variant = 'banner'
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
      case 'sync_success':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            เชื่อมต่อ Google Sheets แล้ว
          </span>
        );
      case 'syncing':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
            กำลังซิงค์ข้อมูล...
          </span>
        );
      case 'connecting':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
            กำลังเชื่อมต่อ...
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            เกิดข้อผิดพลาด
          </span>
        );
      case 'disconnected':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            ยังไม่ได้เชื่อมต่อ (ใช้ข้อมูลในเครื่อง)
          </span>
        );
    }
  };

  // Header compact variant
  if (variant === 'header') {
    return (
      <div className="flex items-center gap-2">
        {getStatusBadge()}
        {status === 'disconnected' || status === 'error' ? (
          <button
            onClick={onConnect}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            title="เชื่อมต่อกับ Google Sheets SOTS_Database"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">เชื่อมต่อ Google Sheets</span>
            <span className="sm:hidden">ต่อ Sheets</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onSync}
              disabled={status === 'syncing'}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              title="ซิงค์ข้อมูลล่าสุดจาก Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status === 'syncing' ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">ซิงค์ข้อมูล</span>
            </button>
            <button
              onClick={onDisconnect}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-500 rounded-lg text-xs font-medium transition-colors"
              title="ยกเลิกการเชื่อมต่อ Google Sheets"
            >
              <Unlink className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">ยกเลิก</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // Full banner variant (used in TaskList or Dashboard)
  const isConnected = status === 'connected' || status === 'sync_success' || status === 'syncing';

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        isConnected
          ? 'bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-white border-emerald-200'
          : status === 'error'
          ? 'bg-rose-50/60 border-rose-200'
          : 'bg-slate-50 border-slate-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Status Info */}
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              isConnected
                ? 'bg-emerald-600 text-white'
                : status === 'error'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900">
                ฐานข้อมูล Google Sheets:
              </span>
              {getStatusBadge()}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {isConnected ? (
                <span>
                  ไฟล์ <strong>SOTS_Database</strong> / แผ่นงาน <strong>Tasks</strong>{' '}
                  {user?.email && (
                    <span className="text-slate-500">
                      (บัญชี: <u>{user.email}</u>)
                    </span>
                  )}
                </span>
              ) : (
                <span>
                  ระบบกำลังทำงานด้วย <strong>ข้อมูลจำลอง (LocalStorage)</strong>{' '}
                  คุณสามารถเชื่อมต่อกับ Google Sheets เพื่อใช้เป็นฐานข้อมูลกลางได้
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {isConnected ? (
            <>
              {sheetLink && (
                <a
                  href={sheetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-white border border-emerald-300 rounded-lg hover:bg-emerald-50 transition-colors shadow-2xs"
                  title="เปิดดูสเปรดชีตจริงบน Google Sheets"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                  เปิด Sheets
                </a>
              )}
              <button
                onClick={onSync}
                disabled={status === 'syncing'}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-blue-900 ${
                    status === 'syncing' ? 'animate-spin' : ''
                  }`}
                />
                ซิงค์ข้อมูล
              </button>
              <button
                onClick={onDisconnect}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-white border border-rose-200 rounded-lg hover:bg-rose-50 transition-colors shadow-2xs"
              >
                <Unlink className="w-3.5 h-3.5" />
                ยกเลิกการเชื่อมต่อ
              </button>
            </>
          ) : (
            <button
              onClick={onConnect}
              disabled={status === 'connecting'}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {status === 'connecting' ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อ Google Sheets'}
            </button>
          )}
        </div>
      </div>

      {/* Error Message Details if any */}
      {status === 'error' && errorMessage && (
        <div className="mt-3 p-2.5 rounded-lg bg-rose-100/70 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong>ข้อความแจ้งเตือน:</strong> {errorMessage}
            <span className="block text-[11px] text-rose-600 mt-0.5">
              (ระบบยังคงแสดงผลและใช้งานข้อมูลในเครื่องได้อย่างต่อเนื่อง ข้อมูลของคุณไม่สูญหาย)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
