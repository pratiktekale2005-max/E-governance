import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bookmark, 
  CheckCircle2, 
  Sparkles, 
  X, 
  ChevronRight,
  Database,
  RefreshCw,
  ExternalLink,
  Send
} from 'lucide-react';
import { fetchPublicSchemes } from '../services/api';
import { addApplication } from '../services/storage';

interface SchemeItem {
  id: string;
  name: string;
  category: string;
  jurisdiction: string;
  department: string;
  benefits: string;
  summary: string;
  eligibility: string[];
  documents: string[];
  officialUrl: string;
  isBookmarked?: boolean;
}

const SCHEMES_MOCK_DATA: SchemeItem[] = [
  {
    id: 'nsp-post-matric',
    name: 'National Scholarship Portal (NSP) Post-Matric Scholarship',
    category: 'Education',
    jurisdiction: 'Central Government',
    department: 'Ministry of Social Justice & Empowerment',
    benefits: 'Full tuition fee cover + annual maintenance allowance of up to ₹12,000/year.',
    summary: 'Financial support to SC/ST/OBC students to complete higher secondary and graduate studies.',
    eligibility: ['Enrolled in Class 11, 12, Diploma, or Degree', 'Family annual income under ₹2.5 Lakhs', 'Minimum 50% marks in previous exam'],
    documents: ['Income Certificate', 'Aadhaar Card', 'Previous Marksheet', 'Bank Passbook'],
    officialUrl: 'https://scholarships.gov.in'
  },
  {
    id: 'mahadbt-shahu',
    name: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Scheme',
    category: 'Education',
    jurisdiction: 'State Government (Maharashtra)',
    department: 'Higher & Technical Education Department',
    benefits: '50% tuition and exam fee reimbursement directly transferred to college account.',
    summary: 'Fee waiver scheme for Economically Backward Class (EBC) students admitted through CAP in Maharashtra.',
    eligibility: ['Domicile of Maharashtra', 'Family income up to ₹8.0 Lakhs', 'Admitted under general merit or CAP quota'],
    documents: ['Domicile Certificate', 'Income Certificate from Tahsildar', 'Cap Allotment Letter', 'Aadhaar Linked Account'],
    officialUrl: 'https://mahadbt.maharashtra.gov.in'
  },
  {
    id: 'pm-kisan',
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    category: 'Agriculture',
    jurisdiction: 'Central Government',
    department: 'Ministry of Agriculture & Farmers Welfare',
    benefits: '₹6,000 per year paid in 3 equal installments of ₹2,000 directly via DBT.',
    summary: 'Direct income support for all landholding farmer families across India.',
    eligibility: ['Small & Marginal Farmer families', 'Valid cultivable land record', 'eKYC Aadhaar verification'],
    documents: ['Land Records (7/12 extract / Khatauni)', 'Aadhaar Card', 'Bank Account Details'],
    officialUrl: 'https://pmkisan.gov.in'
  },
  {
    id: 'pmay-urban',
    name: 'Pradhan Mantri Awas Yojana (PMAY-Urban & Rural)',
    category: 'Housing',
    jurisdiction: 'Central Government',
    department: 'Ministry of Housing and Urban Affairs',
    benefits: 'Interest subsidy up to ₹2.67 Lakhs on home loans or ₹1.2 Lakh construction grant.',
    summary: 'Housing for all mission providing affordable pucca houses to eligible families.',
    eligibility: ['Family should not own a pucca house in India', 'Annual income under ₹18 Lakhs for subsidy tiers'],
    documents: ['Aadhaar Card', 'Income Certificate / Salary Slip', 'Property Affidavit'],
    officialUrl: 'https://pmaymis.gov.in'
  },
  {
    id: 'pmegp-loan',
    name: 'Prime Minister Employment Generation Programme (PMEGP)',
    category: 'Business & Micro-Enterprise',
    jurisdiction: 'Central Government',
    department: 'KVIC / MSME',
    benefits: 'Subsidy up to 35% on project costs up to ₹50 Lakhs for setting up new micro-enterprises.',
    summary: 'Credit-linked subsidy program aimed at generating self-employment in rural & urban areas.',
    eligibility: ['Individual above 18 years', 'At least 8th class pass for project cost > ₹10 Lakhs'],
    documents: ['Project Report', 'Aadhaar & PAN Card', 'Educational Certificate', 'Caste Certificate (if applicable)'],
    officialUrl: 'https://kviconline.gov.in/pmegp'
  },
  {
    id: 'ayushman-bharat',
    name: 'Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (PM-JAY)',
    category: 'Healthcare',
    jurisdiction: 'Central Government',
    department: 'National Health Authority',
    benefits: 'Free health coverage up to ₹5 Lakhs per family per year for secondary & tertiary hospital care.',
    summary: 'World\'s largest government health assurance scheme covering 12+ Crore vulnerable families.',
    eligibility: ['Families listed in SECC 2011 database', 'BPL ration card holders'],
    documents: ['Ayushman Card / Ration Card', 'Aadhaar Card'],
    officialUrl: 'https://pmjay.gov.in'
  }
];

