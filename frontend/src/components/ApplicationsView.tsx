import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { CitizenApplication } from '../types';
import { getApplications } from '../services/storage';

export const ApplicationsView: React.FC = () => {
  const [applications, setApplications] = useState<CitizenApplication[]>([]);

  useEffect(() => {
    setApplications(getApplications());
  }, []);

  const downloadReceipt = (app: CitizenApplication) => {
    const receiptContent = `SAHAYAK AI CITIZEN OS - ACKNOWLEDGEMENT RECEIPT
==================================================
Application ID: ${app.id}
Reference Number: ${app.referenceNumber}
Scheme Name: ${app.schemeName}
Category: ${app.category}
Applicant Name: ${app.applicantName}
Submission Date: ${app.submissionDate}
Current Status: ${app.status.toUpperCase()}

Attached Verification Documents:
${app.documentsAttached.map((d) => `- ${d}`).join('\n')}

Official Verification Note:
${app.notes || 'Submitted via Sahayak Digital Government Portal'}
==================================================
`;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Acknowledgement_${app.referenceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn text-slate-800">
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
          Application Tracking & Status
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Monitor real-time progress of submitted government scheme applications.
        </p>
      </div>

      <div className="space-y-4">
        {applications.map((app) => (
          <div key={app.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400">Ref: {app.referenceNumber}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    app.status === 'approved' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : app.status === 'under_review' || app.status === 'submitted'
                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                      : 'bg-purple-50 text-purple-700 border border-purple-100'
                  }`}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1">{app.schemeName}</h3>
              </div>

              <div className="text-left sm:text-right text-[10px] text-slate-400">
                <p>Submitted: <span className="font-bold text-slate-700">{app.submissionDate}</span></p>
                <p>Category: <span className="font-bold text-purple-600">{app.category}</span></p>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Live Application Progress</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {app.timelineSteps.map((step, idx) => {
                  return (
                    <div key={idx} className={`p-2.5 rounded-xl border text-[10px] font-bold space-y-1 ${
                      step.completed 
                        ? 'bg-purple-50/80 border-purple-200 text-purple-900' 
                        : step.active
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          step.completed ? 'bg-purple-600 text-white' : step.active ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {step.completed ? '✓' : idx + 1}
                        </div>
                        <span className="truncate">{step.title}</span>
                      </div>
                      {step.description && (
                        <p className="text-[9px] font-normal text-slate-500 truncate">{step.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Officer Remarks */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-0.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Official Notes & Documents</span>
              <p className="font-medium text-[11px] text-slate-700">{app.notes || 'All requirements satisfied.'}</p>
              <div className="text-[10px] text-slate-400 mt-1">
                Attached: <span className="font-bold text-slate-600">{app.documentsAttached.join(', ')}</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => downloadReceipt(app)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Receipt TXT/PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
