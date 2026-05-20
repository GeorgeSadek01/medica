import { forwardRef } from 'react';

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled,
  required,
}, ref) => {
  return (
    <div className="flex flex-col gap-1 w-full">

      <label
        htmlFor={name}
        className="text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <input
        ref={ref}
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full px-3 py-2 rounded-lg border text-sm text-slate-800
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-gray-300'
          }
        `}
      />

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}

    </div>
  );
});

InputField.displayName = 'InputField';
export default InputField;