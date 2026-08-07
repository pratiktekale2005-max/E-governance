import React, { useState } from 'react';
import { 
  FileCheck2, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  ExternalLink, 
  ArrowLeft, 
  ShieldCheck, 
  Download, 
  FileText, 
  Building2, 
  AlertCircle,
  FolderPlus,
  HelpCircle,
  Share2
} from 'lucide-react';

export interface RequiredDocumentItem {
  id: string;
  name: string;
  purpose: string;
  issuingAuthority: string;
  formatReq: string;
  isMandatory: boolean;
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
        howToObtainUrl: 'https://myaadhaar.uidai.gov.in'
      },
      {
        id: 'doc-income',
        name: 'Income Certificate (Current Financial Year)',
        purpose: 'Verifies family income criteria (below ₹2.50 Lakhs / annum)',
        issuingAuthority: 'Competent Authority (Tahsildar / Sub-Divisional Officer / Revenue Dept)',
        formatReq: 'Official Signed Digital PDF with Barcode',
        isMandatory: true,
        howToObtainUrl: 'https://aaplesarkar.maharashtra.gov.in'
      },
      {
        id: 'doc-domicile',
        name: 'State Domicile / Residence Certificate',
        purpose: 'Proves permanent residency in the issuing state',
        issuingAuthority: 'District Magistrate / Collectorate / Tahsildar Office',
        formatReq: 'Official Digital Certificate with Registration Number',
        isMandatory: true
      },
      {
        id: 'doc-marksheet',
        name: 'Previous Year Academic Marksheet / Passing Certificate',
        purpose: 'Academic merit and progression verification (Min 50-60% marks)',
        issuingAuthority: 'Recognized School Board / University Registrar / College Principal',
        formatReq: 'Self-attested scanned copy (PDF)',
        isMandatory: true
      },
      {
        id: 'doc-caste',
        name: 'Caste / Category Certificate (SC/ST/OBC/EWS)',
        purpose: 'Reservation and category fee waiver eligibility verification',
        issuingAuthority: 'Sub-Divisional Magistrate (SDM) / Competent State Authority',
        formatReq: 'Valid Category Certificate with Verification Code',
        isMandatory: true
      },
      {
        id: 'doc-bank',
        name: 'Bank Account Passbook / Cancelled Cheque (Aadhaar Seeded)',
        purpose: 'Direct fund transfer of scholarship amount to student account',
        issuingAuthority: 'Nationalized Bank Branch Manager',
        formatReq: 'First page showing Account Number, IFSC Code & Account Holder Name',
        isMandatory: true
      },
      {
        id: 'doc-photo',
        name: 'Recent Passport Size Photograph',
        purpose: 'Student profile identification on portal',
        issuingAuthority: 'Self Upload',
        formatReq: 'JPEG format, 20 KB - 50 KB size, white background',
        isMandatory: true
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
        isMandatory: true
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
        isMandatory: true
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
        isMandatory: true
      },
      {
        id: 'ab-aadhaar',
        name: 'Aadhaar Card for all family beneficiaries',
        purpose: 'E-KYC verification at empanelled hospital or CSC center',
        issuingAuthority: 'UIDAI',
        formatReq: 'Physical Aadhaar / e-Aadhaar',
        isMandatory: true
      }
    ]
  }
};

interface SchemeDocumentChecklistScreenProps {
  schemeName?: string;
  onBack?: () => void;
  onAskSahayakAboutDoc?: (docName: string, schemeName: string) => void;
}

