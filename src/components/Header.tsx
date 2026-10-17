import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  Bell, 
  GraduationCap, 
  LogOut, 
  Users, 
  Database, 
  CheckCircle2, 
  AlertCircle,
  Menu,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onOpenSheetsConfig: () => void;
  onOpenNotifications: () => void;
  activeTabTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenSheetsConfig,
  onOpenNotifications,
  activeTabTitle
}) => {
  const { currentUser, role, switchUser, allUsers, logout } = useAuth();
  const { config, state } = useData();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = state.Notifications.filter(
    n => n.user_id === currentUser?.user_id && !n.is_read
  ).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 md:gap-8 px-4 md:px-8 py-3.5 bg-white border-b border-slate-200">
      {/* Zone 1: Brand & Sidebar Toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-600 rounded-lg md:hidden hover:bg-slate-100 transition-colors"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-700 text-white font-bold shadow-sm">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            KELAS DIGITAL
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Context & Sheets Status */}
      <div className="hidden sm:flex items-center gap-4 text-xs text-slate-500 whitespace-nowrap overflow-hidden">
        <span className="font-medium text-slate-900">{activeTabTitle}</span>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <button
          onClick={onOpenSheetsConfig}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
            config.isConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
          title="Klik untuk konfigurasi integrasi Google Sheets"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{config.isConnected ? 'Google Sheets Terhubung' : 'Penyimpanan Lokal (Mode Demo)'}</span>
        </button>
        <span aria-hidden="true" className="text-slate-300">·</span>
        <span className="text-slate-600">TA 2025/2026 Genap</span>
      </div>

      {/* Zone 3: Actions & Account Profile */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Pemberitahuan"
          title="Pemberitahuan"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-bold text-white bg-red-600 rounded-full">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Profile Dropdown & Fast Demo Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white ${
              role === 'GURU' ? 'bg-indigo-600' : 'bg-teal-600'
            }`}>
              {currentUser?.nama.charAt(0) || 'U'}
            </div>
            <div className="hidden lg:block text-left text-xs leading-tight">
              <div className="font-semibold text-slate-900 truncate max-w-[140px]">{currentUser?.nama}</div>
              <div className="text-slate-500 font-medium">{role === 'GURU' ? 'Guru Pengajar' : 'Murid'}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showUserMenu && (
            <div 
              className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
              onMouseLeave={() => setShowUserMenu(false)}
            >
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">{currentUser?.nama}</p>
                <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
                <div className="mt-1.5 inline-block text-[11px] font-medium text-slate-600">
                  Peran Aktif: <strong className={role === 'GURU' ? 'text-indigo-600' : 'text-teal-600'}>{role}</strong>
                </div>
              </div>

              {/* Quick switch to experience both Guru and Murid */}
              <div className="px-3 py-2 border-b border-slate-100 bg-slate-50/50">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Ganti Akun Cepat (Uji Peran)
                </p>
                <div className="space-y-1">
                  {allUsers.slice(0, 4).map(u => (
                    <button
                      key={u.user_id}
                      onClick={() => {
                        switchUser(u.user_id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-md text-left transition-colors ${
                        u.user_id === currentUser?.user_id
                          ? 'bg-blue-50 text-blue-800 font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="truncate">{u.nama}</span>
                      <span className="text-[10px] text-slate-500 shrink-0 uppercase ml-2">{u.role}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={() => {
                    onOpenSheetsConfig();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-100 text-left"
                >
                  <Database className="w-4 h-4 text-slate-500" />
                  <span>Koneksi Google Sheets</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-left font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
