import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function MatchGauge({ 
  percentage, 
  matchedCount, 
  totalCount, 
  size = 'md',
  showDetails = true 
}) {
  const pct = Math.min(100, Math.max(0, Math.round(percentage ?? 0)));

  // Color schemes with Pistachio Green #B8D8A2 as the primary match indicator
  let color = {
    bg: 'bg-[#B8D8A2]',
    light: 'bg-[#f0f7ec] text-[#142611] border-[#B8D8A2]',
    badge: 'text-[#142611] bg-[#B8D8A2] font-bold',
    border: 'border-[#B8D8A2]',
    text: 'text-[#244118]',
    hex: '#B8D8A2',
    label: 'High Match'
  };

  if (pct < 50) {
    color = {
      bg: 'bg-slate-300',
      light: 'bg-slate-50 text-slate-800 border-slate-200',
      badge: 'text-slate-800 bg-slate-200',
      border: 'border-slate-300',
      text: 'text-slate-700',
      hex: '#cbd5e1',
      label: 'Developing'
    };
  } else if (pct < 75) {
    color = {
      bg: 'bg-[#dceccf]',
      light: 'bg-[#f7faf4] text-[#1e3814] border-[#dceccf]',
      badge: 'text-[#1e3814] bg-[#dceccf]',
      border: 'border-[#dceccf]',
      text: 'text-[#2f5420]',
      hex: '#dceccf',
      label: 'Good Match'
    };
  }

  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs ${color.light}`}>
        <span className="w-2 h-2 rounded-full bg-[#142611]"></span>
        <span>{pct}% Match</span>
        {matchedCount !== undefined && totalCount !== undefined && (
          <span className="opacity-80 font-medium">({matchedCount}/{totalCount})</span>
        )}
      </div>
    );
  }

  if (size === 'badge') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs ${color.badge}`}>
        <span>🎯 {pct}%</span>
        {showDetails && <span className="opacity-80 font-semibold">• {color.label}</span>}
      </span>
    );
  }

  // Circular gauge for Project Details / Dashboards
  const radius = size === 'lg' ? 44 : 32;
  const strokeWidth = size === 'lg' ? 7 : 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;
  const dimension = (radius + strokeWidth) * 2;

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center" style={{ width: dimension, height: dimension }}>
        <svg className="w-full h-full -rotate-90">
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke="#f0f3ed"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            stroke={color.hex}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className={`font-mono font-extrabold text-[#111827] leading-none ${size === 'lg' ? 'text-2xl' : 'text-base'}`}>
            {pct}%
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-[#111827]">{color.label}</span>
          </div>
          {matchedCount !== undefined && totalCount !== undefined ? (
            <p className="text-[11px] text-slate-500 font-medium">
              {matchedCount} of {totalCount} verified skills matched
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 font-medium">
              Calculated compatibility
            </p>
          )}
        </div>
      )}
    </div>
  );
}
