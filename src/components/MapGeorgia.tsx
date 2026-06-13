/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';

interface MapGeorgiaProps {
  selectedCity: string;
  onSelectCity: (cityId: string) => void;
  lang: 'en' | 'ka';
  cityCounts: Record<string, number>;
}

export default function MapGeorgia({ selectedCity, onSelectCity, lang, cityCounts }: MapGeorgiaProps) {
  // Coordinates and positions for a stylized vector layout representing Georgia's core cities/regions
  const mapNodes = [
    { id: "tbilisi", nameEn: "Tbilisi", nameKa: "თბილისი", x: 74, y: 56, size: 24, badgePos: 'top' },
    { id: "batumi", nameEn: "Batumi", nameKa: "ბათუმი", x: 20, y: 68, size: 20, badgePos: 'bottom' },
    { id: "kutaisi", nameEn: "Kutaisi", nameKa: "ქუთაისი", x: 42, y: 46, size: 20, badgePos: 'top' },
    { id: "rustavi", nameEn: "Rustavi", nameKa: "რუსთავი", x: 80, y: 65, size: 16, badgePos: 'right' },
    { id: "gori", nameEn: "Gori", nameKa: "გორი", x: 58, y: 48, size: 18, badgePos: 'top' },
    { id: "zugdidi", nameEn: "Zugdidi", nameKa: "ზუგდიდი", x: 22, y: 34, size: 18, badgePos: 'left' },
    { id: "poti", nameEn: "Poti", nameKa: "ფოთი", x: 18, y: 48, size: 16, badgePos: 'bottom' },
    { id: "mtskheta", nameEn: "Mtskheta", nameKa: "მცხეთა", x: 70, y: 48, size: 16, badgePos: 'top' },
    { id: "telavi", nameEn: "Telavi", nameKa: "თელავი", x: 88, y: 46, size: 18, badgePos: 'right' },
    { id: "akhaltsikhe", nameEn: "Akhaltsikhe", nameKa: "ახალციხე", x: 44, y: 66, size: 16, badgePos: 'left' },
    { id: "borjomi", nameEn: "Borjomi", nameKa: "ბორჯომი", x: 52, y: 60, size: 16, badgePos: 'right' }
  ];

  return (
    <div 
      id="georgia-interactive-map" 
      className="relative w-full overflow-hidden rounded-3xl bg-white p-6 transition-all border-2 border-[#FFE8D6] shadow-[0_8px_0_#FFF0E0]"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-left">
        <div>
          <h3 className="text-xl font-black text-[#2D3436] font-sans tracking-tight">
            {lang === 'en' ? "Interactive Georgia Map" : "საქართველოს რუკა"}
          </h3>
          <p className="text-xs text-zinc-500 font-bold">
            {lang === 'en' ? "Filter regional reports on click" : "დააწკაპუნეთ რეგიონს ფილტრაციისთვის"}
          </p>
        </div>
        {selectedCity && (
          <button
            id="clear-city-map-filter"
            onClick={() => onSelectCity('')}
            className="text-xs font-black px-3 py-1.5 rounded-xl bg-[#FF6B6B] text-white hover:opacity-90 transition-all shadow-sm"
          >
            {lang === 'en' ? "Show All Regions" : "ყველა რეგიონი"}
          </button>
        )}
      </div>

      <div className="relative aspect-[16/9] w-full min-h-[220px] sm:min-h-[300px] border-2 border-dashed border-[#FFD3B6] rounded-2xl bg-[#FFFBF7] overflow-hidden">
        {/* Stylized background contours of Georgia (Black Sea and borders) */}
        <div className="absolute inset-x-0 bottom-0 top-0 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 60" preserveAspectRatio="none">
            <path d="M 0,35 Q 15,36 17,25 T 10,10" fill="none" stroke="#4A90E2" strokeWidth="1" />
            <path d="M 10,12 L 40,8 L 70,16 L 100,10" fill="none" stroke="#2CB67D" strokeWidth="1" />
            <path d="M 15,55 L 45,58 L 75,54 L 100,45" fill="none" stroke="#FF6B6B" strokeWidth="1" />
          </svg>
        </div>

        {/* Labels for geographical references */}
        <div className="absolute bottom-4 left-4 text-[10px] font-black tracking-widest text-[#4A90E2] flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded bg-[#4A90E2]" />
          {lang === 'en' ? "BLACK SEA" : "შავი ზღვა"}
        </div>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-black text-emerald-600 tracking-widest uppercase">
          {lang === 'en' ? "CAUCASUS REGION" : "კავკასიონი"}
        </div>

        {/* Render interactive city pulse pins */}
        {mapNodes.map((node) => {
          const count = cityCounts[node.id] || 0;
          const isSelected = selectedCity === node.id;

          return (
            <div
              key={node.id}
              id={`map-node-${node.id}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group z-10"
            >
              {/* Ripple Animation if active listings exist */}
              {count > 0 && (
                <div className="absolute -inset-2 rounded-full animate-ping opacity-40 bg-[#FF8E3C] pointer-events-none" />
              )}

              {/* Pin representation */}
              <button
                id={`btn-map-node-${node.id}`}
                onClick={() => onSelectCity(node.id)}
                className={`relative flex items-center justify-center p-1.5 rounded-full shadow-md transition-all border-2 
                  ${isSelected 
                    ? 'bg-[#FF8E3C] border-black text-white scale-125 z-20 shadow-[0_4px_0_rgba(0,0,0,0.2)]' 
                    : count > 0 
                      ? 'bg-orange-100 border-[#FF8E3C] text-[#FF8E3C] hover:scale-110' 
                      : 'bg-white border-zinc-200 text-zinc-400 hover:scale-110'
                  }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#FF6B6B] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                    {count}
                  </span>
                )}
              </button>

              {/* Name tooltip */}
              <div 
                className={`absolute pointer-events-none whitespace-nowrap bg-zinc-900 text-white text-[10px] px-2 py-0.5 rounded-lg shadow-md group-hover:opacity-100 opacity-0 md:opacity-100 transition-opacity flex items-center gap-1 font-bold border border-black/10
                  ${node.badgePos === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2' : ''}
                  ${node.badgePos === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2' : ''}
                  ${node.badgePos === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2' : ''}
                  ${node.badgePos === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-2' : ''}
                `}
              >
                <span>{lang === 'en' ? node.nameEn : node.nameKa}</span>
                {count > 0 && <span className="bg-[#2CB67D] text-white text-[9px] px-1 rounded font-black">{count}</span>}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Quick Legend Info */}
      <div className="mt-3 text-[11px] text-zinc-500 font-bold flex flex-wrap gap-4 items-center justify-center">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF8E3C]" />
          {lang === 'en' ? "Active Listings Found" : "აქტიური ძებნა"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full border border-zinc-300 bg-white" />
          {lang === 'en' ? "No Current Listings" : "ამჟამად ცარიელია"}
        </span>
      </div>
    </div>
  );
}
