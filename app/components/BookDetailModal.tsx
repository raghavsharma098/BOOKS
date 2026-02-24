'use client';

import React from 'react';

type Props = {
  onClose: () => void;
};

export default function BookDetailModal({ onClose }: Props): JSX.Element {
  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center" role="dialog" aria-modal="true">
      <div
        className="fixed inset-0 bg-black/30"
        style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      <div className="relative bg-[rgba(246,241,234,0.98)] border border-[rgba(33,12,0,0.08)] rounded-2xl shadow-lg max-w-3xl w-[92%] sm:w-[720px] p-5 sm:p-6 z-[1201]">
        <button
          aria-label="Close book detail"
          onClick={onClose}
          className="absolute right-3 top-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="#0C1421" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <div className="w-32 h-44 bg-[#E8E4D9] rounded-lg flex-shrink-0 overflow-hidden" />

          <div className="flex-1">
            <h3 className="text-lg font-serif text-[#210C00]">Book title</h3>
            <p className="text-xs text-[#6B4A33] mt-1">~ Author name</p>

            <div className="mt-4 text-sm text-[#0C1421] leading-relaxed">
              Short description / excerpt goes here. This lightweight modal is a placeholder that restores the missing component so the dashboard can compile. Replace with the full detail UI when available.
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" className="rounded-full bg-[#60351B] text-white px-4 py-2 text-sm font-medium">Read</button>
              <button type="button" className="rounded-full border border-[#210C00] px-4 py-2 text-sm font-medium">Want to read</button>
              <button type="button" className="rounded-full border border-[#C4BFB5] px-4 py-2 text-sm text-[#6B4A33]">Share</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
