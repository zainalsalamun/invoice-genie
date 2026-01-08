export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const formatDateShort = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

export const calculateDocumentTotals = (
  items: { quantity: number; price: number }[],
  discount: number,
  discountType: 'percentage' | 'fixed',
  taxEnabled: boolean,
  taxRate: number,
  additionalFee: number
) => {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  
  const discountAmount = discountType === 'percentage' 
    ? subtotal * (discount / 100) 
    : discount;
  
  const afterDiscount = subtotal - discountAmount;
  
  const taxAmount = taxEnabled ? afterDiscount * (taxRate / 100) : 0;
  
  const total = afterDiscount + taxAmount + additionalFee;
  
  return {
    subtotal,
    discountAmount,
    taxAmount,
    total,
  };
};
