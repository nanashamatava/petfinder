/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Calendar, Heart, Share2, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import { PetListing, Language } from '../types';
import { translations } from '../lib/translations';
import { geCities } from '../lib/translations';

interface ListingCardProps {
  key?: string;
  listing: PetListing;
  lang: Language;
  onViewDetails: (listing: PetListing) => void;
  onToggleFavorite: (listingId: string) => void;
  isFavorite: boolean;
  currentUser: any;
  isAdmin: boolean;
  onEdit: (listing: PetListing) => void;
  onDelete: (listingId: string) => void;
  onMarkReunited: (listingId: string) => void;
  isShareSupported: boolean;
  onCopySuccess: () => void;
}

export default function ListingCard({
  listing,
  lang,
  onViewDetails,
  onToggleFavorite,
  isFavorite,
  currentUser,
  isAdmin,
  onEdit,
  onDelete,
  onMarkReunited,
  isShareSupported,
  onCopySuccess
}: ListingCardProps) {
  const t = translations[lang];

  // Resolve matching localized city name
  const cityObj = geCities.find(c => c.id === listing.city);
  const cityName = cityObj 
    ? (lang === 'en' ? cityObj.nameEn : cityObj.nameKa) 
    : (lang === 'en' ? 'Georgia' : 'საქართველო');

  // Author or administrator verification check
  const isPoster = currentUser && currentUser.uid === listing.userId;
  const canModify = isPoster || isAdmin;

  // Handles copying share information safely
  function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    const shareText = `[${listing.type === 'lost' ? 'LOST/დაკარგული' : 'FOUND/ნაპოვნი'} - ${listing.animalType}] ${listing.name || ''} in ${cityName}, ${listing.location}. Contact: ${listing.contactPhone}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        onCopySuccess();
      }).catch(err => console.error("Clipboard copy failed: ", err));
    } else {
      // Fallback
      const el = document.createElement('textarea');
      el.value = shareText;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      onCopySuccess();
    }
  }

  return (
    <article
      id={`pet-listing-card-${listing.id}`}
      onClick={() => onViewDetails(listing)}
      className="group relative cursor-pointer flex flex-col justify-between overflow-hidden bg-white border-2 border-[#F0E6D2] rounded-3xl shadow-[0_8px_0_#F0E6D2] hover:translate-y-[-4px] active:translate-y-[2px] transition-all duration-200"
    >
      
      {/* Visual Header containing Pet Image & Indicators */}
      <div className="relative aspect-[4/3] w-full bg-zinc-100 overflow-hidden select-none">
        {listing.photo ? (
          <img
            id={`listing-image-${listing.id}`}
            src={listing.photo}
            alt={listing.animalType}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 border-b border-zinc-100 text-zinc-400">
            <span className="text-4xl">🐾</span>
            <span className="text-xs font-black uppercase mt-1">No Image Provide</span>
          </div>
        )}

        {/* Status badges overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <span 
            id={`badge-type-${listing.id}`}
            className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full text-white shadow-sm border border-black/10
              ${listing.type === 'lost' ? 'bg-[#FF6B6B]' : 'bg-[#2CB67D]'}`}
          >
            {listing.type === 'lost' 
              ? (lang === 'en' ? 'LOST / ვეძებ' : 'დაკარგული') 
              : (lang === 'en' ? 'FOUND / ვიპოვე' : 'ნაპოვნი')
            }
          </span>
          {listing.status === 'reunited' && (
            <span 
              id={`badge-reunited-${listing.id}`}
              className="text-[9px] font-black uppercase tracking-widest bg-amber-400 text-amber-950 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-amber-500"
            >
              🎉 {t.reunitedLabel}
            </span>
          )}
        </div>

        {/* Reward badge overlay */}
        {listing.type === 'lost' && listing.reward && (
          <span 
            id={`badge-reward-${listing.id}`}
            className="absolute bottom-3 left-3 text-[10px] font-black uppercase bg-amber-400 text-amber-950 px-2.5 py-1.5 rounded-full shadow-sm border border-amber-500"
          >
            💰 {listing.reward}
          </span>
        )}

        {/* Favorite action overlay */}
        <button
          id={`btn-favorite-toggle-${listing.id}`}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(listing.id); }}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 hover:bg-white text-[#FF6B6B] transition-transform active:scale-90 shadow-sm border border-[#F0E6D2]"
          title={t.favoritesOnly}
        >
          <Heart className={`w-4 h-4 stroke-[3] ${isFavorite ? 'fill-[#FF6B6B]' : ''}`} />
        </button>
      </div>

      {/* Body Details Area */}
      <div className="p-4 flex-grow flex flex-col justify-between text-left">
        <div>
          {/* Metadata row */}
          <div className="flex items-center gap-2 text-[10px] text-[#FF8E3C] font-black uppercase tracking-wider mb-1">
            <span>{listing.animalType}</span>
            <span>•</span>
            <span className="text-zinc-500">{cityName}</span>
          </div>

          {/* Heading */}
          <h4 id={`listing-title-${listing.id}`} className="text-lg font-black text-[#2D3436] font-sans truncate pr-4">
            {listing.name || (lang === 'en' ? "Unnamed Pet" : "უშემჩნევო")}
          </h4>

          {/* Core short description preview */}
          <p id={`listing-desc-preview-${listing.id}`} className="text-xs text-zinc-500 font-bold mb-3 mt-1 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Grid attributes for location and date */}
        <div className="space-y-1.5 border-t-2 border-[#FFE8D6] pt-3 text-xs font-bold text-zinc-650">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-[#FF8E3C] shrink-0" />
            <span className="truncate">{listing.location}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-[#4A90E2] shrink-0" />
            <span>{listing.date}</span>
          </div>
        </div>
      </div>

      {/* Footer / Interactive Actions Section */}
      <div className="px-4 pb-4 border-t-2 border-dashed border-[#FFE8D6] pt-3 bg-[#FFFBF7]/60 rounded-b-3xl">
        <div className="flex items-center justify-between gap-1">
          {/* Quick share button */}
          <button
            id={`btn-share-${listing.id}`}
            onClick={handleShare}
            className="flex items-center gap-1 text-[11px] font-black text-zinc-500 hover:text-[#4A90E2] transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>{t.shareListing}</span>
          </button>

          {/* Poster edits panel */}
          {canModify ? (
            <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              {listing.status === 'active' && (
                <button
                  id={`btn-mark-reunited-${listing.id}`}
                  onClick={() => onMarkReunited(listing.id)}
                  className="p-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 transition-colors"
                  title={t.reunitedStatusButton}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
              <button
                id={`btn-edit-${listing.id}`}
                onClick={() => onEdit(listing)}
                className="p-1 rounded bg-[#FFF9F2] hover:bg-amber-100 text-[#FF8E3C] border border-[#FFE8D6] transition-colors"
                title={t.editButton}
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                id={`btn-delete-${listing.id}`}
                onClick={() => onDelete(listing.id)}
                className="p-1 rounded bg-rose-50 hover:bg-rose-100 text-[#FF6B6B] border border-rose-200 transition-colors"
                title={t.deleteButton}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div id={`listing-author-name-${listing.id}`} className="text-[10px] text-zinc-400 font-bold truncate max-w-[120px]">
              By {listing.userName}
            </div>
          )}
        </div>
      </div>

    </article>
  );
}
