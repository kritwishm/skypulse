"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { searchAirports } from "@/lib/airportSearch";
import { getAirport } from "@/lib/getAirport";
import type { AirportInfo } from "@/lib/airports";

interface AirportInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  required?: boolean;
}

export default function AirportInput({
  value,
  onChange,
  placeholder,
  label,
  required,
}: AirportInputProps) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<AirportInfo[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Sync query when value changes externally (edit mode)
  useEffect(() => {
    if (!isOpen) {
      setQuery(value || "");
    }
  }, [value, isOpen]);

  const handleSearch = useCallback(
    (q: string) => {
      setQuery(q);
      if (q.trim().length === 0) {
        setResults([]);
        setIsOpen(false);
        onChange("");
        return;
      }
      const matches = searchAirports(q);
      setResults(matches);
      setIsOpen(matches.length > 0);
      setHighlightIdx(-1);

      // If exact IATA match typed, auto-select
      const upper = q.toUpperCase();
      if (upper.length === 3 && matches.length > 0 && matches[0].iata === upper) {
        onChange(upper);
      }
    },
    [onChange]
  );

  const selectAirport = useCallback(
    (airport: AirportInfo) => {
      onChange(airport.iata);
      setQuery(airport.iata);
      setIsOpen(false);
      setResults([]);
      inputRef.current?.blur();
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange("");
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIdx((prev) => {
          const next = prev < results.length - 1 ? prev + 1 : 0;
          listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
          return next;
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIdx((prev) => {
          const next = prev > 0 ? prev - 1 : results.length - 1;
          listRef.current?.children[next]?.scrollIntoView({ block: "nearest" });
          return next;
        });
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (highlightIdx >= 0 && highlightIdx < results.length) {
          selectAirport(results[highlightIdx]);
        }
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    },
    [isOpen, results, highlightIdx, selectAirport]
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedAirport = value ? getAirport(value) : undefined;
  const isFocused = isOpen || (query !== value && query.length > 0);

  return (
    <div className="flex flex-col gap-1.5" ref={wrapperRef}>
      <label className="text-sm text-[var(--text-secondary)]">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className="relative">
        <div
          className={`flex items-center rounded-lg border bg-input px-3 pr-8 transition-colors
            ${isFocused ? "border-blue-500/40 ring-1 ring-blue-500/20" : "border-input"}`}
        >
          <div className="flex-1 min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => {
                if (query.trim() && results.length > 0) setIsOpen(true);
                else if (query.trim()) handleSearch(query);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              required={required}
              autoComplete="off"
              className={`w-full bg-transparent text-primary tracking-wide
                         placeholder-[var(--text-muted)] outline-none
                         ${selectedAirport && !isFocused ? "pt-2 pb-0 text-base font-semibold" : "py-2.5 text-base"}`}
            />
            {selectedAirport && !isFocused && (
              <p className="text-[11px] text-tertiary truncate pb-1.5 -mt-0.5">
                {selectedAirport.city}, {selectedAirport.country}
              </p>
            )}
          </div>
        </div>
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded
                       text-[var(--text-faint)] hover:text-[var(--text-secondary)]
                       transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Dropdown */}
        {isOpen && results.length > 0 && (
          <ul
            ref={listRef}
            className="absolute z-50 left-0 right-0 mt-1 max-h-56 overflow-y-auto
                       rounded-lg border border-card bg-elevated shadow-xl shadow-black/20
                       py-0.5"
          >
            {results.map((airport, idx) => (
              <li
                key={airport.iata}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectAirport(airport);
                }}
                onMouseEnter={() => setHighlightIdx(idx)}
                className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors
                  ${idx === highlightIdx ? "bg-surface" : "hover:bg-surface"}`}
              >
                <span className="font-mono font-semibold text-xs text-blue-400 w-8 shrink-0">
                  {airport.iata}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-primary truncate">{airport.city}</p>
                  <p className="text-[11px] text-tertiary truncate">{airport.country}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
