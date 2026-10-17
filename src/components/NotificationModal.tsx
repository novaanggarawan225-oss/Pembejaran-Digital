import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  X, 
  Bell, 
  CheckCheck, 
  CheckSquare, 
  FileText, 
  MailCheck, 
  Award, 
  Clock, 
  Inbox
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tab: any) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose, onNavigateToTab }) => {
  const { currentUser } = useAuth();
  const { state, markNotificationAsRead, markAllNotificationsAsRead } = useData();

  if (!isOpen) return null;

  const userNotifications = state.Notifications.filter(
    n => n.user_id === currentUser?.user_id
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const getIcon = (type: NotificationItem['jenis']) => {
    switch (type) {
      case 'tugas':
        return <CheckSquare className="w-4 h-4 text-blue-600" />;
      case 'materi':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'izin':
        return <MailCheck className="w-4 h-4 text-amber-600" />;
      case 'nilai':
        return <Award className="w-4 h-4 text-purple-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Pemberitahuan</h3>
            <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-100 text-blue-800 rounded-full tabular-nums">
              {userNotifications.filter(n => !n.is_read).length} baru
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
              title="Tandai semua dibaca"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Tandai Semua Dibaca</span>
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-md">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {userNotifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Inbox className="w-8 h-8 mx-auto stroke-1" />
              <p className="text-xs">Belum ada pemberitahuan.</p>
            </div>
          ) : (
            userNotifications.map(notif => (
              <div
                key={notif.notification_id}
                onClick={() => markNotificationAsRead(notif.notification_id)}
                className={`p-3 rounded-xl transition-colors cursor-pointer flex items-start gap-3 ${
                  notif.is_read ? 'hover:bg-slate-50 opacity-80' : 'bg-blue-50/50 hover:bg-blue-50/80 font-medium'
                }`}
              >
                <div className="p-2 rounded-lg bg-white border border-slate-200 shadow-2xs shrink-0 mt-0.5">
                  {getIcon(notif.jenis)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-900 truncate">{notif.judul}</p>
                    <span className="text-[10px] text-slate-400 shrink-0 tabular-nums">
                      {new Date(notif.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.pesan}</p>
                </div>
                {!notif.is_read && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
