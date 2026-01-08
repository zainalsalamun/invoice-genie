export type Language = 'id' | 'en';

export interface Translations {
  // Document types
  invoice: string;
  quotation: string;
  
  // Labels
  billTo: string;
  issueDate: string;
  dueDate: string;
  validUntil: string;
  item: string;
  qty: string;
  price: string;
  subtotal: string;
  discount: string;
  tax: string;
  additionalFee: string;
  total: string;
  paymentDetails: string;
  bank: string;
  account: string;
  accountName: string;
  notes: string;
  termsConditions: string;
  
  // Buttons & Actions
  downloadPdf: string;
  sendWhatsapp: string;
  sendEmail: string;
  copyLink: string;
  convertToInvoice: string;
  addItem: string;
  
  // Form labels
  documentInfo: string;
  documentType: string;
  status: string;
  documentNumber: string;
  yourBusiness: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  bankName: string;
  accountNumber: string;
  customer: string;
  customerName: string;
  company: string;
  whatsappPhone: string;
  items: string;
  pricing: string;
  notesTerms: string;
  notesToCustomer: string;
  templateStyle: string;
  accentColor: string;
  logo: string;
  uploadLogo: string;
  removeLogo: string;
  language: string;
  
  // Status options
  draft: string;
  sent: string;
  approved: string;
  pending: string;
  paid: string;
  overdue: string;
  
  // Sharing messages
  whatsappGreeting: string;
  whatsappDocType: string;
  whatsappLink: string;
  whatsappThanks: string;
  emailSubject: string;
  emailBody: string;
  
  // Template names
  minimal: string;
  modern: string;
  creative: string;
  corporate: string;
  elegant: string;
  bold: string;
  
  // Misc
  thankYou: string;
  paymentDue: string;
}

