import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  ExternalLink, 
  ArrowLeft, 
  ShieldCheck, 
  Download, 
  Upload
} from 'lucide-react';
import { getVaultDocuments } from '../services/storage';

export interface RequiredDocumentItem {
  id: string;
  name: string;
  purpose: string;
  issuingAuthority: string;
  formatReq: string;
  isMandatory: boolean;
  docTypeMatch?: string;
  howToObtainUrl?: string;
}

export interface SchemeDetailDocInfo {
  schemeId: string;
  schemeName: string;
  department: string;
  jurisdiction: string;
  benefits: string;
  officialUrl: string;
  documents: RequiredDocumentItem[];
}

export const PRESET_SCHEMES_DOCUMENTS: Record<string, SchemeDetailDocInfo> = {
  'nsp-post-matric': {
    schemeId: 'nsp-post-matric',
    schemeName: 'Post-Matric Scholarship Scheme for Higher Education',
    department: 'Ministry of Social Justice & Empowerment / State Higher Edu',
    jurisdiction: 'Central & State Sponsored',
    benefits: 'Full Tuition Fee Waiver + Maintenance Allowance up to ₹12,000/yr',
    officialUrl: 'https://scholarships.gov.in',
    documents: [
      {
        id: 'doc-aadhaar',
        name: 'Aadhaar Card (E-Aadhaar / Physical Card)',
        purpose: 'Identity & Direct Benefit Transfer (DBT) Bank Linkage Verification',
        issuingAuthority: 'UIDAI (Unique Identification Authority of India)',
        formatReq: 'PDF / JPEG (Max 500 KB), Must have mobile number linked',
        isMandatory: true,
        docTypeMatch: 'aadhaar',
        howToObtainUrl: 'https://myaadhaar.uidai.gov.in'
      },
      {
        id: 'doc-income',
        name: 'Income Certificate (Current Financial Year)',
        purpose: 'Verifies family income criteria (below ₹2.50 Lakhs / annum)',
        issuingAuthority: 'Competent Authority (Tahsildar / Sub-Divisional Officer / Revenue Dept)',
        formatReq: 'Official Signed Digital PDF with Barcode',
        isMandatory: true,
        docTypeMatch: 'income',
        howToObtainUrl: 'https://aaplesarkar.maharashtra.gov.in'
      },
      {
        id: 'doc-domicile',
        name: 'State Domicile / Residence Certificate',
        purpose: 'Proves permanent residency in the issuing state',
        issuingAuthority: 'District Magistrate / Collectorate / Tahsildar Office',
        formatReq: 'Official Digital Certificate with Registration Number',
        isMandatory: true,
        docTypeMatch: 'domicile'
      },
      {
        id: 'doc-marksheet',
        name: 'Previous Year Academic Marksheet / Passing Certificate',
        purpose: 'Academic merit and progression verification (Min 50-60% marks)',
        issuingAuthority: 'Recognized School Board / University Registrar / College Principal',
        formatReq: 'Self-attested scanned copy (PDF)',
        isMandatory: true,
        docTypeMatch: 'marksheet'
      },
      {
        id: 'doc-caste',
        name: 'Caste / Category Certificate (SC/ST/OBC/EWS)',
        purpose: 'Reservation and category fee waiver eligibility verification',
        issuingAuthority: 'Sub-Divisional Magistrate (SDM) / Competent State Authority',
        formatReq: 'Valid Category Certificate with Verification Code',
        isMandatory: true,
        docTypeMatch: 'caste'
      },
      {
        id: 'doc-bank',
        name: 'Bank Account Passbook / Cancelled Cheque (Aadhaar Seeded)',
        purpose: 'Direct fund transfer of scholarship amount to student account',
        issuingAuthority: 'Nationalized Bank Branch Manager',
        formatReq: 'First page showing Account Number, IFSC Code & Account Holder Name',
        isMandatory: true,
        docTypeMatch: 'bank'
      }
    ]
  },
  'pm-kisan': {
    schemeId: 'pm-kisan',
    schemeName: 'PM-KISAN Samman Nidhi',
    department: 'Ministry of Agriculture & Farmers Welfare',
    jurisdiction: 'Central Government',
    benefits: '₹6,000 per year directly transferred in 3 equal installments of ₹2,000',
    officialUrl: 'https://pmkisan.gov.in',
    documents: [
      {
        id: 'kisan-aadhaar',
        name: 'Aadhaar Card (Mandatory for e-KYC)',
        purpose: 'Biometric / OTP Verification of farmer identity',
        issuingAuthority: 'UIDAI',
        formatReq: 'Aadhaar number linked with active mobile',
        isMandatory: true,
        docTypeMatch: 'aadhaar'
      },
      {
        id: 'kisan-land',
        name: 'Land Holding Documents (7/12 Extract / Khatauni / Land Record)',
        purpose: 'Proof of cultivable land ownership under farmer name',
        issuingAuthority: 'State Revenue Department / Patwari / Talathi',
        formatReq: 'Digitally signed 7/12 record or Land Passbook copy',
        isMandatory: true
      },
      {
        id: 'kisan-bank',
        name: 'Aadhaar-Seeded Savings Bank Account',
        purpose: 'Direct Benefit Transfer (DBT) of ₹2,000 quarterly installments',
        issuingAuthority: 'Bank Branch (NPCI Mapping Required)',
        formatReq: 'Passbook first page copy',
        isMandatory: true,
        docTypeMatch: 'bank'
      }
    ]
  },
  'ayushman-bharat': {
    schemeId: 'ayushman-bharat',
    schemeName: 'Ayushman Bharat PM-JAY Health Protection',
    department: 'National Health Authority (NHA)',
    jurisdiction: 'Central & State Health Mission',
    benefits: 'Free cashless health coverage up to ₹5,00,000 per family per year in empanelled hospitals',
    officialUrl: 'https://pmjay.gov.in',
    documents: [
      {
        id: 'ab-ration',
        name: 'Ration Card (BPL / Antyodaya / Priority Household)',
        purpose: 'SECC Household eligibility identification',
        issuingAuthority: 'Food & Civil Supplies Department',
        formatReq: 'Original Ration Card displaying family members',
        isMandatory: true,
        docTypeMatch: 'ration'
      },
      {
        id: 'ab-aadhaar',
        name: 'Aadhaar Card for all family beneficiaries',
        purpose: 'E-KYC verification at empanelled hospital or CSC center',
        issuingAuthority: 'UIDAI',
        formatReq: 'Physical Aadhaar / e-Aadhaar',
        isMandatory: true,
        docTypeMatch: 'aadhaar'
      }
    ]
  }
};