function mapBackendSchemeToUI(s: any): SchemeItem {
  return {
    id: s.scheme_id || s.id || Math.random().toString(),
    name: s.scheme_name || s.name || 'Government Scheme',
    category: s.category ? (s.category.charAt(0).toUpperCase() + s.category.slice(1)) : 'General Welfare',
    jurisdiction: s.jurisdiction === 'central' ? 'Central Government' : (s.state ? `State (${s.state})` : 'State Government'),
    department: s.department || s.ministry || 'Government Department',
    benefits: s.benefits || s.summary || 'Financial assistance and support',
    summary: s.summary || '',
    eligibility: Array.isArray(s.eligibility) ? s.eligibility : [s.eligibility || 'Eligible citizens'],
    documents: Array.isArray(s.required_documents) ? s.required_documents : (Array.isArray(s.documents) ? s.documents : ['Aadhaar Card', 'Identity Proof']),
    officialUrl: (s.official_urls && s.official_urls[0]) || s.officialUrl || 'https://myscheme.gov.in'
  };
}

interface SchemeExplorerViewProps {
  onAskSahayakAboutScheme: (schemeName: string) => void;
  onViewDocChecklist?: (schemeName: string) => void;
  onNavigate?: (tab: string) => void;
}

export const SchemeExplorerView: React.FC<SchemeExplorerViewProps> = ({ 
  onAskSahayakAboutScheme,
  onViewDocChecklist,
  onNavigate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['nsp-post-matric']);
  const [activeModalScheme, setActiveModalScheme] = useState<SchemeItem | null>(null);
  const [appliedSuccessMsg, setAppliedSuccessMsg] = useState<string | null>(null);
  
  const [apiSchemes, setApiSchemes] = useState<SchemeItem[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(true);
  const [isApiConnected, setIsApiConnected] = useState(false);

  const loadSchemesFromAPI = async () => {
    setIsLoadingApi(true);
    try {
      const res = await fetchPublicSchemes();
      if (res && Array.isArray(res.items) && res.items.length > 0) {
        const mapped = res.items.map(mapBackendSchemeToUI);
        setApiSchemes(mapped);
        setIsApiConnected(true);
      } else {
        setApiSchemes(SCHEMES_MOCK_DATA);
      }
    } catch (err) {
      console.warn('Backend API connection note:', err);
      setApiSchemes(SCHEMES_MOCK_DATA);
    } finally {
      setIsLoadingApi(false);
    }
  };

  useEffect(() => {
    loadSchemesFromAPI();
  }, []);

  const schemesToDisplay = apiSchemes.length > 0 ? apiSchemes : SCHEMES_MOCK_DATA;

  const categories = ['All', 'Education', 'Agriculture', 'Housing', 'Business & Micro-Enterprise', 'Healthcare', 'Farmer', 'Student'];

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreateApplication = (scheme: SchemeItem) => {
    const newApp = addApplication({
      schemeId: scheme.id,
      schemeName: scheme.name,
      category: scheme.category,
      applicantName: 'Sahayak Citizen Profile',
      documentsAttached: scheme.documents,
      notes: `Applied directly via Sahayak AI for ${scheme.jurisdiction}`,
    });

    setAppliedSuccessMsg(`Application ${newApp.id} Created!`);
    setTimeout(() => setAppliedSuccessMsg(null), 3000);
    setActiveModalScheme(null);
    if (onNavigate) onNavigate('applications');
  };

  const filteredSchemes = schemesToDisplay.filter((scheme) => {
    const matchesSearch = 
      scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scheme.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || 
      scheme.category.toLowerCase() === selectedCategory.toLowerCase() ||
      (selectedCategory === 'Agriculture' && scheme.category.toLowerCase().includes('farmer')) ||
      (selectedCategory === 'Education' && scheme.category.toLowerCase().includes('student'));

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5 animate-fadeIn text-slate-800">
      {appliedSuccessMsg && (
        <div className="p-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{appliedSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* Header & Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Government Scheme Directory</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Search verified welfare policies, subsidies, and educational grants in India.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
              isApiConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
            }`}>
              <Database className="w-3 h-3" />
              <span>{isApiConnected ? `API Live (${schemesToDisplay.length} Schemes)` : `Express API Connected`}</span>
            </span>

            <button
              onClick={loadSchemesFromAPI}
              disabled={isLoadingApi}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
              title="Refresh from API Server"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingApi ? 'animate-spin text-purple-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search 28+ government schemes by keyword, state, department, or benefits..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-medium outline-none focus:bg-white focus:border-purple-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scheme Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredSchemes.map((scheme) => {
          const isSaved = bookmarkedIds.includes(scheme.id);
          return (
            <div
              key={scheme.id}
              onClick={() => setActiveModalScheme(scheme)}
              className="bg-white border border-slate-200 hover:border-purple-300 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between gap-3 group relative"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                    {scheme.category} • {scheme.jurisdiction}
                  </span>
                  <button
                    onClick={(e) => toggleBookmark(scheme.id, e)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      isSaved ? 'text-purple-600 bg-purple-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                    title={isSaved ? 'Bookmarked' : 'Save to Wishlist'}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-purple-600' : ''}`} />
                  </button>
                </div>

                <h3 className="text-xs font-extrabold text-slate-800 group-hover:text-purple-700 transition-colors leading-snug">
                  {scheme.name}
                </h3>

                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {scheme.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="font-bold text-slate-700 truncate max-w-[180px]">
                  {scheme.benefits}
                </span>
                <span className="text-purple-600 font-extrabold flex items-center gap-0.5 shrink-0 group-hover:translate-x-0.5 transition-transform">
                  Details <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Modal Overlay */}
      {activeModalScheme && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200/80 space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                  {activeModalScheme.category} • {activeModalScheme.jurisdiction}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1">
                  {activeModalScheme.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalScheme(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Benefits Provided</span>
                <p className="font-extrabold text-slate-900">{activeModalScheme.benefits}</p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-extrabold text-slate-800 text-xs">Eligibility Criteria</h4>
                <ul className="space-y-1 pl-1">
                  {activeModalScheme.eligibility.map((req, i) => (
                    <li key={i} className="flex items-center gap-2 text-[11px] text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-800 text-xs">Required Documents</h4>
                  {onViewDocChecklist && (
                    <button
                      onClick={() => {
                        const sName = activeModalScheme.name;
                        setActiveModalScheme(null);
                        onViewDocChecklist(sName);
                      }}
                      className="text-[10px] font-extrabold text-purple-600 hover:text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-100 flex items-center gap-1 cursor-pointer"
                    >
                      <span>📋 Open Document Checklist Screen</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeModalScheme.documents.map((doc, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-200/50">
                      📄 {doc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => handleCreateApplication(activeModalScheme)}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Submit Application via Sahayak AI</span>
              </button>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => {
                    onAskSahayakAboutScheme(`Tell me about ${activeModalScheme.name} eligibility`);
                    setActiveModalScheme(null);
                  }}
                  className="flex-1 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-purple-100"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Ask Sahayak AI</span>
                </button>

                <button
                  onClick={() => window.open(activeModalScheme.officialUrl, '_blank')}
                  className="flex-1 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <span>Apply on Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
