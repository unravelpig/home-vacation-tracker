'use client';

import { useState, useMemo } from 'react';
import { X, MapPin } from 'lucide-react';
import citiesData from '@/public/data/cities.json';

interface CitySelectorProps {
  selectedCountries: string[];
  selectedCities: string[];
  onChange: (cities: string[]) => void;
  label?: string;
}

export default function CitySelector({ selectedCountries, selectedCities, onChange, label }: CitySelectorProps) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const availableCities = useMemo(() => {
    const cities: string[] = [];
    selectedCountries.forEach(countryCode => {
      const countryCities = citiesData[countryCode as keyof typeof citiesData];
      if (countryCities) {
        cities.push(...countryCities);
      }
    });
    return [...new Set(cities)].sort();
  }, [selectedCountries]);

  const filteredCities = useMemo(() => {
    if (!search) return availableCities;
    return availableCities.filter(city =>
      city.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, availableCities]);

  const handleSelect = (city: string) => {
    if (selectedCities.includes(city)) {
      onChange(selectedCities.filter(c => c !== city));
    } else {
      onChange([...selectedCities, city]);
    }
  };

  const handleRemove = (city: string) => {
    onChange(selectedCities.filter(c => c !== city));
  };

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
            ${selectedCountries.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={() => selectedCountries.length > 0 && setIsOpen(!isOpen)}
        >
          {selectedCountries.length === 0 ? (
            <span className="text-[var(--text-secondary)] px-2 py-1">
              Select a country first...
            </span>
          ) : selectedCities.length === 0 ? (
            <span className="text-[var(--text-secondary)] px-2 py-1">
              Select cities...
            </span>
          ) : (
            selectedCities.map(city => (
              <span 
                key={city}
                className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--bg-secondary)] rounded text-sm"
              >
                <MapPin size={12} />
                {city}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(city);
                  }}
                  className="hover:text-red-600"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>

        {isOpen && selectedCountries.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-[var(--border)] rounded-md shadow-lg max-h-64 overflow-hidden">
            <div className="p-2 border-b border-[var(--border)]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cities..."
                className="w-full px-3 py-2 border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-48">
              {filteredCities.length === 0 ? (
                <div className="px-3 py-2 text-sm text-[var(--text-secondary)]">
                  No cities available for the selected countries
                </div>
              ) : (
                filteredCities.map(city => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleSelect(city)}
                    className={`
                      w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-[var(--bg-secondary)]
                      ${selectedCities.includes(city) ? 'bg-[var(--accent)]/10' : ''}
                    `}
                  >
                    <MapPin size={14} className="text-[var(--text-secondary)]" />
                    <span className="text-sm">{city}</span>
                  </button>
                ))
              )}
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