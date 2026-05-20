import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface TimePickerFieldProps {
  label: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minTime?: Date;
  maxTime?: Date;
}

const createTime = (hours: number, minutes: number): Date => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const TimePickerField = ({
  label,
  selected,
  onChange,
  error,
  placeholder = 'Select time',
  required,
  disabled,
  minTime,
  maxTime,
}: TimePickerFieldProps) => {

  const resolvedMinTime = minTime ?? createTime(8, 0);
  const resolvedMaxTime = maxTime ?? createTime(20, 0);

  const resolvedSelected = selected ?? new Date();

  return (
    <div className="flex flex-col gap-1 w-full">

      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <DatePicker
        selected={resolvedSelected}
        onChange={onChange}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={30}
        timeCaption="Time"
        dateFormat="HH:mm"
        placeholderText={placeholder}
        disabled={disabled}
        minTime={resolvedMinTime}
        maxTime={resolvedMaxTime}
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

export default TimePickerField;