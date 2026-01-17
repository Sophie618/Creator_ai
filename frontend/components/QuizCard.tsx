
import React, { useMemo, useState } from 'react';
import { Quote, ArrowRight, ExternalLink, Share2, Link as LinkIcon } from 'lucide-react';
import ShareCard from './ShareCard';

interface QuizCardProps {
  articleId: string;
  question: string;
  options: string[];
  evidence: string;
  jumpUrl: string;
  sourceTitle?: string;
  sourceLogo?: string;
  sourceCover?: string;
  onNext: () => void;
  onDeepRead: (id: string) => void;
  isLast?: boolean;
}

const QuizCard: React.FC<QuizCardProps> = ({ 
  articleId,
  question, 
  options, 
  evidence, 
  jumpUrl, 
  sourceTitle,
  sourceLogo,
  sourceCover,
  onNext, 
  onDeepRead,
  isLast = false 
}) => {
  const [hasAnswered, setHasAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const sourceMeta = useMemo(() => {
    const lowerUrl = (jumpUrl || '').toLowerCase();
    let domain = '';
    try {
      domain = new URL(jumpUrl).hostname;
    } catch (e) {
      // ignore invalid URL
    }
    const domainLower = domain.toLowerCase();

    if (lowerUrl.includes('bilibili') || domainLower.includes('bilibili')) {
      return { logoSrc: '../public/bilibili.png', alt: 'bilibili' };
    }
    if (
      lowerUrl.includes('weixin') ||
      lowerUrl.includes('wechat') ||
      domainLower.includes('weixin') ||
      domainLower.includes('wechat')
    ) {
      return { logoSrc: '../public/wechat-article.png', alt: 'wechat' };
    }

    if (sourceLogo) return { logoSrc: sourceLogo, alt: domain || 'link' };
    const favicon = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=64` : '';
    return { logoSrc: favicon, alt: domain || 'link' };
  }, [jumpUrl, sourceLogo]);

  const displayTitle = useMemo(() => {
    const base = sourceTitle || '';
    if (base) return base.length > 25 ? `${base.slice(0, 25)}...` : base;
    const fallback = question || '';
    return fallback.length > 25 ? `${fallback.slice(0, 25)}...` : fallback;
  }, [sourceTitle, question]);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setHasAnswered(true);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  return (
    <>
    <div className="w-full max-w-[900px] mx-auto perspective-1000">
      <div className={`relative w-full min-h-[320px] flip-card-inner preserve-3d ${hasAnswered ? 'rotate-y-180' : ''}`}>
        {/* Front: Question & Options */}
        <div className="absolute inset-0 backface-hidden">
          <div className="flex flex-col justify-center items-center gap-5 w-full p-5 bg-white rounded-[32px] shadow-lg border border-slate-100">
            <h3 className="text-lg md:text-xl font-medium text-gray-900 leading-snug text-center">
              {question}
            </h3>
            <div className="flex flex-col sm:flex-row justify-center gap-6 w-full">
              {options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  disabled={hasAnswered}
                  className={`
                    px-8 py-2 rounded-full text-sm font-medium transition-all duration-300 active:scale-95 text-center
                    ${hasAnswered && selectedOption === option 
                      ? 'bg-slate-900 text-white shadow-lg scale-105' 
                      : hasAnswered
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-900 text-white hover:bg-black hover:shadow-md hover:-translate-y-0.5'
                    }
                  `}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Back: Evidence & Actions */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className="flex flex-col justify-center items-center gap-5 w-full p-5 bg-white rounded-[32px] shadow-lg border border-slate-100 text-sm text-slate-800">
            <h4 className="w-full text-base font-semibold text-slate-900 text-center leading-tight">
              {question}
            </h4>
            <div className="bg-emerald-50 border border-emerald-100 rounded-[28px] p-5 md:p-6 relative overflow-hidden w-full">
              <div className="absolute top-4 left-4 text-emerald-200 opacity-50">
                <Quote size={40} />
              </div>
              <div className="relative z-10">
                <p className="text-emerald-900 font-medium text-base leading-relaxed font-serif">
                  {evidence}
                </p>
              </div>
            </div>

            <div className="w-full flex items-center gap-3">
              {sourceMeta.logoSrc ? (
                <img
                  src={sourceMeta.logoSrc}
                  alt={sourceMeta.alt}
                  className="w-5 h-5 rounded-full object-contain bg-white border border-slate-100"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                  <LinkIcon size={18} />
                </div>
              )}
              <p className="text-sm font-medium text-slate-800 truncate" title={question}>{displayTitle}</p>
            </div>

            <div className="w-full flex items-center justify-between gap-3 pt-2">
              <div className="flex gap-2">
                <a 
                  href={jumpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
                  title="阅读原文"
                >
                  <ExternalLink size={20} />
                </a>
                <button 
                  onClick={handleShare}
                  className="p-3 rounded-full border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
                  title="分享"
                >
                  <Share2 size={20} />
                </button>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => onDeepRead(articleId)}
                  className="px-6 py-3 rounded-full border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-50 transition-all"
                >
                  进入深读
                </button>
                <button
                  onClick={onNext}
                  className="px-8 py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {isLast ? "完成" : "下一题"}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {showShareModal && (
      <ShareCard 
        onClose={() => setShowShareModal(false)} 
        title={question}
        defaultCover={sourceCover}
      />
    )}
    </>
  );
};

export default QuizCard;
  