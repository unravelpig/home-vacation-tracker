'use client';

import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import countriesData from '@/public/data/countries.json';

interface CountrySelectorProps {
  selectedCountries: string[];
  onChange: (countries: string[]) => void;
  label?: string;
}

export default function CountrySelector({ selectedCountries, onChange, label }: CountrySelectorProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredCountries = useMemo(() => {
    if (!search) return countriesData;
    return countriesData.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const handleSelect = (code: string) => {
    if (selectedCountries.includes(code)) {
      onChange(selectedCountries.filter(c => c !== code));
    } else {
      onChange([...selectedCountries, code]);
    }
  };

  const handleRemove = (code: string) => {
    onChange(selectedCountries.filter(c => c !== code));
  };

  const getCountry = (code: string) => countriesData.find(c => c.code === code);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <div 
          className={`
            min-h-[42px] p-2 border border-[var(--border)] rounded-md bg-white
            flex flex-wrap gap-1 cursor-pointer
            focus-within:ring-2 focus-within:ring-[var(--accent)] focus-within:border-transparent
            transition-all duration-200
          `}
          onClick={() => setIsOpen(!isOpen)}
        >
          {selectedCountries.length === 0 ? (
            <span className="text-[var(--text-secondary)] px-2 py-1">
              Select countries...
            </span>
          ) : (
            selectedCountries.map(code => {
              const country = getCountry(code);
              return (
                <span 
                  key={code}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--bg-secondary)] rounded text-sm"
                >
                  {country?.flag_emoji} {country?.name}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(code);
                    }}
                    className="hover:text-red-600"
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })
          )}
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-[var(--border)] rounded-md shadow-lg max-h-64 overflow-hidden">
            <div className="p-2 border-b border-[var(--border)]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search countries..."
                className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-48">
              {filteredCountries.map(country => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country.code)}
                  className={`
                    w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[var(--bg-secondary)]
                    ${selectedCountries.includes(country.code) ? 'bg-[var(--accent)]/10' : ''}
                  `}
                >
                  <span className="text-lg">{country.flag_emoji}</span>
                  <span className="text-sm">{country.name}</span>
                  <span className="ml-auto text-xs text-[var(--text-secondary)]">{country.code}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
