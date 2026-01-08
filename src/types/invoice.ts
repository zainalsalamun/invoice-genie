import { Language } from '@/lib/i18n';

export type DocumentType = 'invoice' | 'quotation';

export type DocumentStatus = 'draft' | 'sent' | 'approved' | 'paid' | 'pending' | 'overdue';

export type TemplateType = 'minimal' | 'modern' | 'creative' | 'corporate' | 'elegant' | 'bold';

export interface LineItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
}

export interface CustomerInfo {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  address: string;
}

export interface BusinessProfile {
  name: string;
  logo?: string;
  email: string;
  phone: string;
  address: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}

export interface Document {
  id: string;
  type: DocumentType;
  number: string;
  status: DocumentStatus;
  customer: CustomerInfo;
  items: LineItem[];
  issueDate: string;
  dueDate: string;
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  taxEnabled: boolean;
  taxRate: number;
  additionalFee: number;
  total: number;
  notes: string;
  terms: string;
  template: TemplateType;
  accentColor: string;
  language: Language;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  businessProfile: BusinessProfile;
  customers: CustomerInfo[];
  documents: Document[];
}

export const defaultBusinessProfile: BusinessProfile = {
  name: '',
  email: '',
  phone: '',
  address: '',
  bankName: '',
  accountNumber: '',
  accountName: '',
};

export const defaultCustomer: CustomerInfo = {
  id: '',
  name: '',
  company: '',
  email: '',
  phone: '',
  address: '',
};

export const createEmptyDocument = (type: DocumentType): Document => ({
  id: '',
  type,
  number: '',
  status: 'draft',
  customer: { ...defaultCustomer },
  items: [
    { id: crypto.randomUUID(), name: '', description: '', quantity: 1, price: 0 },
  ],
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  subtotal: 0,
  discount: 0,
  discountType: 'percentage',
  taxEnabled: false,
  taxRate: 11,
  additionalFee: 0,
  total: 0,
  notes: '',
  terms: 'Pembayaran jatuh tempo dalam 30 hari.',
  template: 'modern',
  accentColor: '#10b981',
  language: 'id',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