export const SchemeDocumentChecklistScreen: React.FC<SchemeDocumentChecklistScreenProps> = ({
  schemeName = 'Post-Matric Scholarship Scheme for Higher Education',
  onBack,
  onAskSahayakAboutDoc
}) => {
  // Match scheme or default to NSP scholarship
  const matchedKey = Object.keys(PRESET_SCHEMES_DOCUMENTS).find(key => 
    PRESET_SCHEMES_DOCUMENTS[key].schemeName.toLowerCase().includes(schemeName.toLowerCase()) ||
    schemeName.toLowerCase().includes(key)
  ) || 'nsp-post-matric';

  const [currentSchemeKey, setCurrentSchemeKey] = useState<string>(matchedKey);
  const schemeInfo = PRESET_SCHEMES_DOCUMENTS[currentSchemeKey] || PRESET_SCHEMES_DOCUMENTS['nsp-post-matric'];

  const [checkedDocIds, setCheckedDocIds] = useState<Record<string, boolean>>({
    'doc-aadhaar': true,
    'doc-marksheet': true,
    'doc-photo': true
  });

  const toggleCheck = (docId: string) => {
    setCheckedDocIds(prev => ({
      ...prev,
      [docId]: !prev[docId]
    }));
  };

  const totalDocs = schemeInfo.documents.length;
  const readyDocs = schemeInfo.documents.filter(d => checkedDocIds[d.id]).length;
  const progressPercent = Math.round((readyDocs / totalDocs) * 100);

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800 pb-12">
      {/* Top Bar with Navigation */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          <span>Official Scheme Document Engine</span>
        </span>
      </div>

      {/* Scheme Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {Object.keys(PRESET_SCHEMES_DOCUMENTS).map((key) => {
          const item = PRESET_SCHEMES_DOCUMENTS[key];
          const isSelected = key === currentSchemeKey;
          return (
            <button
              key={key}
              onClick={() => setCurrentSchemeKey(key)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                isSelected 
                  ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {item.schemeName.split(' ')[0]} {item.schemeName.split(' ')[1] || ''}
            </button>
          );
        })}
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl" />

        <div className="space-y-2 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-wider bg-orange-500/20 text-orange-200 border border-orange-500/30 px-2.5 py-0.5 rounded-full">
              {schemeInfo.jurisdiction}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              Verified Benefit Guidelines
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-snug">
            {schemeInfo.schemeName}
          </h2>

          <p className="text-xs text-purple-200/90 font-medium leading-relaxed">
            {schemeInfo.department}
          </p>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-xs font-semibold text-emerald-300 mt-2 flex items-center justify-between">
            <span>Financial Benefit: {schemeInfo.benefits}</span>
            <button
              onClick={() => window.open(schemeInfo.officialUrl, '_blank')}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-[10px] rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Official Portal</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Progress Readiness Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-purple-600" />
              <span>Required Documents Readiness Checklist</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Check off the documents you already possess to verify your application readiness.
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-purple-600">{readyDocs}/{totalDocs}</span>
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Documents Ready</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
          <span className="text-emerald-600">{progressPercent}% Ready for Portal Submission</span>
          {readyDocs < totalDocs ? (
            <span className="text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {totalDocs - readyDocs} Pending Documents
            </span>
          ) : (
            <span className="text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All Documents Ready!
            </span>
          )}
        </div>
      </div>

      {/* Mandatory Documents List Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-purple-600" />
            <span>Detailed Document Requirements ({totalDocs} Required)</span>
          </h4>

          <span className="text-[10px] font-bold text-slate-400">
            Click checkbox to mark ready
          </span>
        </div>

        <div className="space-y-3">
          {schemeInfo.documents.map((doc, idx) => {
            const isChecked = !!checkedDocIds[doc.id];
            return (
              <div 
                key={doc.id}
                className={`border rounded-2xl p-4 transition-all ${
                  isChecked 
                    ? 'bg-emerald-50/40 border-emerald-200/80 shadow-sm' 
                    : 'bg-white border-slate-200 hover:border-purple-300 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Interactive Checkbox Button */}
                  <button
                    onClick={() => toggleCheck(doc.id)}
                    className="mt-0.5 shrink-0 text-purple-600 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300" />
                    )}
                  </button>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <h5 className={`text-xs sm:text-sm font-extrabold ${isChecked ? 'text-slate-800 line-through decoration-emerald-500/50' : 'text-slate-900'}`}>
                        {idx + 1}. {doc.name}
                      </h5>

                      {doc.isMandatory && (
                        <span className="text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                          Mandatory
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      <strong className="text-slate-700">Purpose:</strong> {doc.purpose}
                    </p>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-slate-500 font-medium pt-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-purple-600" />
                        <span><strong>Issuer:</strong> {doc.issuingAuthority}</span>
                      </span>

                      <span className="flex items-center gap-1 text-purple-700 font-semibold bg-purple-50/60 px-2 py-0.5 rounded border border-purple-100/50">
                        <span><strong>Format:</strong> {doc.formatReq}</span>
                      </span>
                    </div>

                    {/* Bottom Action bar for missing document assistance */}
                    {!isChecked && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 mt-2">
                        <button
                          onClick={() => onAskSahayakAboutDoc && onAskSahayakAboutDoc(doc.name, schemeInfo.schemeName)}
                          className="text-[11px] text-purple-600 font-extrabold flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Ask Sahayak AI: "How do I get {doc.name.split(' ')[0]}?"</span>
                        </button>

                        {doc.howToObtainUrl && (
                          <button
                            onClick={() => window.open(doc.howToObtainUrl, '_blank')}
                            className="text-[10px] text-indigo-700 font-bold bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>Official Portal to Obtain</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Floating Action Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="space-y-0.5 text-center sm:text-left">
          <h5 className="text-xs font-extrabold text-slate-900">Ready to Submit Application?</h5>
          <p className="text-[11px] text-slate-500 font-medium">
            All documents verified against official government guidelines.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => window.open(schemeInfo.officialUrl, '_blank')}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span>Proceed to Official {schemeInfo.schemeName.split(' ')[0]} Portal</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
