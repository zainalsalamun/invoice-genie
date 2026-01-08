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
import DocumentPreview from "@/components/DocumentPreview";
import TemplateSelector from "@/components/TemplateSelector";

const Editor = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [document, setDocument] = useState<Document | null>(null);
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(defaultBusinessProfile);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

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
        title: "PDF downloaded",
        description: "Your document has been exported.",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the PDF.",
        variant: "destructive",
      });
    }
  };

  const handleShareWhatsApp = () => {
    if (!document) return;
    if (!document.customer.phone) {
      toast({
        title: "Phone number required",
        description: "Please add a customer phone number to share via WhatsApp.",
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
        title: "Link copied",
        description: "Share link has been copied to clipboard.",
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
      title: "Converted to Invoice",
      description: `Invoice ${invoiceDoc.number} has been created.`,
    });
    
    navigate(`/editor/${invoiceDoc.id}`);
  };

  if (!document) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const renderForm = () => (
    <div className="space-y-6 p-6">
      {/* Document Type & Status */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Document Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Document Type</Label>
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
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="quotation">Quotation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={document.status}
                onValueChange={(value: DocumentStatus) => updateDocument({ status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  {document.type === 'quotation' && (
                    <SelectItem value="approved">Approved</SelectItem>
                  )}
                  {document.type === 'invoice' && (
                    <>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Document Number</Label>
              <Input
                value={document.number}
                onChange={(e) => updateDocument({ number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Input
                type="date"
                value={document.issueDate}
                onChange={(e) => updateDocument({ issueDate: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{document.type === 'invoice' ? 'Due Date' : 'Valid Until'}</Label>
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
              Convert to Invoice
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Business Profile */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5" />
            Your Business
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input
              placeholder="Your Business Name"
              value={businessProfile.name}
              onChange={(e) => updateBusinessProfile({ name: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="email@business.com"
                value={businessProfile.email}
                onChange={(e) => updateBusinessProfile({ email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                placeholder="+62 812 3456 7890"
                value={businessProfile.phone}
                onChange={(e) => updateBusinessProfile({ phone: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea
              placeholder="Business address"
              value={businessProfile.address}
              onChange={(e) => updateBusinessProfile({ address: e.target.value })}
              rows={2}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input
                placeholder="Bank"
                value={businessProfile.bankName || ''}
                onChange={(e) => updateBusinessProfile({ bankName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                placeholder="1234567890"
                value={businessProfile.accountNumber || ''}
                onChange={(e) => updateBusinessProfile({ accountNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input
                placeholder="Account holder name"
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
            Customer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                placeholder="Customer name"
                value={document.customer.name}
                onChange={(e) => updateDocument({ 
                  customer: { ...document.customer, name: e.target.value, id: document.customer.id || uuidv4() }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Company (optional)</Label>
              <Input
                placeholder="Company name"
                value={document.customer.company || ''}
                onChange={(e) => updateDocument({ 
                  customer: { ...document.customer, company: e.target.value }
                })}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="customer@email.com"
                value={document.customer.email}
                onChange={(e) => updateDocument({ 
                  customer: { ...document.customer, email: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp / Phone</Label>
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
            <Label>Address</Label>
            <Textarea
              placeholder="Customer address"
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
          <CardTitle className="text-lg">Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {document.items.map((item, index) => (
            <div key={item.id} className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Item {index + 1}
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
                  placeholder="Item name"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, { name: e.target.value })}
                />
                <Input
                  placeholder="Description (optional)"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Qty</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Price</Label>
                    <Input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) => updateItem(item.id, { price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Subtotal</Label>
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
            Add Item
          </Button>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Pricing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted p-3">
            <span>Subtotal</span>
            <span className="font-medium">{formatCurrency(document.subtotal)}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Discount</Label>
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
              <Label>Additional Fee</Label>
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
              <Label>Tax (PPN)</Label>
              <p className="text-xs text-muted-foreground">Add {document.taxRate}% tax</p>
            </div>
            <Switch
              checked={document.taxEnabled}
              onCheckedChange={(checked) => updateDocument({ taxEnabled: checked })}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg bg-primary p-4 text-primary-foreground">
            <span className="font-medium">Total</span>
            <span className="text-xl font-bold">{formatCurrency(document.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Notes & Terms */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Notes & Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Notes to Customer</Label>
            <Textarea
              placeholder="Thank you for your business!"
              value={document.notes}
              onChange={(e) => updateDocument({ notes: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Terms & Conditions</Label>
            <Textarea
              placeholder="Payment is due within 30 days..."
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
                  ({document.type})
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1">
              <LinkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Copy Link</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareEmail} className="gap-1">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareWhatsApp} className="gap-1">
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </Button>
            <Button size="sm" onClick={handleExportPDF} className="gap-1">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
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
