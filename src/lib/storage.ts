import { AppState, BusinessProfile, CustomerInfo, Document, defaultBusinessProfile } from '@/types/invoice';

const STORAGE_KEY = 'invoice-app-data';

export const getStorageData = (): AppState => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error);
  }
  return {
    businessProfile: defaultBusinessProfile,
    customers: [],
    documents: [],
  };
};

export const saveStorageData = (data: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getBusinessProfile = (): BusinessProfile => {
  const data = getStorageData();
  return data.businessProfile;
};

export const saveBusinessProfile = (profile: BusinessProfile): void => {
  const data = getStorageData();
  data.businessProfile = profile;
  saveStorageData(data);
};

export const getCustomers = (): CustomerInfo[] => {
  const data = getStorageData();
  return data.customers;
};

export const saveCustomer = (customer: CustomerInfo): void => {
  const data = getStorageData();
  const existingIndex = data.customers.findIndex(c => c.id === customer.id);
  if (existingIndex >= 0) {
    data.customers[existingIndex] = customer;
  } else {
    data.customers.push(customer);
  }
  saveStorageData(data);
};

export const getDocuments = (): Document[] => {
  const data = getStorageData();
  return data.documents;
};

export const saveDocument = (doc: Document): void => {
  const data = getStorageData();
  const existingIndex = data.documents.findIndex(d => d.id === doc.id);
  if (existingIndex >= 0) {
    data.documents[existingIndex] = doc;
  } else {
    data.documents.push(doc);
  }
  saveStorageData(data);
};

export const deleteDocument = (docId: string): void => {
  const data = getStorageData();
  data.documents = data.documents.filter(d => d.id !== docId);
  saveStorageData(data);
};

export const generateDocumentNumber = (type: 'invoice' | 'quotation'): string => {
  const data = getStorageData();
  const prefix = type === 'invoice' ? 'INV' : 'QUO';
  const docs = data.documents.filter(d => d.type === type);
  const nextNumber = docs.length + 1;
  const year = new Date().getFullYear();
  return `${prefix}-${year}-${String(nextNumber).padStart(4, '0')}`;
};

export const exportData = (): string => {
  const data = getStorageData();
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string): boolean => {
  try {
    const data = JSON.parse(jsonString) as AppState;
    saveStorageData(data);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

export const resetAllData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
