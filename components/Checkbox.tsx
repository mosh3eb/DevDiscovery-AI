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
    <label 
      htmlFor={id} 
      className={`flex items-center p-2.5 rounded-lg transition-all duration-150 ease-in-out 
                  ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:bg-slate-700/70'} 
                  ${checked ? 'bg-slate-700 ring-1 ring-teal-500/70' : 'bg-slate-700/40'}`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 text-teal-500 border-slate-500 rounded focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-800 bg-slate-600 disabled:opacity-60 disabled:cursor-not-allowed"
      />
      <span 
        className={`ml-3 text-sm 
                    ${disabled ? 'text-slate-400' : 'text-slate-200'} 
                    ${checked ? 'font-semibold text-teal-300' : ''}`}
      >
        {label}
      </span>
    </label>
  );
};

export default Checkbox;