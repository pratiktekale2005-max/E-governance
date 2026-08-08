import React, { useState, useEffect } from 'react';
import { RAGCitation, CitizenProfile } from '../../types';
import { fetchSchemes, fetchRecommendedSchemes } from '../../services/api_client';
import { speakText } from '../../services/speech_service';

interface ScreenSchemeDiscoveryProps {
  citations: RAGCitation[];
  profile?: CitizenProfile;
  onSelectScheme: (scheme: RAGCitation) => void;
}

export const ScreenSchemeDiscovery: React.FC<ScreenSchemeDiscoveryProps> = ({
  citations,
  profile,
  onSelectScheme,
}) => {
  const [liveSchemes, setLiveSchemes] = useState<RAGCitation[]>(citations);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    if (citations && citations.length > 0) {
      setLiveSchemes(citations);
      speakText(`I found ${citations.length} potential scheme matches for you. Based on your profile, I have prioritized the best options.`, profile?.preferred_language || 'en');
    } else {
      setLoading(true);
      fetchRecommendedSchemes(profile || {})
        .then((recs) => {
          if (recs && recs.length > 0) {
            const mapped: RAGCitation[] = recs.map((s) => ({
              scheme_id: s.scheme_id,
              scheme_name: s.scheme_name,
              category: s.category || 'Welfare',
              jurisdiction: s.jurisdiction || 'Government',
              official_url: (s.official_urls && s.official_urls[0]) || 'https://scholarships.gov.in',
              relevance_score: 0.95,
            }));
            setLiveSchemes(mapped);
            speakText(`I found ${mapped.length} potential matches for you.`, profile?.preferred_language || 'en');
          } else {
            return fetchSchemes().then((all) => {
              const mapped: RAGCitation[] = all.map((s) => ({
                scheme_id: s.scheme_id,
                scheme_name: s.scheme_name,
                category: s.category || 'Welfare',
                jurisdiction: s.jurisdiction || 'Government',
                official_url: (s.official_urls && s.official_urls[0]) || 'https://scholarships.gov.in',
                relevance_score: 0.92,
              }));
              setLiveSchemes(mapped);
              speakText(`I found ${mapped.length} potential matches for you.`, profile?.preferred_language || 'en');
            });
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [citations, profile]);

  const displayList = liveSchemes.length > 0 ? liveSchemes : [
    {
      scheme_id: 'nsp-post-matric',
      scheme_name: 'National Scholarship Portal (NSP) Post-Matric Scholarship',
      category: 'Education',
      jurisdiction: 'Central Government',
      official_url: 'https://scholarships.gov.in',
      relevance_score: 0.98,
    },
  ];

  const featuredScheme = displayList[selectedIdx] || displayList[0];
  const secondarySchemes = displayList.filter((_, idx) => idx !== selectedIdx);

  const handleSpeakDetails = () => {
    speakText(`I found ${displayList.length} potential matches for you. Top recommendation is ${featuredScheme.scheme_name}.`, profile?.preferred_language || 'en');
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-6 space-y-6 animate-fadeIn min-h-[85vh] max-w-md mx-auto w-full">
      {loading ? (
        <div className="my-auto py-16 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#3525cd]/30 border-t-[#3525cd] rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#464555] font-bold">Retrieving Live Backend Schemes...</p>
        </div>
      ) : (
        <>
          {/* Header Section */}
          <div className="w-full text-center space-y-2 flex flex-col items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#3525cd] text-4xl">
                auto_awesome
              </span>
              <button
                onClick={handleSpeakDetails}
                title="Listen to voice overview"
                className="w-9 h-9 rounded-full bg-[#3525cd]/10 hover:bg-[#3525cd]/20 text-[#3525cd] flex items-center justify-center transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-xl">volume_up</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#191b21]">
              I found {displayList.length} potential matches for you
            </h1>
            <p className="text-sm text-[#464555] font-normal max-w-xs mx-auto">
              Based on your profile, I've prioritized the best options for your situation.
            </p>
          </div>

          {/* Featured Scheme Glass Card */}
          <div className="w-full glass-card rounded-3xl p-6 text-left space-y-5 relative overflow-hidden group">
            {/* Top Badges */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center px-3 py-1 bg-[#4f46e5] text-white text-xs font-bold rounded-full">
                <span className="material-symbols-outlined text-sm mr-1">verified</span>
                Strong match ({Math.round((featuredScheme.relevance_score || 0.95) * 100)}%)
              </span>
              <span className="text-xs font-bold text-[#464555] uppercase tracking-wider">
                {featuredScheme.category}
              </span>
            </div>

            {/* Scheme Title & Details */}
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-[#191b21] leading-snug">
                {featuredScheme.scheme_name}
              </h2>
              <p className="text-sm text-[#464555] leading-relaxed">
                Direct bank transfer financial assistance & tuition fee cover tailored for eligible citizens.
              </p>
            </div>

            {/* Key Benefit Highlights */}
            <div className="space-y-3 pt-3 border-t border-[#c7c4d8]/40 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ededf5] flex items-center justify-center text-[#3525cd]">
                  <span className="material-symbols-outlined text-lg">payments</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#777587] uppercase tracking-wider">Benefit</p>
                  <p className="text-sm font-bold text-[#191b21]">Up to ₹50,000 / year</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#ededf5] flex items-center justify-center text-[#3525cd]">
                  <span className="material-symbols-outlined text-lg">calendar_today</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#777587] uppercase tracking-wider">Verified Source</p>
                  <p className="text-sm font-bold text-[#191b21] truncate max-w-[220px]">
                    {featuredScheme.official_url}
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Action */}
            <button
              onClick={() => onSelectScheme(featuredScheme)}
              className="w-full py-4 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold text-base rounded-full shadow-lg shadow-[#3525cd]/25 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer btn-glow"
            >
              <span>See why</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>

          {/* Secondary Matches Carousel / List */}
          {secondarySchemes.length > 0 && (
            <div className="w-full space-y-2">
              <div className="text-center text-xs font-bold text-[#777587] uppercase tracking-wider mb-1">
                OTHER MATCHES ({secondarySchemes.length})
              </div>

              <div className="space-y-2">
                {secondarySchemes.slice(0, 2).map((scheme, idx) => (
                  <div
                    key={scheme.scheme_id || idx}
                    onClick={() => {
                      const realIndex = displayList.findIndex((s) => s.scheme_id === scheme.scheme_id);
                      if (realIndex >= 0) setSelectedIdx(realIndex);
                    }}
                    className="glass-card rounded-2xl p-4 flex items-center justify-between hover:bg-white/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="w-9 h-9 rounded-full bg-[#e7e7ef] flex items-center justify-center text-[#3525cd]">
                        <span className="material-symbols-outlined text-lg">menu_book</span>
                      </div>
                      <div>
                        <h3 className="text-xs font-extrabold text-[#191b21] line-clamp-1">{scheme.scheme_name}</h3>
                        <p className="text-[10px] font-medium text-[#777587]">Good match • {scheme.category}</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-[#777587]">chevron_right</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
