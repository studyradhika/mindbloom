/**
 * Utility function to clear all MindBloom-related data from localStorage
 * This is useful for testing with fresh user data
 */

export const clearAllMindBloomData = (): void => {
  // Get all localStorage keys
  const keys = Object.keys(localStorage);
  
  // Filter keys that start with 'mindbloom-'
  const mindbloomKeys = keys.filter(key => key.startsWith('mindbloom-'));
  
  console.log('🧹 Clearing MindBloom localStorage data...');
  console.log('📋 Found keys:', mindbloomKeys);
  
  // Remove all MindBloom-related keys
  mindbloomKeys.forEach(key => {
    localStorage.removeItem(key);
    console.log(`🗑️ Removed: ${key}`);
  });
  
  console.log(`✅ Cleared ${mindbloomKeys.length} localStorage items`);
  console.log('💡 You can now test with fresh user data');
};

// Function to clear specific types of data
export const clearSpecificData = (dataTypes: string[]): void => {
  const keys = Object.keys(localStorage);
  let clearedCount = 0;
  
  dataTypes.forEach(dataType => {
    const keysToRemove = keys.filter(key => key.includes(dataType));
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      clearedCount++;
      console.log(`🗑️ Removed: ${key}`);
    });
  });
  
  console.log(`✅ Cleared ${clearedCount} items for data types: ${dataTypes.join(', ')}`);
};

// Export for console usage
if (typeof window !== 'undefined') {
  (window as any).clearMindBloomData = clearAllMindBloomData;
  (window as any).clearSpecificData = clearSpecificData;
}