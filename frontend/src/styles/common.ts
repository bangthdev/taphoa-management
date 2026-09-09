/**
 * Common styles - Các style dùng chung trong ứng dụng
 * Sử dụng để giảm duplication và đảm bảo consistency
 */

import type { CSSProperties } from 'react';

import { colors } from '../theme/colors';

// Flex layouts
export const flexCenter: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

export const flexBetween: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const flexStart: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
};

export const flexEnd: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
};

export const flexColumn: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
};

export const flexWrap: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
};

// Page layouts
export const pageContainer: CSSProperties = {
  padding: 24,
};

export const pageHeaderStyle: CSSProperties = {
  marginBottom: 16,
  ...flexBetween,
};

export const pageTitleStyle: CSSProperties = {
  margin: 0,
};

export const contentCard: CSSProperties = {
  background: colors.surface,
  borderRadius: 8,
  padding: 24,
};

// Table styles
export const tableActionStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
};

// Modal styles
export const modalFormGrid2: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 16,
};

export const modalFormGrid3: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr 1fr',
  gap: 16,
};

// POS specific styles
export const posContainer: CSSProperties = {
  minHeight: '100vh',
  background: colors.bg,
};

export const posHeader: CSSProperties = {
  background: colors.brandInk,
  padding: '0 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 48,
  lineHeight: '48px',
};

export const posTabBar: CSSProperties = {
  background: colors.surface,
  padding: '8px 16px',
  borderBottom: `1px solid ${colors.border}`,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  overflowX: 'auto',
};

export const posProductCard: CSSProperties = {
  cursor: 'pointer',
  minHeight: 100,
};

export const posCartItem: CSSProperties = {
  padding: '10px 0',
};

export const posCartActions: CSSProperties = {
  padding: '0 16px',
  textAlign: 'right',
};

export const posTouchButton: CSSProperties = {
  minWidth: 44,
  height: 44,
};

export const posLargeButton: CSSProperties = {
  height: 48,
  fontSize: 16,
  fontWeight: 600,
};

// Touch targets (for tablet/mobile optimization)
export const touchTargetMin: CSSProperties = {
  minWidth: 44,
  minHeight: 44,
};

export const touchTargetLarge: CSSProperties = {
  minWidth: 48,
  minHeight: 48,
};

// Empty states
export const emptyStateContainer: CSSProperties = {
  ...flexColumn,
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px 24px',
  textAlign: 'center',
};

export const emptyStateIcon: CSSProperties = {
  fontSize: 64,
  color: colors.borderStrong,
  marginBottom: 16,
};

// Loading states
export const loadingContainer: CSSProperties = {
  ...flexCenter,
  height: 200,
};

export const skeletonContainer: CSSProperties = {
  padding: 24,
};

// Search input
export const searchInputStyle: CSSProperties = {
  width: 280,
};

// Utility styles
export const fullWidth: CSSProperties = {
  width: '100%',
};

export const fullHeight: CSSProperties = {
  height: '100%',
};

export const textCenter: CSSProperties = {
  textAlign: 'center',
};

export const textRight: CSSProperties = {
  textAlign: 'right',
};

export const textEllipsis: CSSProperties = {
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

export const marginBottom16: CSSProperties = {
  marginBottom: 16,
};

export const marginBottom24: CSSProperties = {
  marginBottom: 24,
};

export const padding16: CSSProperties = {
  padding: 16,
};

export const padding24: CSSProperties = {
  padding: 24,
};

// Breadcrumb styles
export const breadcrumbContainer: CSSProperties = {
  marginBottom: 16,
  padding: '8px 0',
};

// Responsive helpers
export const responsiveGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: 16,
};

// Print styles - sử dụng className và CSS thuần cho media queries

// Scrollable containers
export const scrollYAuto: CSSProperties = {
  overflowY: 'auto',
};

export const scrollXAuto: CSSProperties = {
  overflowX: 'auto',
};

// Card hover effects
export const cardHover: CSSProperties = {
  transition: 'all 0.3s ease',
  cursor: 'pointer',
};

export const statusColors = {
  success: colors.success,
  warning: colors.warning,
  error: colors.danger,
  info: colors.info,
  default: colors.borderStrong,
} as const;

// Z-index layers
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;