export const translations: Record<Language, Translations> = {
  id: {
    // Document types
    invoice: 'FAKTUR',
    quotation: 'PENAWARAN',
    
    // Labels
    billTo: 'Tagihan Kepada',
    issueDate: 'Tanggal Terbit',
    dueDate: 'Jatuh Tempo',
    validUntil: 'Berlaku Sampai',
    item: 'Item',
    qty: 'Jml',
    price: 'Harga',
    subtotal: 'Subtotal',
    discount: 'Diskon',
    tax: 'Pajak',
    additionalFee: 'Biaya Tambahan',
    total: 'Total',
    paymentDetails: 'Informasi Pembayaran',
    bank: 'Bank',
    account: 'No. Rekening',
    accountName: 'Atas Nama',
    notes: 'Catatan',
    termsConditions: 'Syarat & Ketentuan',
    
    // Buttons & Actions
    downloadPdf: 'Unduh PDF',
    sendWhatsapp: 'WhatsApp',
    sendEmail: 'Email',
    copyLink: 'Salin Link',
    convertToInvoice: 'Konversi ke Faktur',
    addItem: 'Tambah Item',
    
    // Form labels
    documentInfo: 'Info Dokumen',
    documentType: 'Jenis Dokumen',
    status: 'Status',
    documentNumber: 'Nomor Dokumen',
    yourBusiness: 'Bisnis Anda',
    businessName: 'Nama Bisnis',
    email: 'Email',
    phone: 'Telepon',
    address: 'Alamat',
    bankName: 'Nama Bank',
    accountNumber: 'Nomor Rekening',
    customer: 'Pelanggan',
    customerName: 'Nama Pelanggan',
    company: 'Perusahaan',
    whatsappPhone: 'WhatsApp / Telepon',
    items: 'Daftar Item',
    pricing: 'Harga',
    notesTerms: 'Catatan & Ketentuan',
    notesToCustomer: 'Catatan untuk Pelanggan',
    templateStyle: 'Template & Gaya',
    accentColor: 'Warna Aksen',
    logo: 'Logo',
    uploadLogo: 'Unggah Logo',
    removeLogo: 'Hapus Logo',
    language: 'Bahasa',
    
    // Status options
    draft: 'Draf',
    sent: 'Terkirim',
    approved: 'Disetujui',
    pending: 'Menunggu',
    paid: 'Lunas',
    overdue: 'Terlambat',
    
    // Sharing messages
    whatsappGreeting: 'Halo',
    whatsappDocType: 'Berikut',
    whatsappLink: 'Link untuk melihat & download:',
    whatsappThanks: 'Terima kasih 🙏',
    emailSubject: 'Faktur',
    emailBody: 'Silakan lihat dokumen terlampir.',
    
    // Template names
    minimal: 'Minimal',
    modern: 'Modern',
    creative: 'Kreatif',
    corporate: 'Korporat',
    elegant: 'Elegan',
    bold: 'Bold',
    
    // Misc
    thankYou: 'Terima kasih atas kepercayaan Anda!',
    paymentDue: 'Pembayaran jatuh tempo dalam 30 hari.',
  },
  en: {
    // Document types
    invoice: 'INVOICE',
    quotation: 'QUOTATION',
    
    // Labels
    billTo: 'Bill To',
    issueDate: 'Issue Date',
    dueDate: 'Due Date',
    validUntil: 'Valid Until',
    item: 'Item',
    qty: 'Qty',
    price: 'Price',
    subtotal: 'Subtotal',
    discount: 'Discount',
    tax: 'Tax',
    additionalFee: 'Additional Fee',
    total: 'Total',
    paymentDetails: 'Payment Details',
    bank: 'Bank',
    account: 'Account',
    accountName: 'Account Name',
    notes: 'Notes',
    termsConditions: 'Terms & Conditions',
    
    // Buttons & Actions
    downloadPdf: 'Download PDF',
    sendWhatsapp: 'WhatsApp',
    sendEmail: 'Email',
    copyLink: 'Copy Link',
    convertToInvoice: 'Convert to Invoice',
    addItem: 'Add Item',
    
    // Form labels
    documentInfo: 'Document Info',
    documentType: 'Document Type',
    status: 'Status',
    documentNumber: 'Document Number',
    yourBusiness: 'Your Business',
    businessName: 'Business Name',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    bankName: 'Bank Name',
    accountNumber: 'Account Number',
    customer: 'Customer',
    customerName: 'Customer Name',
    company: 'Company',
    whatsappPhone: 'WhatsApp / Phone',
    items: 'Items',
    pricing: 'Pricing',
    notesTerms: 'Notes & Terms',
    notesToCustomer: 'Notes to Customer',
    templateStyle: 'Template & Style',
    accentColor: 'Accent Color',
    logo: 'Logo',
    uploadLogo: 'Upload Logo',
    removeLogo: 'Remove Logo',
    language: 'Language',
    
    // Status options
    draft: 'Draft',
    sent: 'Sent',
    approved: 'Approved',
    pending: 'Pending',
    paid: 'Paid',
    overdue: 'Overdue',
    
    // Sharing messages
    whatsappGreeting: 'Hello',
    whatsappDocType: 'Here is your',
    whatsappLink: 'View and download here:',
    whatsappThanks: 'Thank you 🙏',
    emailSubject: 'Invoice',
    emailBody: 'Please find the attached document.',
    
    // Template names
    minimal: 'Minimal',
    modern: 'Modern',
    creative: 'Creative',
    corporate: 'Corporate',
    elegant: 'Elegant',
    bold: 'Bold',
    
    // Misc
    thankYou: 'Thank you for your business!',
    paymentDue: 'Payment is due within 30 days.',
  },
};

export const getTranslation = (lang: Language): Translations => {
  return translations[lang];
};

// Store and retrieve language preference
const LANGUAGE_KEY = 'invoice-app-language';

export const getLanguage = (): Language => {
  const stored = localStorage.getItem(LANGUAGE_KEY);
  if (stored === 'en' || stored === 'id') {
    return stored;
  }
  return 'id'; // Default to Indonesian
};

export const setLanguage = (lang: Language): void => {
  localStorage.setItem(LANGUAGE_KEY, lang);
};
