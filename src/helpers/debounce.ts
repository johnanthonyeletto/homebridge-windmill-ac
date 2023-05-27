// Helper function to debounce a function

export const debounce = <T extends CallableFunction>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout | null;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      return func(...args);
    };

    if(timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
};