interface SchemeDocumentChecklistScreenProps {
  schemeName?: string;
  onBack?: () => void;
  onNavigateVault?: () => void;
  onAskSahayakAboutDoc?: (docName: string, schemeName: string) => void;
}

export const SchemeDocumentChecklistScreen: React.FC<SchemeDocumentChecklistScreenProps> = ({
  schemeName = 'Post-Matric Scholarship Scheme for Higher Education',
  onBack,
  onNavigateVault,
  onAskSahayakAboutDoc
}) => {
  const matchedKey = Object.keys(PRESET_SCHEMES_DOCUMENTS).find(key => 
    PRESET_SCHEMES_DOCUMENTS[key].schemeName.toLowerCase().includes(schemeName.toLowerCase()) ||
    schemeName.toLowerCase().includes(key)
  ) || 'nsp-post-matric';

  const [currentSchemeKey] = useState<string>(matchedKey);
  const schemeInfo = PRESET_SCHEMES_DOCUMENTS[currentSchemeKey] || PRESET_SCHEMES_DOCUMENTS['nsp-post-matric'];

  const [checkedDocIds, setCheckedDocIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Auto-check against citizen's real vault documents
    const vaultDocs = getVaultDocuments();
    const vaultTypes = new Set(vaultDocs.map((d) => d.type.toLowerCase()));

    const initialChecked: Record<string, boolean> = {};
    schemeInfo.documents.forEach((doc) => {
      if (doc.docTypeMatch && vaultTypes.has(doc.docTypeMatch)) {
        initialChecked[doc.id] = true;
      }
    });
    setCheckedDocIds(initialChecked);
  }, [schemeInfo]);

  const toggleCheck = (docId: string) => {
    setCheckedDocIds(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const totalDocs = schemeInfo.documents.length;
  const completedDocsCount = Object.values(checkedDocIds).filter(Boolean).length;
  const readinessPercent = Math.round((completedDocsCount / totalDocs) * 100);

  const downloadChecklistPDF = () => {
    const textContent = `DOCUMENT PREPARATION CHECKLIST - ${schemeInfo.schemeName.toUpperCase()}
Authority: ${schemeInfo.department}
Benefits: ${schemeInfo.benefits}

Readiness Status: ${completedDocsCount}/${totalDocs} Documents Ready (${readinessPercent}%)

Required Documents:
${schemeInfo.documents.map((d, i) => `${i + 1}. [${checkedDocIds[d.id] ? 'READY' : 'PENDING'}] ${d.name}
   - Purpose: ${d.purpose}
   - Issuing Authority: ${d.issuingAuthority}
   - Format: ${d.formatReq}`).join('\n\n')}

Official Portal: ${schemeInfo.officialUrl}
Generated by Sahayak AI Citizen OS
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Checklist_${schemeInfo.schemeId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-fadeIn text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-purple-600" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Scheme Document Readiness Checklist
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Verified list of mandatory credentials required before portal submission.
            </p>
          </div>
        </div>

        <button
          onClick={downloadChecklistPDF}
          className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Checklist</span>
        </button>
      </div>

      {/* Scheme Detail Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-5 text-white shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <span className="text-[10px] font-bold text-purple-200 bg-white/10 px-2 py-0.5 rounded uppercase tracking-wider">
              {schemeInfo.jurisdiction}
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-white mt-1">
              {schemeInfo.schemeName}
            </h3>
          </div>
          <a
            href={schemeInfo.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-purple-300 font-bold hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Official Portal</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-purple-100">
            <span className="text-[10px] font-extrabold text-purple-300 uppercase tracking-wider block">Key Benefit</span>
            <p className="font-bold text-white">{schemeInfo.benefits}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15 flex items-center gap-3 shrink-0">
            <div>
              <span className="text-[9px] font-extrabold text-purple-200 uppercase tracking-wider block">Readiness</span>
              <span className="text-lg font-black text-emerald-400">{readinessPercent}%</span>
            </div>
            <div className="text-[10px] text-purple-100 border-l border-white/20 pl-3">
              <p><strong>{completedDocsCount}</strong> of <strong>{totalDocs}</strong> Docs Ready</p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Checklist Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            Required Documents ({completedDocsCount}/{totalDocs} Verified in Vault)
          </h3>
          {onNavigateVault && (
            <button
              onClick={onNavigateVault}
              className="text-xs text-purple-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Manage Vault Documents</span>
            </button>
          )}
        </div>

        <div className="space-y-2.5">
          {schemeInfo.documents.map((doc) => {
            const isDone = !!checkedDocIds[doc.id];
            return (
              <div
                key={doc.id}
                onClick={() => toggleCheck(doc.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  isDone 
                    ? 'bg-purple-50/50 border-purple-200/80 shadow-sm' 
                    : 'bg-white border-slate-200 hover:border-purple-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button className="mt-0.5 text-purple-600 shrink-0 cursor-pointer">
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-extrabold ${isDone ? 'text-slate-900 line-through decoration-slate-400' : 'text-slate-800'}`}>
                          {doc.name}
                        </h4>
                        {doc.isMandatory && (
                          <span className="text-[8px] font-bold text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-100 uppercase">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{doc.purpose}</p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isDone ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {isDone ? 'In Vault' : 'Missing'}
                  </span>
                </div>

                <div className="pl-8 pt-1 flex flex-wrap items-center justify-between text-[10px] text-slate-400 border-t border-slate-100/60 gap-2">
                  <span>Authority: <strong className="text-slate-600">{doc.issuingAuthority}</strong></span>
                  <div className="flex items-center gap-2">
                    {onAskSahayakAboutDoc && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAskSahayakAboutDoc(doc.name, schemeInfo.schemeName);
                        }}
                        className="text-purple-600 font-extrabold hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-purple-500" />
                        <span>Ask Sahayak</span>
                      </button>
                    )}
                    {doc.howToObtainUrl && (
                      <a
                        href={doc.howToObtainUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-indigo-600 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <span>How to get</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
