import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  Trash2, 
  X,
  FileCheck
} from 'lucide-react';
import { VaultDocument } from '../types';
import { getVaultDocuments, addVaultDocument, deleteVaultDocument } from '../services/storage';

export const DocumentVaultView: React.FC = () => {
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setDocuments(getVaultDocuments());
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsUploading(true);

      setTimeout(() => {
        setIsUploading(false);
        const nameClean = file.name.replace(/\.[^/.]+$/, "");
        let typeDetected: VaultDocument['type'] = 'other';
        const lowerName = nameClean.toLowerCase();
        if (lowerName.includes('aadhaar')) typeDetected = 'aadhaar';
        else if (lowerName.includes('income')) typeDetected = 'income';
        else if (lowerName.includes('caste')) typeDetected = 'caste';
        else if (lowerName.includes('mark') || lowerName.includes('hsc') || lowerName.includes('ssc')) typeDetected = 'marksheet';

        const sizeFormatted = `${(file.size / 1024).toFixed(0)} KB`;
        const randomNum = Math.floor(1000 + Math.random() * 9000);

        const newDoc = addVaultDocument({
          name: nameClean,
          type: typeDetected,
          fileSize: sizeFormatted,
          documentNumber: `${typeDetected.toUpperCase()}-2026-${randomNum}`,
          issuingAuthority: 'Government Authority / Verified Portal',
        });

        setDocuments(getVaultDocuments());
        setPreviewDoc(newDoc);
      }, 500);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteVaultDocument(id);
    setDocuments(getVaultDocuments());
    if (previewDoc?.id === id) setPreviewDoc(null);
  };

  return (
    <div className="space-y-5 animate-fadeIn text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
            Citizen Document Vault & Verification
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Securely stored credentials auto-verified for scheme applications & checklists.
          </p>
        </div>

        <label className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-extrabold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shrink-0">
          {isUploading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying File...</span>
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
            onChange={handleFileUpload}
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
                  <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{doc.type} • {doc.fileSize}</span>
                </div>
              </div>

              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Verified Record
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] space-y-0.5 font-mono">
              <div className="text-slate-500">Document No: <span className="font-bold text-slate-800">{doc.documentNumber || 'VERIFIED-01'}</span></div>
              <div className="text-slate-500">Issuer: <span className="font-bold text-slate-800">{doc.issuingAuthority || 'Govt Portal'}</span></div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
              <span>Uploaded: {doc.uploadDate}</span>
              <button
                onClick={(e) => handleDelete(doc.id, e)}
                className="p-1 hover:text-red-500 rounded transition-colors cursor-pointer"
                title="Remove Document"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inspection Drawer Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200/80 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-extrabold text-slate-900">{previewDoc.name} Metadata</h3>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Document Record Info</div>
              <div className="space-y-1 font-mono text-[11px]">
                <p><span className="text-slate-500">Document Type:</span> <strong>{previewDoc.type.toUpperCase()}</strong></p>
                <p><span className="text-slate-500">Document No:</span> <strong>{previewDoc.documentNumber}</strong></p>
                <p><span className="text-slate-500">File Size:</span> <strong>{previewDoc.fileSize}</strong></p>
                <p><span className="text-slate-500">Issuing Authority:</span> <strong>{previewDoc.issuingAuthority}</strong></p>
                <p><span className="text-slate-500">Status:</span> <strong className="text-emerald-600 uppercase">{previewDoc.verificationStatus}</strong></p>
              </div>
            </div>

            <button
              onClick={() => setPreviewDoc(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-800 transition-all"
            >
              Close Inspection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
