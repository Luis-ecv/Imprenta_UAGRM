import { forwardRef } from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

export type InputProps = Omit<TextFieldProps, 'variant'> & {
  variant?: 'outlined' | 'filled' | 'standard';
};

export const Input = forwardRef<HTMLDivElement, InputProps>(
  ({ variant = 'outlined', fullWidth = true, size = 'small', ...props }, ref) => {
    return (
      <TextField
        ref={ref}
        variant={variant}
        fullWidth={fullWidth}
        size={size}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
