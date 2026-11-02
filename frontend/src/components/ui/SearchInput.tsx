import React, { useState, useEffect, useRef } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { Search, X } from 'lucide-react';
import { UAGRM_TOKENS } from '@/theme/tokens';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  fullWidth?: boolean;
  maxWidth?: number | string | Record<string, number | string>;
  disabled?: boolean;
  countLabel?: string | number;
  size?: 'small' | 'medium';
}

/**
 * Componente Reutilizable de Búsqueda Institucional UAGRM.
 * Incluye icono de lupa, botón de limpieza rápida 'X', debounce opcional y badge de conteo.
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Buscar...',
  debounceMs = 0,
  fullWidth = true,
  maxWidth = 450,
  disabled = false,
  countLabel,
  size = 'small',
}) => {
  const [internalValue, setInternalValue] = useState<string>(value);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setInternalValue(nextVal);

    if (debounceMs > 0) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        onChange(nextVal);
      }, debounceMs);
    } else {
      onChange(nextVal);
    }
  };

  const handleClear = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setInternalValue('');
    onChange('');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        width: fullWidth ? '100%' : 'auto',
        maxWidth: maxWidth,
      }}
    >
      <TextField
        fullWidth
        size={size}
        placeholder={placeholder}
        value={internalValue}
        onChange={handleInputChange}
        disabled={disabled}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search size={18} color={UAGRM_TOKENS.colors.text.muted} />
              </InputAdornment>
            ),
            endAdornment: internalValue ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClear}
                  edge="end"
                  aria-label="Limpiar búsqueda"
                  sx={{ color: UAGRM_TOKENS.colors.text.muted, '&:hover': { color: UAGRM_TOKENS.colors.text.primary } }}
                >
                  <X size={15} />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2.5,
            backgroundColor: UAGRM_TOKENS.colors.background.paper,
            borderColor: UAGRM_TOKENS.colors.border.default,
            transition: 'border-color 0.2s ease',
            '&:hover fieldset': {
              borderColor: UAGRM_TOKENS.colors.border.strong,
            },
            '&.Mui-focused fieldset': {
              borderColor: UAGRM_TOKENS.colors.primary.main,
              borderWidth: '1.5px',
            },
          },
        }}
      />

      {countLabel !== undefined && (
        <Chip
          label={countLabel}
          size="small"
          sx={{
            fontWeight: UAGRM_TOKENS.typography.weights.bold,
            backgroundColor: 'rgba(30, 43, 77, 0.08)',
            color: UAGRM_TOKENS.colors.primary.main,
            borderRadius: UAGRM_TOKENS.radii.pill,
            height: 28,
            fontSize: '0.75rem',
          }}
        />
      )}
    </Box>
  );
};

export default SearchInput;

