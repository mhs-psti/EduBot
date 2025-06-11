// Helper function to extract class from book name
export const extractClassFromName = (bookName: string): string => {
  // Look for "Kelas" followed by Roman numerals or numbers (longer patterns first)
  const classMatch = bookName.match(/Kelas\s+(XII|XI|IX|VIII|VII|VI|IV|III|II|X|V|I|\d+)/i);
  if (classMatch) {
    return `Kelas ${classMatch[1]}`;
  }
  
  // Fallback: look for just Roman numerals (longer patterns first)
  const romanMatch = bookName.match(/\b(XII|XI|IX|VIII|VII|VI|IV|III|II|X|V|I)\b/);
  if (romanMatch) {
    return `Kelas ${romanMatch[1]}`;
  }
  
  return 'Unknown Class';
};

// Helper function to get just the Roman numeral part
export const extractClassLevel = (bookName: string): string => {
  const classMatch = bookName.match(/Kelas\s+(XII|XI|IX|VIII|VII|VI|IV|III|II|X|V|I|\d+)/i);
  if (classMatch) {
    return classMatch[1];
  }
  
  const romanMatch = bookName.match(/\b(XII|XI|IX|VIII|VII|VI|IV|III|II|X|V|I)\b/);
  if (romanMatch) {
    return romanMatch[1];
  }
  
  return 'Unknown';
};

// Helper function to get unique class levels from books array
export const getUniqueClassLevels = (books: any[]): string[] => {
  const levels = books.map(book => extractClassLevel(book.name));
  const uniqueLevels = ['All', ...Array.from(new Set(levels)).filter(level => level !== 'Unknown')];
  
  // Sort levels in a logical order
  return uniqueLevels.sort((a, b) => {
    if (a === 'All') return -1;
    if (b === 'All') return 1;
    
    const romanOrder = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
    const aIndex = romanOrder.indexOf(a);
    const bIndex = romanOrder.indexOf(b);
    
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    return a.localeCompare(b);
  });
}; 