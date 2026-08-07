import React, { useState } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  ChevronRight, 
  Building2, 
  Calendar, 
  Search,
  ExternalLink
} from 'lucide-react';

interface ApplicationRecord {
  id: string;
  refNo: string;
  schemeName: string;
  portal: string;
  submissionDate: string;
  currentStep: number;
  status: 'Under Review' | 'Approved' | 'Action Required';
  remarks: string;
}

export const ApplicationsView: React.FC = () => {
  const [applications] = useState<ApplicationRecord[]>([
    {
      id: 'app-01',
      refNo: 'NSP/2026/MAH/88192',
      schemeName: 'National Scholarship Portal Post-Matric Grant',
      portal: 'scholarships.gov.in',
      submissionDate: '2026-02-01',
      currentStep: 2,
      status: 'Under Review',
      remarks: 'Application verified by Institute Principal. Pending District Social Welfare Officer sign-off.'
    },
    {
      id: 'app-02',
      refNo: 'MAHADBT/2026/EBC/9941',
      schemeName: 'Rajarshi Chhatrapati Shahu Maharaj EBC Fee Waiver',
      portal: 'mahadbt.maharashtra.gov.in',
      submissionDate: '2026-01-20',
      currentStep: 4,
      status: 'Approved',
      remarks: '50% Tuition fee reimbursed directly to college treasury via Direct Benefit Transfer (DBT).'
    }
  ]);

  const steps = [
    'Submitted',
    'Document Verification',
    'District Officer Approval',
    'Disbursement / Granted'
  ];

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
                  <span className="text-[10px] font-mono font-bold text-slate-400">Ref: {app.refNo}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    app.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    {app.status}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 mt-1">{app.schemeName}</h3>
              </div>

              <div className="text-left sm:text-right text-[10px] text-slate-400">
                <p>Submitted: <span className="font-bold text-slate-700">{app.submissionDate}</span></p>
                <p>Portal: <span className="font-bold text-purple-600">{app.portal}</span></p>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Live Application Progress</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {steps.map((step, idx) => {
                  const stepNum = idx + 1;
                  const isDone = stepNum <= app.currentStep;
                  const isCurrent = stepNum === app.currentStep;

                  return (
                    <div key={idx} className={`p-2.5 rounded-xl border text-[10px] font-bold space-y-1 ${
                      isDone 
                        ? 'bg-purple-50/80 border-purple-200 text-purple-900' 
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                          isDone ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-500'
                        }`}>
                          {isDone ? '✓' : stepNum}
                        </div>
                        <span className="truncate">{step}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Officer Remarks */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-0.5">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Officer Remarks</span>
              <p className="font-medium text-[11px] text-slate-700">{app.remarks}</p>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => alert(`Downloading Official Acknowledgement Receipt for ${app.refNo}...`)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Receipt PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
