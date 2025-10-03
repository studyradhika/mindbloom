// Modern, consistent color scheme for MindBloom
export const theme = {
  colors: {
    // Primary brand colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main primary
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    
    // Success colors
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981', // Main success
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b'
    },
    
    // Warning colors
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Main warning
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    
    // Error colors
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Main error
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    
    // Accent colors
    accent: {
      purple: '#8b5cf6',
      teal: '#14b8a6',
      indigo: '#6366f1',
      pink: '#ec4899',
      cyan: '#06b6d4'
    },
    
    // Cognitive area colors
    cognitive: {
      memory: '#10b981',      // Success green
      attention: '#3b82f6',   // Primary blue
      language: '#f59e0b',    // Warning amber
      executive: '#8b5cf6',   // Purple
      creativity: '#ec4899',  // Pink
      processing: '#06b6d4',  // Cyan
      spatial: '#84cc16',     // Lime
      general: '#6b7280'      // Gray
    }
  },
  
  gradients: {
    primary: 'from-blue-50 to-indigo-100',
    success: 'from-emerald-50 to-green-100',
    warning: 'from-amber-50 to-orange-100',
    error: 'from-red-50 to-pink-100',
    accent: 'from-purple-50 to-indigo-100'
  }
};

// Utility functions for consistent styling
export const getAreaColor = (areaId: string) => {
  return theme.colors.cognitive[areaId as keyof typeof theme.colors.cognitive] || theme.colors.cognitive.general;
};

export const getStatusColor = (status: 'improved' | 'regressed' | 'same') => {
  switch (status) {
    case 'improved': return theme.colors.success[500];
    case 'regressed': return theme.colors.error[500];
    case 'same': return '#6b7280';
    default: return '#6b7280';
  }
};