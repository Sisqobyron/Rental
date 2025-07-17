// Currency formatting utilities for CFA (Central African CFA francs)

export const formatCFA = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'CFA 0';
  }
  
  return new Intl.NumberFormat('fr-CF', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatCFACompact = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'CFA 0';
  }
  
  return new Intl.NumberFormat('fr-CF', {
    style: 'currency',
    currency: 'XAF',
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(amount);
};

export const parseCFA = (cfaString) => {
  if (!cfaString || typeof cfaString !== 'string') {
    return 0;
  }
  
  // Remove currency symbols, spaces, and extract numeric value
  const numericString = cfaString.replace(/[^\d,.-]/g, '').replace(',', '.');
  const parsed = parseFloat(numericString);
  
  return isNaN(parsed) ? 0 : parsed;
};

export default {
  formatCFA,
  formatCFACompact,
  parseCFA
};
