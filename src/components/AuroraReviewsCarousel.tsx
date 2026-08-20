'use client';

import { useRef, useState, useEffect } from 'react';
import { Star, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ReviewItem {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  date?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

const auroraPalettes = [
  {
    bg: 'from-blue-900/50 via-indigo-900/40 to-purple-900/50',
    border: 'border-blue-500/40 hover:border-blue-400/80',
    avatarBg: 'bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600',
    glow: 'bg-blue-500/25',
    accentText: 'text-cyan-300',
  },
  {
    bg: 'from-emerald-900/50 via-teal-900/40 to-cyan-900/50',
    border: 'border-emerald-500/40 hover:border-emerald-400/80',
    avatarBg: 'bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500',
    glow: 'bg-emerald-500/25',
    accentText: 'text-emerald-300',
  },
  {
    bg: 'from-purple-900/50 via-pink-900/40 to-indigo-900/50',
    border: 'border-purple-500/40 hover:border-purple-400/80',
    avatarBg: 'bg-gradient-to-tr from-pink-400 via-purple-500 to-indigo-600',
    glow: 'bg-pink-500/25',
    accentText: 'text-pink-300',
  },
  {
    bg: 'from-amber-900/50 via-orange-900/40 to-yellow-900/50',
    border: 'border-amber-500/40 hover:border-amber-400/80',
    avatarBg: 'bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-500',
    glow: 'bg-amber-500/25',
    accentText: 'text-amber-300',
  },
];

export default function AuroraReviewsCarousel({ reviews }: { reviews: ReviewItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Infinite continuous ticker auto-scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let animationFrameId: number;

    const scroll = () => {
      if (!isHovered && !isMouseDown) {
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 2) {
          container.scrollLeft = 0; // Loop back seamlessly
        } else {
          container.scrollLeft += 1.2; // Smooth continuous marquee scroll
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered, isMouseDown]);

  // Mouse Drag / Touch Swipe Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    setIsMouseDown(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeft(container.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
    setIsHovered(false);
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2;
    container.scrollLeft = scrollLeft - walk;
  };

  const scrollPrev = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -380, behavior: 'smooth' });
    }
  };

  const scrollNext = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 380, behavior: 'smooth' });
    }
  };

  // Triple reviews array for infinite seamless looping across full screen widths
  const displayReviews = [...reviews, ...reviews, ...reviews];

  return (
    <section className="relative w-full overflow-hidden bg-slate-950 text-white py-20">
      
      {/* Background Aurora Radial Light Floods */}
      <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-96 bg-emerald-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> Google Verified Reviews ({reviews.length})
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              What Students & Locals Say
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
              Continuous live feedback from Google Maps for Student Zone Xerox & Binding Shop, Tenali. Hover or drag to pause.
            </p>
          </div>

          <div className="flex items-center justify-center sm:justify-end space-x-3 shrink-0">
            <button
              onClick={scrollPrev}
              className="p-3 rounded-2xl bg-slate-900/90 hover:bg-blue-600 border border-slate-800 text-white shadow-lg transition active:scale-95"
              aria-label="Previous Reviews"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollNext}
              className="p-3 rounded-2xl bg-slate-900/90 hover:bg-blue-600 border border-slate-800 text-white shadow-lg transition active:scale-95"
              aria-label="Next Reviews"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH EDGE-TO-EDGE CAROUSEL WRAPPER WITH FADE GRADIENT MASKS */}
      <div className="relative w-full overflow-hidden">
        
        {/* Left Edge Smooth Vignette Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-20 pointer-events-none" />

        {/* Right Edge Smooth Vignette Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-slate-950 via-slate-950/80 to-transparent z-20 pointer-events-none" />

        {/* FULL BLEED HORIZONTAL MARQUEE TRACK */}
        <div
          ref={containerRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex space-x-6 overflow-x-auto scrollbar-none py-4 px-6 sm:px-16 cursor-grab active:cursor-grabbing select-none scroll-smooth w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayReviews.map((rev, idx) => {
            const palette = auroraPalettes[idx % auroraPalettes.length];
            const initials = getInitials(rev.customerName);

            return (
              <div
                key={`${rev.id}-${idx}`}
                className={`w-[320px] sm:w-[400px] shrink-0 p-6 rounded-3xl bg-gradient-to-br ${palette.bg} border ${palette.border} backdrop-blur-xl shadow-2xl flex flex-col justify-between space-y-6 group hover:-translate-y-1.5 transition-all duration-300 relative`}
              >
                {/* Glowing Aurora Spot inside card */}
                <div className={`absolute top-0 right-0 w-32 h-32 ${palette.glow} rounded-full blur-2xl pointer-events-none`} />

                <div className="space-y-4 relative z-10">
                  {/* Header: Avatar + Name */}
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl ${palette.avatarBg} text-white font-black text-sm flex items-center justify-center shadow-lg ring-2 ring-white/20 shrink-0`}>
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-white text-sm truncate">
                        {rev.customerName}
                      </h3>
                      <span className="text-[11px] text-slate-400 block font-medium">
                        {rev.date || 'Google Review'}
                      </span>
                    </div>
                  </div>

                  {/* 5-Star Rating */}
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-slate-200 leading-relaxed italic line-clamp-4">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
                  <span className={`text-[11px] font-bold ${palette.accentText} flex items-center gap-1`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Google Customer
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-white/10 px-2 py-0.5 rounded border border-white/10">
                    Tenali, AP
                  </span>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
