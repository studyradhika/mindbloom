// Navigation workflow management for MindBloom
export interface NavigationState {
  currentPage: string;
  previousPage?: string;
  workflow: string[];
  canGoBack: boolean;
}

// Define the main user workflows
export const workflows = {
  onboarding: [
    '/',
    '/registration', 
    '/onboarding',
    '/dashboard'
  ],
  
  dailySession: [
    '/dashboard',
    '/focus-selection',
    '/training',
    '/session-complete'
  ],
  
  progress: [
    '/dashboard',
    '/progress'
  ],
  
  tools: [
    '/dashboard',
    '/memory-tools'
  ],
  
  tips: [
    '/dashboard',
    '/brain-tips'
  ]
};

// Get the previous page in the current workflow
export const getPreviousPage = (currentPage: string): string => {
  // Check each workflow to find current page
  for (const [workflowName, pages] of Object.entries(workflows)) {
    const currentIndex = pages.indexOf(currentPage);
    if (currentIndex > 0) {
      return pages[currentIndex - 1];
    }
  }
  
  // Default fallbacks based on page
  const fallbacks: { [key: string]: string } = {
    '/focus-selection': '/dashboard',
    '/training': '/focus-selection',
    '/session-complete': '/training',
    '/progress': '/dashboard',
    '/memory-tools': '/dashboard',
    '/brain-tips': '/dashboard',
    '/onboarding': '/registration',
    '/registration': '/',
    '/dashboard': '/',
    '/goodbye': '/',
    '/see-you-tomorrow': '/registration'
  };
  
  return fallbacks[currentPage] || '/dashboard';
};

// Check if user can navigate back
export const canNavigateBack = (currentPage: string): boolean => {
  const restrictedPages = ['/', '/goodbye', '/see-you-tomorrow'];
  return !restrictedPages.includes(currentPage);
};

// Get the appropriate back button text
export const getBackButtonText = (currentPage: string): string => {
  const backTexts: { [key: string]: string } = {
    '/focus-selection': 'Back to Dashboard',
    '/training': 'Back to Focus Selection',
    '/session-complete': 'Back to Training',
    '/progress': 'Back to Dashboard',
    '/memory-tools': 'Back to Dashboard',
    '/brain-tips': 'Back to Dashboard',
    '/onboarding': 'Back to Registration',
    '/registration': 'Back to Home',
    '/dashboard': 'Back to Home'
  };
  
  return backTexts[currentPage] || 'Back';
};