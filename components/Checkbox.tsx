
import React from 'react';

interface CheckboxProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ id, label, checked, onChange, disabled }) => {
  return (
    <label htmlFor={id} className={`flex items-center p-1.5 sm:p-2 rounded-md transition-colors ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-slate-700/70'} ${checked ? 'bg-slate-700' : ''}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500 border-slate-600 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-800 bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
      />
      <span className={`ml-2 sm:ml-3 text-xs sm:text-sm ${disabled ? 'text-slate-500' : 'text-slate-200'} ${checked ? 'font-semibold text-indigo-300' : ''}`}>
        {label}
      </span>
    </label>
  );
};

export default Checkbox;
