import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import type { Dayjs } from 'dayjs';

interface DatePickerFieldProps {
  label: string;
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  error?: string;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  disabled?: boolean;
  required?: boolean;
}

const DatePickerField = ({
  label,
  value,
  onChange,
  error,
  minDate,
  maxDate,
  disabled,
  required,
}: DatePickerFieldProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        slotProps={{
          textField: {
            fullWidth: true,
            size: 'small',
            required: required,
            error: !!error,
            helperText: error,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default DatePickerField;
