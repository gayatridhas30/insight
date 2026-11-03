import React from 'react';
import { Globe } from 'lucide-react';

export const LanguageSelector = ({ currentLanguage = 'en', onSelectLanguage, availableLanguages = ['en', 'hi', 'mr'] }) => {
  const langConfig = {
    en: { code: 'en', label: 'English', native: 'English' },
    hi: { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    mr: { code: 'mr', label: 'Marathi', native: 'मराठी' },
  };

  return (
    <div className="flex items-center gap-1.5 p-1 bg-white/80 backdrop-blur border border-charcoal/10 rounded-xl shadow-subtle">
      <div className="pl-2 pr-1 text-charcoal/50">
        <Globe size={15} />
      </div>
      {availableLanguages.map((code) => {
        const lang = langConfig[code] || { code, label: code, native: code };
        const isSelected = currentLanguage === code;

        return (
          <button
            key={code}
            type="button"
            onClick={() => onSelectLanguage(code)}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              isSelected
                ? 'bg-navy text-white shadow-sm'
                : 'text-charcoal/70 hover:text-navy hover:bg-navy/5'
            }`}
          >
            <span>{lang.native}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSelector;
