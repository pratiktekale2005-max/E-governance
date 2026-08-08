import React, { useState, useEffect } from 'react';
import { RAGCitation } from '../../types';
import { getVaultDocuments } from '../../services/storage';
import { fetchSchemes } from '../../services/api_client';

interface ScreenDocumentWorkflowProps {
  scheme: RAGCitation;
  onNext: () => void;
}

export const ScreenDocumentWorkflow: React.FC<ScreenDocumentWorkflowProps> = ({
  scheme,
  onNext,
}) => {
  const [subStep, setSubStep] = useState<21 | 22 | 23 | 24>(21);
  const [activeDocName, setActiveDocName] = useState<string>('Income Certificate');
  const [backendRequiredDocs, setBackendRequiredDocs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSchemes()
      .then((allSchemes) => {
        const found = allSchemes.find(
          (s) => s.scheme_id === scheme.scheme_id || s.scheme_name.toLowerCase().includes(scheme.scheme_name.toLowerCase())
        );

        if (found && found.required_documents && found.required_documents.length > 0) {
          setBackendRequiredDocs(found.required_documents);
        } else {
          setBackendRequiredDocs([
            'Aadhaar Card',
            'Income Certificate',
            'Marksheet / Educational Certificate',
            'Bank Account Passbook',
          ]);
        }
      })
      .catch(() => {
        setBackendRequiredDocs([
          'Aadhaar Card',
          'Income Certificate',
          'Marksheet / Educational Certificate',
          'Bank Account Passbook',
        ]);
      })
      .finally(() => setLoading(false));
  }, [scheme]);

  const vaultDocs = getVaultDocuments();

  const requiredDocsList = backendRequiredDocs.map((docName, idx) => {
    const isDocInVault = vaultDocs.some((v) =>
      v.name.toLowerCase().includes(docName.toLowerCase()) || docName.toLowerCase().includes(v.type)
    );
    return {
      name: docName,
      done: idx === 0 || isDocInVault || subStep >= 24,
    };
  });

  const nextPendingDoc = requiredDocsList.find((d) => !d.done) || requiredDocsList[1] || requiredDocsList[0];

  const handleSimulateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setActiveDocName(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
      setSubStep(23);
      setTimeout(() => {
        setSubStep(24);
      }, 1800);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between text-center p-6 space-y-6 animate-fadeIn min-h-[85vh] max-w-md mx-auto w-full">
      {/* Screen 21: Required Documents List */}
      {subStep === 21 && (
        <>
          <div />

          <div className="space-y-6 flex flex-col items-center w-full">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-50 text-[#3525cd] rounded-full text-xs font-bold border border-purple-100 uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">fact_check</span>
                Verified Requirements
              </span>
              <h2 className="text-3xl font-extrabold text-[#191b21]">
                You'll need these documents
              </h2>
              <p className="text-sm text-[#464555] font-normal leading-relaxed max-w-xs">
                Only documents required for {scheme.scheme_name}.
              </p>
            </div>

            {loading ? (
              <div className="py-8 text-center">
                <div className="w-6 h-6 border-2 border-[#3525cd] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : (
              <div className="w-full space-y-2.5 text-left">
                {requiredDocsList.map((doc, idx) => (
                  <div
                    key={idx}
                    className="glass-card rounded-2xl p-4 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined text-xl ${doc.done ? 'text-emerald-500' : 'text-[#777587]'}`}>
                        {doc.done ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className="text-sm font-bold text-[#191b21]">{doc.name}</span>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded ${
                      doc.done ? 'bg-emerald-50 text-emerald-700' : 'bg-[#e7e7ef] text-[#464555]'
                    }`}>
                      {doc.done ? 'In Vault' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full max-w-sm pt-4">
            <button
              onClick={() => {
                if (nextPendingDoc) setActiveDocName(nextPendingDoc.name);
                setSubStep(22);
              }}
              className="w-full py-4 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold text-lg rounded-full shadow-lg shadow-[#3525cd]/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer btn-glow"
            >
              <span>Upload Document</span>
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </div>
        </>
      )}

      {/* Screen 22: Document Upload */}
      {subStep === 22 && (
        <>
          <div />

          <div className="space-y-6 flex flex-col items-center w-full">
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-[#191b21]">
                {activeDocName}
              </h2>
              <p className="text-sm text-[#464555] font-normal">
                Upload your official issued document for instant verification.
              </p>
            </div>

            <label className="w-full border-2 border-dashed border-[#3525cd]/30 hover:border-[#3525cd] glass-card rounded-3xl p-10 flex flex-col items-center justify-center space-y-4 cursor-pointer transition-all">
              <div className="w-14 h-14 rounded-full bg-[#3525cd] text-white flex items-center justify-center shadow-lg btn-glow">
                <span className="material-symbols-outlined text-3xl">cloud_upload</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#191b21]">Tap to upload file</p>
                <p className="text-xs text-[#777587] font-medium mt-0.5">PDF / JPG / PNG (Max 5MB)</p>
              </div>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleSimulateUpload}
                className="hidden"
              />
            </label>
          </div>

          <div />
        </>
      )}

      {/* Screen 23: Document Processing */}
      {subStep === 23 && (
        <>
          <div />

          <div className="space-y-6 flex flex-col items-center w-full">
            <div className="w-16 h-16 rounded-full bg-purple-100 text-[#3525cd] flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-[#3525cd]/30 border-t-[#3525cd] rounded-full animate-spin" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-[#191b21]">
                Checking your document...
              </h2>
            </div>

            <div className="w-full glass-card rounded-3xl p-5 text-left space-y-3 text-xs font-bold text-[#191b21]">
              <div className="flex items-center justify-between">
                <span>Reading File Stream</span>
                <span className="text-emerald-600 font-black">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Verifying Issuing Authority</span>
                <span className="text-emerald-600 font-black">✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Matching Scheme Criteria</span>
                <span className="text-[#3525cd] animate-pulse">Checking...</span>
              </div>
            </div>
          </div>

          <div />
        </>
      )}

      {/* Screen 24: Document Verified */}
      {subStep === 24 && (
        <>
          <div />

          <div className="space-y-6 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg border border-emerald-200">
              <span className="material-symbols-outlined text-4xl">verified</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-[#191b21]">
                Document verified
              </h2>
              <p className="text-sm text-[#464555] font-normal max-w-xs">
                {activeDocName} matches backend scheme requirement rules.
              </p>
            </div>
          </div>

          <div className="w-full max-w-sm pt-4">
            <button
              onClick={onNext}
              className="w-full py-4 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold text-lg rounded-full shadow-lg shadow-[#3525cd]/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer btn-glow"
            >
              <span>Continue to Application</span>
              <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
