import { Document, BusinessProfile, TemplateType } from "@/types/invoice";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getTranslation, Language } from "@/lib/i18n";

interface DocumentPreviewProps {
  document: Document;
  businessProfile: BusinessProfile;
}

const DocumentPreview = ({ document, businessProfile }: DocumentPreviewProps) => {
  const { template, accentColor, language } = document;
  const t = getTranslation(language || 'id');

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
          logoSize: "h-12",
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
          logoSize: "h-14",
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
          logoSize: "h-16",
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
          logoSize: "h-12",
        };
      case 'elegant':
        return {
          container: "font-serif",
          header: "mb-10 text-center",
          title: "text-3xl font-light tracking-widest",
          accent: "border-gray-400",
          table: "border-collapse",
          tableHeader: "border-b border-gray-300 text-left text-xs font-medium uppercase tracking-widest text-gray-500",
          total: "border-t border-gray-400",
          logoSize: "h-14 mx-auto",
        };
      case 'bold':
        return {
          container: "font-sans",
          header: "mb-8 pb-6",
          title: "text-4xl font-black uppercase tracking-tight",
          accent: `bg-[${accentColor}]`,
          table: "border-collapse",
          tableHeader: "text-left text-sm font-black uppercase",
          total: "rounded-none",
          logoSize: "h-16",
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
          logoSize: "h-12",
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

  const renderHeader = () => {
    if (template === 'elegant') {
      return (
        <div className={styles.header}>
          {businessProfile.logo && (
            <img 
              src={businessProfile.logo} 
              alt="Logo" 
              className={`${styles.logoSize} object-contain mb-4`}
            />
          )}
          <h1 
            className={styles.title}
            style={{ color: accentColor }}
          >
            {document.type === 'invoice' ? t.invoice : t.quotation}
          </h1>
          <p className="mt-2 text-sm text-gray-500">#{document.number}</p>
          <div className="mt-4 flex justify-center gap-8 text-sm">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{t.issueDate}</p>
              <p className="font-medium">{formatDate(document.issueDate)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {document.type === 'invoice' ? t.dueDate : t.validUntil}
              </p>
              <p className="font-medium">{formatDate(document.dueDate)}</p>
            </div>
          </div>
        </div>
      );
    }

    if (template === 'bold') {
      return (
        <div className={styles.header}>
          <div 
            className="h-2 w-full mb-6"
            style={{ backgroundColor: accentColor }}
          />
          <div className="flex items-start justify-between">
            <div>
              {businessProfile.logo && (
                <img 
                  src={businessProfile.logo} 
                  alt="Logo" 
                  className={`${styles.logoSize} object-contain mb-3`}
                />
              )}
              <h1 
                className={styles.title}
                style={{ color: accentColor }}
              >
                {document.type === 'invoice' ? t.invoice : t.quotation}
              </h1>
              <p className="mt-1 text-lg font-bold">#{document.number}</p>
            </div>
            <div className="text-right">
              {businessProfile.name && (
                <h2 className="text-xl font-black">{businessProfile.name}</h2>
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
      );
    }

    return (
      <div className={styles.header}>
        <div className="flex items-start justify-between">
          <div>
            {businessProfile.logo && (
              <img 
                src={businessProfile.logo} 
                alt="Logo" 
                className={`${styles.logoSize} object-contain mb-3`}
              />
            )}
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
              {document.type === 'invoice' ? t.invoice : t.quotation}
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
    );
  };

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
      {renderHeader()}

      {/* Customer & Dates */}
      <div className={`mb-8 grid ${template === 'elegant' ? 'grid-cols-1 text-center' : 'grid-cols-2'} gap-8`}>
        <div className={template === 'elegant' ? 'mx-auto' : ''}>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
            {t.billTo}
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
        {template !== 'elegant' && (
          <div className="text-right">
            <div className="mb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{t.issueDate}</p>
              <p className="font-medium">{formatDate(document.issueDate)}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {document.type === 'invoice' ? t.dueDate : t.validUntil}
              </p>
              <p className="font-medium">{formatDate(document.dueDate)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className={`w-full ${styles.table}`}>
          <thead>
            <tr className={styles.tableHeader}>
              <th className="pb-3 pr-4">{t.item}</th>
              <th className="pb-3 pr-4 text-center w-20">{t.qty}</th>
              <th className="pb-3 pr-4 text-right w-28">{t.price}</th>
              <th className="pb-3 text-right w-28">{t.subtotal}</th>
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
            <span className="text-gray-600">{t.subtotal}</span>
            <span>{formatCurrency(document.subtotal)}</span>
          </div>
          {document.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {t.discount} {document.discountType === 'percentage' ? `(${document.discount}%)` : ''}
              </span>
              <span className="text-red-600">-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          {document.taxEnabled && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t.tax} ({document.taxRate}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
          )}
          {document.additionalFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t.additionalFee}</span>
              <span>{formatCurrency(document.additionalFee)}</span>
            </div>
          )}
          <div 
            className={`flex justify-between pt-2 text-lg font-bold ${styles.total}`}
            style={(template === 'modern' || template === 'creative' || template === 'bold') ? { 
              backgroundColor: accentColor + '15',
              padding: '12px',
              marginTop: '8px',
            } : {}}
          >
            <span>{t.total}</span>
            <span style={{ color: accentColor }}>{formatCurrency(document.total)}</span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      {document.type === 'invoice' && businessProfile.bankName && (
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            {t.paymentDetails}
          </p>
          <div className="text-sm">
            <p><span className="text-gray-600">{t.bank}:</span> {businessProfile.bankName}</p>
            <p><span className="text-gray-600">{t.account}:</span> {businessProfile.accountNumber}</p>
            <p><span className="text-gray-600">{t.accountName}:</span> {businessProfile.accountName}</p>
          </div>
        </div>
      )}

      {/* Notes & Terms */}
      {(document.notes || document.terms) && (
        <div className="space-y-4 border-t border-gray-100 pt-6 text-xs text-gray-600">
          {document.notes && (
            <div>
              <p className="mb-1 font-medium uppercase tracking-wide text-gray-500">{t.notes}</p>
              <p className="whitespace-pre-line">{document.notes}</p>
            </div>
          )}
          {document.terms && (
            <div>
              <p className="mb-1 font-medium uppercase tracking-wide text-gray-500">{t.termsConditions}</p>
              <p className="whitespace-pre-line">{document.terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentPreview;
