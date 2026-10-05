import React from 'react';
import { ActiveTab, UserRole } from '../types';
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  Award,
  BookOpen,
  ShieldAlert,
  RotateCcw,
  Shield,
  GraduationCap,
  X,
  ExternalLink,
  History
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  userRole: UserRole;
  onResetDemo: () => void;
  taskCount: number;
  historyCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  userRole,
  onResetDemo,
  taskCount,
  historyCount = 0
}) => {
  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'ภาพรวมการดำเนินงาน',
      sub: 'Dashboard & สรุปสถานะ',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'tasks' as ActiveTab,
      label: 'จัดการรายการงาน',
      sub: `ตารางงานทั้งหมด (${taskCount})`,
      icon: <ClipboardList className="w-4 h-4" />
    },
    {
      id: 'history' as ActiveTab,
      label: 'ประวัติการดำเนินงาน',
      sub: `Timeline & บันทึกสถานะ (${historyCount})`,
      icon: <History className="w-4 h-4" />
    },
    {
      id: 'statistics' as ActiveTab,
      label: 'สถิติและรายงาน',
      sub: 'วิเคราะห์ข้อมูลเชิงตัวเลข',
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      id: 'evaluation' as ActiveTab,
      label: 'ประเมินการใช้งาน',
      sub: 'แบบประเมินโครงงาน CWIE',
      icon: <Award className="w-4 h-4" />
    },
    {
      id: 'guide' as ActiveTab,
      label: 'คู่มือการใช้งาน',
      sub: '5 ขั้นตอน & แนะนำภาพจอ',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      id: 'compliance' as ActiveTab,
      label: 'ข้อกำหนดและความปลอดภัย',
      sub: 'การคุ้มครองข้อมูล & PDPA',
      icon: <ShieldAlert className="w-4 h-4" />
    }
  ];

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-slate-950 text-white flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700/80 border border-blue-500/40 flex items-center justify-center text-white shadow-sm shrink-0">
              <Shield className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                SOTS PROTOTYPE
              </div>
              <div className="text-sm font-bold text-white leading-tight">
                ที่ทำการปกครองจังหวัดสงขลา
              </div>
              <div className="text-[11px] text-slate-400">กลุ่มงานความมั่นคง</div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="text-slate-400 hover:text-white p-1 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Academic CWIE Badge */}
        <div className="px-5 py-3 bg-blue-950/60 border-b border-blue-900/40 flex items-center gap-2.5">
          <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
          <div className="text-[11px] leading-tight">
            <span className="text-blue-300 font-semibold block">โครงงานพัฒนางาน CWIE</span>
            <span className="text-slate-400">นิสิตมหาวิทยาลัยทักษิณ</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            เมนูหลักของระบบ
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all ${
                  isActive
                    ? 'bg-blue-900 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    isActive ? 'bg-blue-800 text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.label}</div>
                  <div className="text-[10px] text-slate-400 truncate font-normal">
                    {item.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Utility Controls */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 space-y-3">
          {userRole === 'admin' && (
            <button
              onClick={onResetDemo}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
              title="กู้คืนข้อมูลตัวอย่าง 12 รายการ"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              รีเซ็ตข้อมูลตัวอย่าง (Reset Demo)
            </button>
          )}

          <div className="text-[10px] text-slate-500 text-center leading-relaxed">
            <span className="block font-semibold text-slate-400">
              SOTS Prototype | CWIE Project
            </span>
            <span>ต้นแบบเพื่อการศึกษา — ไม่ใช่ระบบราชการจริง</span>
          </div>
        </div>
      </aside>
    </>
  );
};
