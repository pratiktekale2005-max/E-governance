import React from 'react';
import { 
  Bell, 
  Bookmark, 
  Calendar, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  Trash2,
  ExternalLink
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const alerts = [
    {
      id: 'alt-1',
      title: 'NSP Portal Deadline Extension',
      message: 'National Scholarship Portal Post-Matric scheme application deadline extended to 15th March 2026.',
      type: 'Government Alert',
      date: '2 hours ago',
      urgent: true
    },
    {
      id: 'alt-2',
      title: 'Income Certificate Renewal Notice',
      message: 'Your Maharashtra Tahsil Income Certificate expires on March 2027. Renew on MahaOnline.',
      type: 'Document Reminder',
      date: '1 day ago',
      urgent: false
    },
    {
      id: 'alt-3',
      title: 'New Scheme Released: Youth Apprenticeship',
      message: 'Chief Minister Youth Work Training Scheme announced with ₹10,000 monthly stipend.',
      type: 'New Welfare Policy',
      date: '3 days ago',
      urgent: false
    }
  ];

  return (
    <div className="space-y-5 animate-fadeIn text-slate-800">
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
          Notifications & Saved Schemes
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Official government announcements, deadline updates, and bookmarked policies.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-purple-600" />
          Recent Government Alerts
        </h3>

        <div className="space-y-2.5">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-4 rounded-2xl border transition-all ${
                alt.urgent
                  ? 'bg-purple-50/60 border-purple-200'
                  : 'bg-white border-slate-200/80 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${
                  alt.urgent ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {alt.type}
                </span>
                <span className="text-[10px] font-medium text-slate-400">{alt.date}</span>
              </div>

              <h4 className="text-xs font-extrabold text-slate-800 mt-1.5">{alt.title}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{alt.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
