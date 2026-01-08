import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Download, 
  MessageCircle, 
  Mail, 
  Link as LinkIcon,
  Receipt,
  Plus,
  Trash2,
  RefreshCw,
  Building2,
  User,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Document, 
  DocumentType, 
  DocumentStatus, 
  LineItem,
  BusinessProfile,
  TemplateType,
  createEmptyDocument,
  defaultBusinessProfile
} from "@/types/invoice";
import { 
  getDocuments, 
  saveDocument, 
  generateDocumentNumber,
  getBusinessProfile,
  saveBusinessProfile,
  saveCustomer
} from "@/lib/storage";
import { formatCurrency, calculateDocumentTotals } from "@/lib/formatters";
import { openWhatsApp, openEmail, copyShareLink } from "@/lib/sharing";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { getTranslation, Language } from "@/lib/i18n";
import DocumentPreview from "@/components/DocumentPreview";
import TemplateSelector from "@/components/TemplateSelector";
import LogoUpload from "@/components/LogoUpload";
import LanguageSelector from "@/components/LanguageSelector";

const Editor = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(defaultBusinessProfile);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

  const t = getTranslation(document?.language || 'id');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const profile = getBusinessProfile();
    setBusinessProfile(profile);
    
    if (id) {
      const docs = getDocuments();
      const existingDoc = docs.find(d => d.id === id);
      if (existingDoc) {
        setDocument(existingDoc);
        return;
      }
    }
    
    const type = (searchParams.get('type') as DocumentType) || 'invoice';
    const newDoc = createEmptyDocument(type);
    newDoc.id = uuidv4();
    newDoc.number = generateDocumentNumber(type);
    setDocument(newDoc);
  }, [id, searchParams]);

  const updateDocument = useCallback((updates: Partial<Document>) => {
    if (!document) return;
    
    const updatedDoc = { ...document, ...updates, updatedAt: new Date().toISOString() };
    
    // Recalculate totals
    const { subtotal, total } = calculateDocumentTotals(
      updatedDoc.items,
      updatedDoc.discount,
      updatedDoc.discountType,
      updatedDoc.taxEnabled,
      updatedDoc.taxRate,
      updatedDoc.additionalFee
    );
    updatedDoc.subtotal = subtotal;
    updatedDoc.total = total;
    
    setDocument(updatedDoc);
    saveDocument(updatedDoc);
  }, [document]);

  const updateBusinessProfile = useCallback((updates: Partial<BusinessProfile>) => {
    const updated = { ...businessProfile, ...updates };
    setBusinessProfile(updated);
    saveBusinessProfile(updated);
  }, [businessProfile]);

  const addItem = () => {
    if (!document) return;
    const newItem: LineItem = {
      id: uuidv4(),
      name: '',
      description: '',
      quantity: 1,
      price: 0,
    };
    updateDocument({ items: [...document.items, newItem] });
  };

  const updateItem = (itemId: string, updates: Partial<LineItem>) => {
    if (!document) return;
    const items = document.items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    updateDocument({ items });
  };

  const removeItem = (itemId: string) => {
    if (!document) return;
    const items = document.items.filter(item => item.id !== itemId);
    if (items.length === 0) {
      items.push({ id: uuidv4(), name: '', description: '', quantity: 1, price: 0 });
    }
    updateDocument({ items });
  };

  const handleExportPDF = async () => {
    const element = window.document.getElementById('document-preview');
    if (!element) return;

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 0,
        filename: `${document?.number || 'document'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(element).save();
      
      toast({
        title: "PDF berhasil diunduh",
        description: "Dokumen Anda telah diekspor.",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Ekspor gagal",
        description: "Terjadi kesalahan saat mengekspor PDF.",
        variant: "destructive",
      });
    }
  };

  const handleShareWhatsApp = () => {
    if (!document) return;
    if (!document.customer.phone) {
      toast({
        title: "Nomor telepon diperlukan",
        description: "Tambahkan nomor telepon pelanggan untuk berbagi via WhatsApp.",
        variant: "destructive",
      });
      return;
    }
    openWhatsApp(document);
  };

  const handleShareEmail = () => {
    if (!document) return;
    openEmail(document);
  };

  const handleCopyLink = async () => {
    if (!document) return;
    const success = await copyShareLink(document);
    if (success) {
      toast({
        title: "Link disalin",
        description: "Link berbagi telah disalin ke clipboard.",
      });
    }
  };

  const handleConvertToInvoice = () => {
    if (!document || document.type !== 'quotation') return;
    
    const invoiceDoc: Document = {
      ...document,
      id: uuidv4(),
      type: 'invoice',
      number: generateDocumentNumber('invoice'),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    saveDocument(invoiceDoc);
    
    // Save customer if valid
    if (document.customer.name && document.customer.id) {
      saveCustomer(document.customer);
    }
    
    toast({
      title: "Dikonversi ke Faktur",
      description: `Faktur ${invoiceDoc.number} telah dibuat.`,
    });
    
    navigate(`/editor/${invoiceDoc.id}`);
  };

  if (!document) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Memuat...</div>
      </div>
    );
  }

  const renderForm = () => (
    <div className="space-y-6 p-6">
      {/* Language Selector */}
      <Card>
        <CardContent className="pt-6">
          <LanguageSelector
            language={document.language || 'id'}
            onLanguageChange={(lang) => updateDocument({ language: lang })}
            label={t.language}
          />
        </CardContent>
      </Card>

      {/* Document Type & Status */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            {t.documentInfo}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t.documentType}</Label>
              <Select
                value={document.type}
                onValueChange={(value: DocumentType) => {
                  updateDocument({ 
                    type: value,
                    number: generateDocumentNumber(value)
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invoice">{document.language === 'id' ? 'Faktur' : 'Invoice'}</SelectItem>
                  <SelectItem value="quotation">{document.language === 'id' ? 'Penawaran' : 'Quotation'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t.status}</Label>
              <Select
                value={document.status}
                onValueChange={(value: DocumentStatus) => updateDocument({ status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t.draft}</SelectItem>
                  <SelectItem value="sent">{t.sent}</SelectItem>
                  {document.type === 'quotation' && (
                    <SelectItem value="approved">{t.approved}</SelectItem>
                  )}
                  {document.type === 'invoice' && (
                    <>
                      <SelectItem value="pending">{t.pending}</SelectItem>
                      <SelectItem value="paid">{t.paid}</SelectItem>
                      <SelectItem value="overdue">{t.overdue}</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t.documentNumber}</Label>
              <Input
                value={document.number}
                onChange={(e) => updateDocument({ number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.issueDate}</Label>
              <Input
                type="date"
                value={document.issueDate}
                onChange={(e) => updateDocument({ issueDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{document.type === 'invoice' ? t.dueDate : t.validUntil}</Label>
            <Input
              type="date"
              value={document.dueDate}
              onChange={(e) => updateDocument({ dueDate: e.target.value })}
            />
          </div>
          {document.type === 'quotation' && (
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={handleConvertToInvoice}
            >
              <RefreshCw className="h-4 w-4" />
              {t.convertToInvoice}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Business Profile */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5" />
            {t.yourBusiness}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo Upload */}
          <LogoUpload
            logo={businessProfile.logo}
            onLogoChange={(logo) => updateBusinessProfile({ logo })}
            labels={{
              logo: t.logo,
              uploadLogo: t.uploadLogo,
              removeLogo: t.removeLogo,
            }}
          />
          
          <div className="space-y-2">
            <Label>{t.businessName}</Label>
            <Input
              placeholder={t.businessName}
              value={businessProfile.name}
              onChange={(e) => updateBusinessProfile({ name: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t.email}</Label>
              <Input
                type="email"
                placeholder="email@bisnis.com"
                value={businessProfile.email}
                onChange={(e) => updateBusinessProfile({ email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.phone}</Label>
              <Input
                placeholder="+62 812 3456 7890"
                value={businessProfile.phone}
                onChange={(e) => updateBusinessProfile({ phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t.address}</Label>
            <Textarea
              placeholder={t.address}
              value={businessProfile.address}
              onChange={(e) => updateBusinessProfile({ address: e.target.value })}
              rows={2}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{t.bankName}</Label>
              <Input
                placeholder="Bank"
                value={businessProfile.bankName || ''}
                onChange={(e) => updateBusinessProfile({ bankName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.accountNumber}</Label>
              <Input
                placeholder="1234567890"
                value={businessProfile.accountNumber || ''}
                onChange={(e) => updateBusinessProfile({ accountNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.accountName}</Label>
              <Input
                placeholder={t.accountName}
                value={businessProfile.accountName || ''}
                onChange={(e) => updateBusinessProfile({ accountName: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Info */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5" />
            {t.customer}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t.customerName}</Label>
              <Input
                placeholder={t.customerName}
                value={document.customer.name}
                onChange={(e) => updateDocument({ 
                  customer: { ...document.customer, name: e.target.value, id: document.customer.id || uuidv4() }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.company} (opsional)</Label>
              <Input
                placeholder={t.company}
                value={document.customer.company || ''}
                onChange={(e) => updateDocument({ 
                  customer: { ...document.customer, company: e.target.value }
                })}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t.email}</Label>
              <Input
                type="email"
                placeholder="pelanggan@email.com"
                value={document.customer.email}
                onChange={(e) => updateDocument({ 
                  customer: { ...document.customer, email: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.whatsappPhone}</Label>
              <Input
                placeholder="+62 812 3456 7890"
                value={document.customer.phone}
                onChange={(e) => updateDocument({ 
                  customer: { ...document.customer, phone: e.target.value }
                })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t.address}</Label>
            <Textarea
              placeholder={t.address}
              value={document.customer.address}
              onChange={(e) => updateDocument({ 
                customer: { ...document.customer, address: e.target.value }
              })}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{t.items}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {document.items.map((item, index) => (
            <div key={item.id} className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {t.item} {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="h-8 w-8 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder={`Nama ${t.item.toLowerCase()}`}
                  value={item.name}
                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                />
                <Input
                  placeholder="Deskripsi (opsional)"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">{t.qty}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t.price}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">{t.subtotal}</Label>
                    <Input
                      readOnly
                      value={formatCurrency(item.quantity * item.price)}
                      className="bg-muted"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full gap-2" onClick={addItem}>
            <Plus className="h-4 w-4" />
            {t.addItem}
          </Button>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{t.pricing}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <span>{t.subtotal}</span>
            <span className="font-medium">{formatCurrency(document.subtotal)}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t.discount}</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={document.discount}
                  onChange={(e) => updateDocument({ discount: parseFloat(e.target.value) || 0 })}
                />
                <Select
                  value={document.discountType}
                  onValueChange={(value: 'percentage' | 'fixed') => updateDocument({ discountType: value })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">%</SelectItem>
                    <SelectItem value="fixed">Rp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t.additionalFee}</Label>
              <Input
                type="number"
                min="0"
                value={document.additionalFee}
                onChange={(e) => updateDocument({ additionalFee: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t.tax} (PPN)</Label>
              <p className="text-xs text-muted-foreground">Tambah {document.taxRate}% pajak</p>
            </div>
            <Switch
              checked={document.taxEnabled}
              onCheckedChange={(checked) => updateDocument({ taxEnabled: checked })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-primary p-4 text-primary-foreground">
            <span className="font-medium">{t.total}</span>
            <span className="text-xl font-bold">{formatCurrency(document.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Notes & Terms */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{t.notesTerms}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.notesToCustomer}</Label>
            <Textarea
              placeholder={t.thankYou}
              value={document.notes}
              onChange={(e) => updateDocument({ notes: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>{t.termsConditions}</Label>
            <Textarea
              placeholder={t.paymentDue}
              value={document.terms}
              onChange={(e) => updateDocument({ terms: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Template */}
      <TemplateSelector
        selectedTemplate={document.template}
        accentColor={document.accentColor}
        onSelectTemplate={(template) => updateDocument({ template })}
        onSelectColor={(color) => updateDocument({ accentColor: color })}
        t={t}
      />
    </div>
  );

  const renderPreview = () => (
    <div className="sticky top-20 p-6">
      <DocumentPreview 
        document={document} 
        businessProfile={businessProfile}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Receipt className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <span className="font-semibold">{document.number}</span>
                <span className="ml-2 text-sm text-muted-foreground capitalize">
                  ({document.type === 'invoice' ? t.invoice.toLowerCase() : t.quotation.toLowerCase()})
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1">
              <LinkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.copyLink}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareEmail} className="gap-1">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">{t.sendEmail}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareWhatsApp} className="gap-1">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{t.sendWhatsapp}</span>
            </Button>
            <Button size="sm" onClick={handleExportPDF} className="gap-1">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t.downloadPdf}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {isMobile ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="container py-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="mt-4">
            {renderForm()}
          </TabsContent>
          <TabsContent value="preview" className="mt-4">
            {renderPreview()}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="container grid grid-cols-2 gap-6 py-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="max-h-[calc(100vh-8rem)] overflow-y-auto rounded-lg border bg-card"
          >
            {renderForm()}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="overflow-hidden rounded-lg bg-muted/50"
          >
            {renderPreview()}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Editor;
