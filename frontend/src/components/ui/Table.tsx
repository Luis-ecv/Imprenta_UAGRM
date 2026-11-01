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
  label: string;
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
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No se encontraron registros.',
  onRowClick,
}: TableProps<T>) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${UAGRM_TOKENS.colors.border.default}`,
        overflow: 'hidden',
        boxShadow: UAGRM_TOKENS.shadows.card,
      }}
    >
      <MuiTable sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                align={col.align || 'left'}
                style={{ width: col.width }}
                sx={{
                  backgroundColor: UAGRM_TOKENS.colors.table.headerBg,
                  color: UAGRM_TOKENS.colors.table.headerText,
                  fontWeight: UAGRM_TOKENS.typography.weights.extraBold,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  py: 1.8,
                  borderBottom: `2px solid ${UAGRM_TOKENS.colors.border.default}`,
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
                <CircularProgress size={32} sx={{ color: UAGRM_TOKENS.colors.primary.main }} />
                <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.text.secondary, mt: 1.5, fontWeight: 600 }}>
                  Cargando información...
                </Typography>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                <Box sx={{ py: 2 }}>
                  <Typography variant="body2" sx={{ color: UAGRM_TOKENS.colors.text.secondary, fontWeight: 600 }}>
                    {emptyMessage}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow
                key={keyExtractor(row)}
                hover={Boolean(onRowClick)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  '&:hover': {
                    backgroundColor: UAGRM_TOKENS.colors.table.rowHover,
                  },
                  '& td': {
                    borderBottom: `1px solid ${UAGRM_TOKENS.colors.table.rowBorder}`,
                    py: 1.8,
                  },
                }}
              >
                {columns.map((col) => (
                  <TableCell key={col.id} align={col.align || 'left'}>
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
