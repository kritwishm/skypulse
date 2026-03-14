"use client";

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
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-slate-400">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.toUpperCase())}
        placeholder={placeholder}
        maxLength={3}
        required={required}
        className="rounded-lg border border-slate-700/40 bg-slate-800/40 px-3 py-2.5
                   font-mono text-base tracking-widest text-slate-200
                   placeholder-slate-600 outline-none
                   transition-colors
                   focus:border-blue-500/40 focus:bg-slate-800/50 focus:ring-1 focus:ring-blue-500/20"
      />
    </div>
  );
}
