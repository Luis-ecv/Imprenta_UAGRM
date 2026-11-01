import React from 'react';
import Box from '@mui/material/Box';
import { UAGRM_TOKENS } from '@/theme/tokens';

export interface TabItem {
  key: string;
  label: string;
  count?: number;
}

export interface FilterTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

/**
 * Pestañas de Filtrado Institucionales UAGRM.
 * Replica el diseño oficial: pestañas horizontales con subrayado activo (#000000),
 * conteo contiguo y línea divisoria inferior.
 */
export const FilterTabs: React.FC<FilterTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: { xs: 2.5, sm: 4 },
        borderBottom: `1px solid ${UAGRM_TOKENS.border.subtle}`,
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        msOverflowStyle: 'none',
        pb: 0,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <Box
            key={tab.key}
            component="button"
            type="button"
            onClick={() => onTabChange(tab.key)}
            sx={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              pb: 1.2,
              px: 0.5,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
              fontFamily: 'inherit',
              fontSize: '0.925rem',
              fontWeight: isActive ? 800 : 500,
              color: isActive ? UAGRM_TOKENS.colors.charcoal : UAGRM_TOKENS.colors.slate,
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              '&:hover': {
                color: UAGRM_TOKENS.colors.charcoal,
                fontWeight: 800,
              },
              '&:hover span': {
                fontWeight: 800,
              },
              '&::after': isActive
                ? {
                    content: '""',
                    position: 'absolute',
                    bottom: -1,
                    left: 0,
                    right: 0,
                    height: 2.5,
                    backgroundColor: UAGRM_TOKENS.colors.charcoal,
                    borderRadius: '2px 2px 0 0',
                  }
                : undefined,
            }}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 800 : 500 }}>
                {tab.count}
              </span>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default FilterTabs;
