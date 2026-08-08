import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Trash2
} from 'lucide-react';
import { AppNotification } from '../types';
import { getNotifications, saveNotifications } from '../services/storage';

interface NotificationsViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onNavigateTab }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    setNotifications(getNotifications());
  }, []);

  const markAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const clearAll = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  return (
    <div className="space-y-5 animate-fadeIn text-slate-800">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            Notifications & Alerts
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Official government announcements, application updates, and document reminders.
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={markAllRead}
              className="text-[10px] font-bold text-purple-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={clearAll}
              className="text-[10px] font-bold text-slate-400 hover:text-red-500 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-purple-600" />
          Recent Government Alerts ({notifications.length})
        </h3>

        {notifications.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 border border-slate-200/60 rounded-2xl text-xs text-slate-500 font-bold">
            No unread notifications at this time.
          </div>
        ) : (
          <div className="space-y-2.5">
            {notifications.map((alt) => (
              <div
                key={alt.id}
                onClick={() => alt.actionTab && onNavigateTab && onNavigateTab(alt.actionTab)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  !alt.read
                    ? 'bg-purple-50/60 border-purple-200 shadow-sm'
                    : 'bg-white border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                    !alt.read ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {alt.type}
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">{alt.timestamp}</span>
                </div>

                <h4 className="text-xs font-extrabold text-slate-800 mt-1.5">{alt.title}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{alt.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
