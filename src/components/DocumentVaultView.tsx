import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Eye, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  X,
  FileCheck
} from 'lucide-react';

interface VaultDoc {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  ocrExtracted: {
    fullName?: string;
    idNumber?: string;
    validUntil?: string;
    authority?: string;
  };
  status: 'verified' | 'pending';
}

export const DocumentVaultView: React.FC = () => {
  const [documents, setDocuments] = useState<VaultDoc[]>([
    {
      id: 'doc-aadhaar',
      name: 'Aadhaar Card',
      type: 'Identity Proof',
      uploadDate: '2026-01-15',
      ocrExtracted: {
        fullName: 'Pratik Tekale',
        idNumber: 'XXXX-XXXX-9842',
        authority: 'UIDAI Govt of India'
      },
      status: 'verified'
    },
    {
      id: 'doc-income',
      name: 'Tahsil Income Certificate',
      type: 'Income Proof',
      uploadDate: '2026-02-10',
      ocrExtracted: {
        fullName: 'Pratik Tekale',
        idNumber: 'INC/2026/88412',
        validUntil: '2027-03-31',
        authority: 'Revenue Dept Maharashtra'
      },
      status: 'verified'
    },
    {
      id: 'doc-marksheet',
      name: 'HSC Marksheet (Class 12th)',
      type: 'Academic Record',
      uploadDate: '2026-02-12',
      ocrExtracted: {
        fullName: 'Pratik Tekale',
        idNumber: 'MSBSHSE/2024/7741',
        authority: 'Maharashtra State Board'
      },
      status: 'verified'
    }
  ]);

  const [previewDoc, setPreviewDoc] = useState<VaultDoc | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSimulatedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);
      setTimeout(() => {
        setIsUploading(false);
        const newDoc: VaultDoc = {
          id: `doc-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          type: 'Uploaded Record',
          uploadDate: new Date().toISOString().split('T')[0],
          ocrExtracted: {
            fullName: 'Pratik Tekale',
            idNumber: 'OCR-EXTRACTED-9912',
            authority: 'Verified Government Issuer'
          },
          status: 'verified'
        };
        setDocuments((prev) => [newDoc, ...prev]);
      }, 1500);
    }
  };

  const deleteDoc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-5 animate-fadeIn text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            Citizen Document Vault & OCR
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Securely stored credentials auto-verified via Optical Character Recognition (OCR).
          </p>
        </div>

        <label className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shrink-0">
          {isUploading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Running OCR...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Upload New Document</span>
            </>
          )}
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleSimulatedUpload}
            className="hidden"
            disabled={isUploading}
          />
        </label>
      </div>

      {/* Uploaded Documents List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {documents.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setPreviewDoc(doc)}
            className="bg-white border border-slate-200 hover:border-purple-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 relative group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800 leading-snug">{doc.name}</h3>
                  <span className="text-[10px] text-slate-400 font-medium">{doc.type}</span>
                </div>
              </div>

              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                OCR Verified
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] space-y-0.5 font-mono">
              <div className="text-slate-500">ID: <span className="font-bold text-slate-800">{doc.ocrExtracted.idNumber}</span></div>
              <div className="text-slate-500">Name: <span className="font-bold text-slate-800">{doc.ocrExtracted.fullName}</span></div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
              <span>Uploaded: {doc.uploadDate}</span>
              <button
                onClick={(e) => deleteDoc(doc.id, e)}
                className="p-1 hover:text-red-500 rounded transition-colors cursor-pointer"
                title="Remove Document"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* OCR Preview Drawer Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-extrabold text-slate-900">{previewDoc.name} OCR Inspection</h3>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Extracted Metadata</div>
              <div className="space-y-1 font-mono text-[11px]">
                <p><span className="text-slate-500">Citizen Name:</span> <strong>{previewDoc.ocrExtracted.fullName}</strong></p>
                <p><span className="text-slate-500">Document No:</span> <strong>{previewDoc.ocrExtracted.idNumber}</strong></p>
                <p><span className="text-slate-500">Issuing Authority:</span> <strong>{previewDoc.ocrExtracted.authority}</strong></p>
                {previewDoc.ocrExtracted.validUntil && (
                  <p><span className="text-slate-500">Validity:</span> <strong className="text-emerald-600">{previewDoc.ocrExtracted.validUntil}</strong></p>
                )}
              </div>
            </div>

            <button
              onClick={() => setPreviewDoc(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800 transition-all"
            >
              Close Document Inspection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
