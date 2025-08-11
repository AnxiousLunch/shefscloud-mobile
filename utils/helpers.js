export const formatDateForInput = (dateString) => {
  if (!dateString) {
    return '';
  }
  
  try {
    // Handles both 'YYYY-MM-DD' and full ISO strings 'YYYY-MM-DDTHH:mm:ss.sssZ'
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Invalid date format:', dateString);
    return '';
  }
};