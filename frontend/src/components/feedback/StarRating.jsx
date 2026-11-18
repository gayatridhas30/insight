import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const StarRating = ({ value = 0, onChange, max = 5, disabled = false, size = 28 }) => {
  const { t } = useTranslation();
  const [hoverValue, setHoverValue] = useState(0);

  const labelKeys = ['ratings.poor', 'ratings.fair', 'ratings.good', 'ratings.veryGood', 'ratings.excellent'];
  const activeValue = hoverValue || value;
  const labelKey = labelKeys[activeValue - 1];

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex items-center gap-2">
        {Array.from({ length: max }, (_, index) => {
          const starValue = index + 1;
          const isFilled = (hoverValue || value) >= starValue;

          return (
            <button
              key={starValue}
              type="button"
              disabled={disabled}
              onClick={() => onChange && onChange(starValue)}
              onMouseEnter={() => !disabled && setHoverValue(starValue)}
              onMouseLeave={() => !disabled && setHoverValue(0)}
              className={`p-1.5 rounded-lg transition-transform focus:outline-none ${
                disabled ? 'cursor-default' : 'cursor-pointer hover:scale-110 active:scale-95'
              }`}
              aria-label={t('ratings.starAria', { n: starValue })}
            >
              <Star
                size={size}
                className={`transition-colors ${
                  isFilled
                    ? 'fill-coral text-coral drop-shadow-sm'
                    : 'text-charcoal/20 fill-transparent hover:text-coral/50'
                }`}
              />
            </button>
          );
        })}
      </div>
      {activeValue > 0 && (
        <span className="text-xs font-semibold text-charcoal/70 tracking-wide">
          {labelKey ? t(labelKey) : t('ratings.starsCount', { n: activeValue })}
        </span>
      )}
    </div>
  );
};

export default StarRating;
