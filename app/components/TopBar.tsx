'use client';

import React from 'react';
import SearchBar from './SearchBar';
import UserNavbar from './UserNavbar';

export interface TopBarProps {
  query: string;
  setQuery: (q: string) => void;
  placeholder?: string;
  filters: any;
  setFilters: (f: any) => void;
  pickRandomBook: () => void;
  setSearchBarFilterOpen: (open: boolean) => void;
}

export default function TopBar({
  query,
  setQuery,
  placeholder = '',
  filters,
  setFilters,
  pickRandomBook,
  setSearchBarFilterOpen,
}: TopBarProps) {
  return (
    <div className="relative z-[70] flex items-center justify-start lg:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 px-3 sm:px-4 pt-3 sm:pt-4 lg:px-8">
      {/* Search bar (desktop only) */}
      <div className="hidden lg:block lg:-ml-[96px]">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={placeholder}
          initialFilters={filters}
          onApplyFilters={setFilters}
          onPickRandom={pickRandomBook}
          onFilterOpenChange={setSearchBarFilterOpen}
        />
      </div>

      {/* User / notification block - visible on large screens */}
      <UserNavbar />
    </div>
  );
}
