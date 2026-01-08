import { Document } from '@/types/invoice';
import { formatCurrency } from './formatters';

export const generateShareLink = (doc: Document): string => {
  const encoded = btoa(JSON.stringify(doc));
  const baseUrl = window.location.origin;
  return `${baseUrl}/view?data=${encodeURIComponent(encoded)}`;
};

export const parseShareLink = (encodedData: string): Document | null => {
  try {
    const decoded = atob(decodeURIComponent(encodedData));
    return JSON.parse(decoded) as Document;
  } catch (error) {
    console.error('Error parsing share link:', error);
    return null;
  }
};

export const generateWhatsAppMessage = (doc: Document): string => {
  const docType = doc.type === 'invoice' ? 'Invoice' : 'Quotation';
  const shareLink = generateShareLink(doc);
  
  return encodeURIComponent(
`Halo ${doc.customer.name},

Berikut ${docType.toLowerCase()} dari kami:
No: ${doc.number}
Total: ${formatCurrency(doc.total)}

Link untuk melihat & download:
${shareLink}

Terima kasih 🙏`
  );
};

export const openWhatsApp = (doc: Document): void => {
  const phone = doc.customer.phone.replace(/[^0-9]/g, '');
  const message = generateWhatsAppMessage(doc);
  const url = `https://wa.me/${phone}?text=${message}`;
  window.open(url, '_blank');
};

export const openEmail = (doc: Document): void => {
  const docType = doc.type === 'invoice' ? 'Invoice' : 'Quotation';
  const shareLink = generateShareLink(doc);
  
  const subject = encodeURIComponent(`${docType} ${doc.number}`);
  const body = encodeURIComponent(
`Dear ${doc.customer.name},

Please find attached your ${docType.toLowerCase()}.

Document Number: ${doc.number}
Total Amount: ${formatCurrency(doc.total)}

You can view and download the document here:
${shareLink}

Thank you for your business.

Best regards`
  );
  
  window.location.href = `mailto:${doc.customer.email}?subject=${subject}&body=${body}`;
};

export const copyShareLink = async (doc: Document): Promise<boolean> => {
  const shareLink = generateShareLink(doc);
  try {
    await navigator.clipboard.writeText(shareLink);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};
