import React from 'react';
import { Check, X } from 'lucide-react';

export default function SkillBadge({ 
  skill, 
  variant = 'neutral', // 'neutral' | 'matched' | 'missing' | 'brand' | 'interactive'
  onRemove,
  onClick,
  size = 'md'
}) {
  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : size === 'lg' 
    ? 'text-sm px-3.5 py-1.5' 
    : 'text-xs px-2.5 py-1';

  let variantClasses = 'bg-slate-100 text-slate-800 border-slate-200';

  if (variant === 'matched') {
    variantClasses = 'bg-[#f0f7ec] text-[#244118] border-[#B8D8A2] font-semibold';
  } else if (variant === 'missing') {
    variantClasses = 'bg-amber-50/80 text-amber-900 border-amber-200 font-medium';
  } else if (variant === 'brand') {
    variantClasses = 'bg-[#B8D8A2] text-[#142611] border-[#a2c889] font-bold shadow-xs';
  } else if (variant === 'interactive') {
    variantClasses = 'bg-white hover:bg-[#f0f7ec] text-slate-800 hover:text-[#142611] border-slate-300 hover:border-[#B8D8A2] cursor-pointer transition-all';
  }

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-2xs transition-all ${sizeClasses} ${variantClasses}`}
    >
      {variant === 'matched' && <Check className="w-3 h-3 text-[#244118] shrink-0 stroke-[2.5]" />}
      {variant === 'missing' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>}
      {variant === 'brand' && <span className="w-1.5 h-1.5 rounded-full bg-[#142611] shrink-0"></span>}
      
      <span>{skill}</span>

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(skill);
          }}
          className="ml-0.5 text-slate-500 hover:text-rose-600 rounded-full hover:bg-black/10 p-0.5 transition-colors"
          title={`Remove ${skill}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
