import TextField from '@mui/material/TextField';

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

const InputField = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled,
  required,
}: InputFieldProps) => {
  return (
    <TextField
      fullWidth
      id={name}
      name={name}
      label={label}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      error={!!error}
      helperText={error}
      variant="outlined"
      size="small"
    />
  );
};

export default InputField;