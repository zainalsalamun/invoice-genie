import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plus, 
  FileText, 
  Receipt, 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  Copy, 
  Trash2,
  ArrowLeft,
  DollarSign,
  CheckCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDocuments, deleteDocument, saveDocument } from "@/lib/storage";
import { formatCurrency, formatDateShort } from "@/lib/formatters";
import { Document, createEmptyDocument, DocumentStatus } from "@/types/invoice";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

const statusConfig: Record<DocumentStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "status-draft" },
  sent: { label: "Sent", className: "status-sent" },
  approved: { label: "Approved", className: "status-approved" },
  paid: { label: "Paid", className: "status-paid" },
  pending: { label: "Pending", className: "status-pending" },
  overdue: { label: "Overdue", className: "status-overdue" },
};

const Dashboard = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = () => {
    const docs = getDocuments();
    setDocuments(docs.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ));
  };

  const handleDelete = (id: string) => {
    deleteDocument(id);
    loadDocuments();
    toast({
      title: "Document deleted",
      description: "The document has been removed.",
    });
  };

  const handleDuplicate = (doc: Document) => {
    const newDoc: Document = {
      ...doc,
      id: uuidv4(),
      number: `${doc.number}-COPY`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveDocument(newDoc);
    loadDocuments();
    toast({
      title: "Document duplicated",
      description: "A copy has been created.",
    });
  };

  const totalInvoices = documents.filter(d => d.type === 'invoice').length;
  const totalQuotations = documents.filter(d => d.type === 'quotation').length;
  const totalValue = documents
    .filter(d => d.type === 'invoice')
    .reduce((sum, d) => sum + d.total, 0);
  const paidValue = documents
    .filter(d => d.type === 'invoice' && d.status === 'paid')
    .reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Receipt className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold">Dashboard</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/editor?type=quotation">
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                New Quotation
              </Button>
            </Link>
            <Link to="/editor?type=invoice">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Invoice
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Documents
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{documents.length}</div>
                <p className="text-xs text-muted-foreground">
                  {totalInvoices} invoices, {totalQuotations} quotations
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Invoice Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Paid
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{formatCurrency(paidValue)}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Outstanding
                </CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{formatCurrency(totalValue - paidValue)}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Documents Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mb-2 font-semibold">No documents yet</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Create your first invoice or quotation to get started.
                  </p>
                  <div className="flex justify-center gap-2">
                    <Link to="/editor?type=invoice">
                      <Button>Create Invoice</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {doc.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{doc.number}</TableCell>
                        <TableCell>{doc.customer.name || "—"}</TableCell>
                        <TableCell>{formatDateShort(doc.issueDate)}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(doc.total)}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusConfig[doc.status].className}>
                            {statusConfig[doc.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Link to={`/editor/${doc.id}`}>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </DropdownMenuItem>
                              </Link>
                              <Link to={`/editor/${doc.id}`}>
                                <DropdownMenuItem>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem onClick={() => handleDuplicate(doc)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDelete(doc.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
