import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Document, BusinessProfile, defaultBusinessProfile } from "@/types/invoice";
import { parseShareLink } from "@/lib/sharing";
import DocumentPreview from "@/components/DocumentPreview";

const ViewDocument = () => {
  const [searchParams] = useSearchParams();
  const [document, setDocument] = useState<Document | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      const parsed = parseShareLink(data);
      if (parsed) {
        setDocument(parsed);
      } else {
        setError(true);
      }
    } else {
      setError(true);
    }
  }, [searchParams]);

  const handlePrint = () => {
    window.print();
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
    } catch (error) {
      console.error('PDF export error:', error);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <FileText className="mb-4 h-16 w-16 text-muted-foreground/50" />
        <h1 className="mb-2 text-2xl font-bold">Document Not Found</h1>
        <p className="text-muted-foreground">
          The document you're looking for doesn't exist or the link is invalid.
        </p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading document...</div>
      </div>
    );
  }

  // Create a mock business profile from document context
  const businessProfile: BusinessProfile = defaultBusinessProfile;

  return (
    <div className="min-h-screen bg-muted/30 print:bg-white">
      {/* Header - hidden on print */}
      <header className="border-b bg-card py-4 print:hidden">
        <div className="container flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{document.number}</h1>
            <p className="text-sm text-muted-foreground capitalize">
              {document.type}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleExportPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Document Preview */}
      <div className="container py-8 print:py-0">
        <div className="mx-auto max-w-4xl">
          <DocumentPreview 
            document={document}
            businessProfile={businessProfile}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewDocument;
