import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  CheckSquare,
  Users2,
  FileQuestion,
  Sparkles,
  MailCheck,
  BarChart3,
  Settings,
  X,
  PlusCircle,
  LogIn
} from 'lucide-react';

export type NavTab = 
  | 'dashboard'
  | 'classes'
  | 'materials'
  | 'assignments'
  | 'peer_assessments'
  | 'formative'
  | 'reflections'
  | 'leave_requests'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose
}) => {
  const { currentUser, role } = useAuth();
  const { state } = useData();

  // Calculate badge counts
  const pendingLeavesCount = role === 'GURU'
    ? state.LeaveRequests.filter(l => l.status === 'menunggu').length
    : state.LeaveRequests.filter(l => l.student_id === currentUser?.user_id && l.status === 'menunggu').length;

  const pendingAssignmentsCount = role === 'MURID'
    ? state.Assignments.filter(a => {
        const hasSub = state.Submissions.some(
          s => s.assignment_id === a.assignment_id && s.student_id === currentUser?.user_id && s.status !== 'draf'
        );
        return !hasSub && a.status === 'dipublikasikan';
      }).length
    : state.Submissions.filter(s => s.status === 'dikumpulkan' || s.status === 'sedang_dinilai').length;

  const pendingPeerCount = role === 'MURID'
    ? state.PeerAssessmentAssignments.filter(
        pa => pa.evaluator_id === currentUser?.user_id && pa.status === 'belum'
      ).length
    : 0;

  const menuItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'classes', label: 'Kelas Saya', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'materials', label: 'Materi Pembelajaran', icon: <FileText className="w-4 h-4" /> },
    { id: 'assignments', label: 'Tugas & Pengumpulan', icon: <CheckSquare className="w-4 h-4" />, badge: pendingAssignmentsCount },
    { id: 'peer_assessments', label: 'Asesmen Praktik', icon: <Users2 className="w-4 h-4" />, badge: pendingPeerCount },
    { id: 'formative', label: 'Asesmen Formatif', icon: <FileQuestion className="w-4 h-4" /> },
    { id: 'reflections', label: 'Refleksi Pembelajaran', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'leave_requests', label: 'Surat Izin Murid', icon: <MailCheck className="w-4 h-4" />, badge: pendingLeavesCount },
    { id: 'reports', label: 'Nilai dan Laporan', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: 'Pengaturan & Sheets', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 md:w-68 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header in Sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 md:hidden">
          <span className="font-bold text-slate-900">KELAS DIGITAL</span>
          <button onClick={onClose} className="p-1 text-slate-500 hover:bg-slate-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
              role === 'GURU' ? 'bg-indigo-600' : 'bg-teal-600'
            }`}>
              {currentUser?.nama.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-slate-900 truncate">
                {currentUser?.nama}
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${role === 'GURU' ? 'bg-indigo-500' : 'bg-teal-500'}`} />
                <span className="capitalize">{role === 'GURU' ? 'Guru Pengajar' : 'Murid'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className={isActive ? 'text-blue-700' : 'text-slate-500'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full tabular-nums ${
                    isActive ? 'bg-blue-200 text-blue-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400">
          <div className="flex items-center justify-between">
            <span>KELAS DIGITAL v1.0</span>
            <span className="font-mono">Google Sheets API</span>
          </div>
        </div>
      </aside>
    </>
  );
};
