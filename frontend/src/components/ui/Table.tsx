import React from 'react';
import MuiTable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { UAGRM_TOKENS } from '@/theme/tokens';

export interface Column<T> {
  id: string;
  label: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  render?: (row: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  minWidth?: number | string;
}

/**
 * Tabla Institucional UAGRM centralizada y reutilizable.
 * Estandariza cabeceras plomo-gris (#475569) con fondo institucional (#faf8f5),
 * bordes suaves, hover, estado de carga y mensaje de lista vacía.
 */
export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No se encontraron registros.',
  onRowClick,
  minWidth = 800,
}: TableProps<T>) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${UAGRM_TOKENS.border.subtle}`,
        backgroundColor: UAGRM_TOKENS.colors.background.paper,
        overflow: 'hidden',
        boxShadow: UAGRM_TOKENS.shadows.card,
      }}
    >
      <MuiTable sx={{ minWidth }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: UAGRM_TOKENS.colors.table.headerBg }}>
            {columns.map((col, index) => (
              <TableCell
                key={col.id}
                align={col.align || 'left'}
                style={{ width: col.width }}
                sx={{
                  backgroundColor: UAGRM_TOKENS.colors.table.headerBg,
                  color: UAGRM_TOKENS.colors.table.headerText,
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  py: 1.8,
                  pl: index === 0 ? 3 : 2,
                  pr: index === columns.length - 1 ? 3 : 2,
                  borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}`,
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                <CircularProgress size={34} sx={{ color: UAGRM_TOKENS.colors.royalBlue, mb: 1.5 }} />
                <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 600 }}>
                  Cargando información...
                </Typography>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                <Box sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.slate, fontWeight: 600 }}>
                    {emptyMessage}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow
                key={keyExtractor(row)}
                hover
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:last-child td, &:last-child th': { border: 0 },
                  borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}`,
                  transition: 'background-color 0.15s ease',
                  '&:hover': {
                    backgroundColor: UAGRM_TOKENS.colors.table.rowHover,
                  },
                  '& td': {
                    borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}`,
                    py: 1.8,
                  },
                }}
              >
                {columns.map((col, index) => (
                  <TableCell
                    key={col.id}
                    align={col.align || 'left'}
                    sx={{
                      pl: index === 0 ? 3 : 2,
                      pr: index === columns.length - 1 ? 3 : 2,
                    }}
                  >
                    {col.render ? col.render(row) : (row as Record<string, unknown>)[col.id] as React.ReactNode}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </MuiTable>
    </TableContainer>
  );
}

export default Table;
