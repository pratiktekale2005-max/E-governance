import React, { useState } from 'react';
import { 
  PhoneCall, 
  HelpCircle, 
  Send, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  Building2
} from 'lucide-react';

export const HelpCenterView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [grievanceText, setGrievanceText] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const helplines = [
    { name: '1915 National Citizen Helpline', number: '1915', desc: 'Central Consumer & Welfare Portal' },
    { name: 'National Scholarship Helpdesk', number: '1800-11-2001', desc: 'NSP Technical Support' },
    { name: 'Kisan Call Centre (PM-KISAN)', number: '1800-180-1551', desc: 'Toll-free Agriculture Advisory' },
    { name: 'MahaDBT Helpline (Maharashtra)', number: '022-49150800', desc: 'State Scholarship Support' }
  ];

  const faqs = [
    {
      q: 'How does Sahayak AI verify scheme eligibility?',
      a: 'Sahayak AI maps citizen profile parameters (Age, Income, Domicile, Qualification) directly against official government gazette guidelines and portal API definitions.'
    },
    {
      q: 'Are my uploaded Aadhaar and Income documents secure?',
      a: 'Yes. All uploaded documents undergo client-side OCR processing and encrypted storage compliant with Indian IT Security Guidelines.'
    },
    {
      q: 'Where do I submit my final scholarship application?',
      a: 'Sahayak AI provides direct one-click links to official government portals (myscheme.gov.in, scholarships.gov.in, mahadbt.maharashtra.gov.in) so you can apply directly without middlemen.'
    }
  ];

  const handleGrievanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (grievanceText.trim()) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setGrievanceText('');
      }, 2500);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-slate-800">
      <div>
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
          Help Center & Emergency Helplines
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Contact official helpline desks, review citizen FAQs, or lodge a grievance.
        </p>
      </div>

      {/* 1. Official Helplines Directory */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <PhoneCall className="w-3.5 h-3.5 text-purple-600" />
          Official Government Toll-Free Helplines
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {helplines.map((hl, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
              <div>
                <h4 className="text-xs font-extrabold text-slate-800">{hl.name}</h4>
                <p className="text-[10px] text-slate-400 font-medium">{hl.desc}</p>
              </div>

              <a
                href={`tel:${hl.number}`}
                className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-extrabold border border-purple-100 transition-colors flex items-center gap-1 shrink-0"
              >
                <PhoneCall className="w-3 h-3" />
                <span>{hl.number}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 2. FAQs Accordion */}
      <div className="space-y-3">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
          Frequently Asked Questions
        </h3>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full p-3.5 text-left flex items-center justify-between text-xs font-extrabold text-slate-800 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === i ? <ChevronUp className="w-4 h-4 text-purple-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {openFaq === i && (
                <div className="px-3.5 pb-3.5 text-[11px] text-slate-600 border-t border-slate-100 pt-2 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Grievance Form */}
      <form onSubmit={handleGrievanceSubmit} className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-5 space-y-3">
        <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
          Lodge Citizen Grievance / Report Portal Issue
        </h3>

        <textarea
          value={grievanceText}
          onChange={(e) => setGrievanceText(e.target.value)}
          rows={3}
          placeholder="Describe any issue faced while applying or checking eligibility..."
          className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:border-purple-500 resize-none"
        />

        <button
          type="submit"
          disabled={!grievanceText.trim() || isSubmitted}
          className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isSubmitted ? 'Grievance Registered with Ref #GRV-2026 ✓' : 'Submit Citizen Grievance'}</span>
        </button>
      </form>
    </div>
  );
};
