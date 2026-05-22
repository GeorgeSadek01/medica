import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

interface TimePickerFieldProps {
  label: string;
  value: Dayjs | null;
  onChange: (value: Dayjs | null) => void;
  error?: string;
  minTime?: Dayjs;
  maxTime?: Dayjs;
  disabled?: boolean;
  required?: boolean;
}

const TimePickerField = ({
  label,
  value,
  onChange,
  error,
  minTime = dayjs().hour(8).minute(0).second(0),
  maxTime = dayjs().hour(20).minute(0).second(0),
  disabled,
  required,
}: TimePickerFieldProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
        label={label}
        value={value}
        onChange={onChange}
        minTime={minTime}
        maxTime={maxTime}
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

export default TimePickerField;
