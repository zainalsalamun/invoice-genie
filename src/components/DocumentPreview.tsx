import { Document, BusinessProfile, TemplateType } from "@/types/invoice";
import { formatCurrency, formatDate } from "@/lib/formatters";

interface DocumentPreviewProps {
  document: Document;
  businessProfile: BusinessProfile;
}

const DocumentPreview = ({ document, businessProfile }: DocumentPreviewProps) => {
  const { template, accentColor } = document;

  const getTemplateStyles = (template: TemplateType) => {
    switch (template) {
      case 'minimal':
        return {
          container: "font-sans",
          header: "border-b-2 pb-6 mb-8",
          title: "text-3xl font-light tracking-tight",
          accent: "border-gray-900",
          table: "border-collapse",
          tableHeader: "border-b text-left text-sm font-medium text-gray-500 uppercase tracking-wider",
          total: "border-t-2 border-gray-900",
        };
      case 'modern':
        return {
          container: "font-sans",
          header: "mb-8",
          title: "text-3xl font-bold",
          accent: `border-[${accentColor}]`,
          table: "border-collapse",
          tableHeader: "text-left text-sm font-semibold uppercase tracking-wide",
          total: "rounded-lg",
        };
      case 'creative':
        return {
          container: "font-sans",
          header: "mb-8 relative",
          title: "text-4xl font-black tracking-tight",
          accent: `bg-[${accentColor}]`,
          table: "border-collapse",
          tableHeader: "text-left text-xs font-bold uppercase tracking-widest",
          total: "rounded-2xl",
        };
      case 'corporate':
        return {
          container: "font-serif",
          header: "border-b border-gray-200 pb-6 mb-8",
          title: "text-2xl font-semibold",
          accent: "border-gray-800",
          table: "border-collapse",
          tableHeader: "border-b border-gray-200 text-left text-sm font-medium",
          total: "border-t border-gray-300",
        };
      default:
        return {
          container: "font-sans",
          header: "mb-8",
          title: "text-3xl font-bold",
          accent: "",
          table: "border-collapse",
          tableHeader: "text-left text-sm font-semibold",
          total: "",
        };
    }
  };

  const styles = getTemplateStyles(template);
  const discountAmount = document.discountType === 'percentage' 
    ? document.subtotal * (document.discount / 100)
    : document.discount;
  const taxAmount = document.taxEnabled 
    ? (document.subtotal - discountAmount) * (document.taxRate / 100)
    : 0;

  return (
    <div 
      id="document-preview"
      className={`paper-a4-preview overflow-hidden rounded-lg p-8 ${styles.container}`}
      style={{ 
        backgroundColor: 'white',
        color: '#1a1a1a',
        minHeight: '600px',
      }}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className="flex items-start justify-between">
          <div>
            {template === 'creative' && (
              <div 
                className="mb-2 h-2 w-20 rounded-full"
                style={{ backgroundColor: accentColor }}
              />
            )}
            <h1 
              className={styles.title}
              style={template !== 'minimal' && template !== 'corporate' ? { color: accentColor } : {}}
            >
              {document.type === 'invoice' ? 'INVOICE' : 'QUOTATION'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">#{document.number}</p>
          </div>
          <div className="text-right">
            {businessProfile.name && (
              <h2 className="text-lg font-semibold">{businessProfile.name}</h2>
            )}
            {businessProfile.email && (
              <p className="text-sm text-gray-600">{businessProfile.email}</p>
            )}
            {businessProfile.phone && (
              <p className="text-sm text-gray-600">{businessProfile.phone}</p>
            )}
            {businessProfile.address && (
              <p className="mt-1 text-xs text-gray-500 whitespace-pre-line">{businessProfile.address}</p>
            )}
          </div>
        </div>
      </div>

      {/* Customer & Dates */}
      <div className="mb-8 grid grid-cols-2 gap-8">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
            Bill To
          </p>
          {document.customer.name && (
            <p className="font-semibold">{document.customer.name}</p>
          )}
          {document.customer.company && (
            <p className="text-sm text-gray-600">{document.customer.company}</p>
          )}
          {document.customer.email && (
            <p className="text-sm text-gray-600">{document.customer.email}</p>
          )}
          {document.customer.address && (
            <p className="mt-1 text-xs text-gray-500 whitespace-pre-line">{document.customer.address}</p>
          )}
        </div>
        <div className="text-right">
          <div className="mb-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Issue Date</p>
            <p className="font-medium">{formatDate(document.issueDate)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {document.type === 'invoice' ? 'Due Date' : 'Valid Until'}
            </p>
            <p className="font-medium">{formatDate(document.dueDate)}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className={`w-full ${styles.table}`}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className="pb-3 pr-4">Item</th>
              <th className="pb-3 pr-4 text-center w-20">Qty</th>
              <th className="pb-3 pr-4 text-right w-28">Price</th>
              <th className="pb-3 text-right w-28">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {document.items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100">
                <td className="py-3 pr-4">
                  <p className="font-medium">{item.name || '—'}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500">{item.description}</p>
                  )}
                </td>
                <td className="py-3 pr-4 text-center">{item.quantity}</td>
                <td className="py-3 pr-4 text-right text-sm">{formatCurrency(item.price)}</td>
                <td className="py-3 text-right font-medium">{formatCurrency(item.quantity * item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mb-8 flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatCurrency(document.subtotal)}</span>
          </div>
          {document.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Discount {document.discountType === 'percentage' ? `(${document.discount}%)` : ''}
              </span>
              <span className="text-red-600">-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          {document.taxEnabled && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({document.taxRate}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          {document.additionalFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Additional Fee</span>
              <span>{formatCurrency(document.additionalFee)}</span>
            </div>
          )}
          <div 
            className={`flex justify-between pt-2 text-lg font-bold ${styles.total}`}
            style={template === 'modern' || template === 'creative' ? { 
              backgroundColor: accentColor + '15',
              padding: '12px',
              marginTop: '8px',
            } : {}}
          >
            <span>Total</span>
            <span style={{ color: accentColor }}>{formatCurrency(document.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      {document.type === 'invoice' && businessProfile.bankName && (
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            Payment Details
          </p>
          <div className="text-sm">
            <p><span className="text-gray-600">Bank:</span> {businessProfile.bankName}</p>
            <p><span className="text-gray-600">Account:</span> {businessProfile.accountNumber}</p>
            <p><span className="text-gray-600">Name:</span> {businessProfile.accountName}</p>
          </div>
        </div>
      )}

      {/* Notes & Terms */}
      {(document.notes || document.terms) && (
        <div className="space-y-4 border-t border-gray-100 pt-6 text-xs text-gray-600">
          {document.notes && (
            <div>
              <p className="mb-1 font-medium uppercase tracking-wide text-gray-500">Notes</p>
              <p className="whitespace-pre-line">{document.notes}</p>
            </div>
          )}
          {document.terms && (
            <div>
              <p className="mb-1 font-medium uppercase tracking-wide text-gray-500">Terms & Conditions</p>
              <p className="whitespace-pre-line">{document.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentPreview;
