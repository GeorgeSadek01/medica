import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerFieldProps {
  label: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

const DatePickerField = ({
  label,
  selected,
  onChange,
  error,
  minDate,
  maxDate,
  placeholder = 'Select date',
  required,
  disabled,
}: DatePickerFieldProps) => {
  return (
    <div className="flex flex-col gap-1 w-full">

      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <DatePicker
        selected={selected}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        placeholderText={placeholder}
        disabled={disabled}
        dateFormat="yyyy-MM-dd"
        wrapperClassName="w-full"
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
};

export default DatePickerField;