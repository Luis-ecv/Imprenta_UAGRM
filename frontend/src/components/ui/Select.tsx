import React from 'react';
import FormControl, { FormControlProps } from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MuiSelect, { SelectProps as MuiSelectProps } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<MuiSelectProps, 'error'> {
  label: string;
  options: SelectOption[];
  error?: boolean | string;
  helperText?: string;
  formControlProps?: FormControlProps;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
  value,
  onChange,
  size = 'small',
  fullWidth = true,
  formControlProps,
  ...props
}) => {
  const isError = Boolean(error);
  const errorMessage = typeof error === 'string' ? error : helperText;
  const labelId = `${label.replace(/\s+/g, '-').toLowerCase()}-label`;

  return (
    <FormControl
      fullWidth={fullWidth}
      size={size}
      error={isError}
      {...formControlProps}
    >
      <InputLabel id={labelId}>{label}</InputLabel>
      <MuiSelect
        labelId={labelId}
        label={label}
        value={value}
        onChange={onChange}
        {...props}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </MenuItem>
        ))}
      </MuiSelect>
      {errorMessage && <FormHelperText>{errorMessage}</FormHelperText>}
    </FormControl>
  );
};

export default Select;
