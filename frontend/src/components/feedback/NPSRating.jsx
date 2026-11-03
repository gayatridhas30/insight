import React from 'react';

export const NPSRating = ({ value, onChange, disabled = false }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-11 gap-1 sm:gap-2">
        {Array.from({ length: 11 }, (_, i) => {
          const isSelected = value === i;
          let btnClass = 'border-charcoal/15 bg-white text-charcoal/80 hover:border-coral/50';

          if (isSelected) {
            if (i <= 6) {
              btnClass = 'bg-coral text-white border-coral shadow-sm scale-105';
            } else if (i <= 8) {
              btnClass = 'bg-lavender text-navy font-bold border-lavender shadow-sm scale-105';
            } else {
              btnClass = 'bg-sage-dark text-white border-sage-dark shadow-sm scale-105';
            }
          }

          return (
            <button
              key={i}
              type="button"
              disabled={disabled}
              onClick={() => onChange && onChange(i)}
              className={`h-10 sm:h-12 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center ${btnClass} ${
                disabled ? 'cursor-default' : 'cursor-pointer hover:shadow-subtle'
              }`}
            >
              {i}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-charcoal/60 px-1 font-medium">
        <span>0 — Not at all likely</span>
        <span>10 — Extremely likely</span>
      </div>
    </div>
  );
};

export default NPSRating;
