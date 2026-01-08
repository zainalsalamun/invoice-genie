import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Receipt, Shield, Download, MessageCircle, Palette, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Shield,
    title: "100% Offline & Private",
    description: "Your data never leaves your browser. No server, no tracking.",
  },
  {
    icon: Download,
    title: "PDF Export",
    description: "Export professional A4 documents ready to print or send.",
  },
  {
    icon: MessageCircle,
    title: "Easy Sharing",
    description: "Send via WhatsApp, Email, or copy a shareable link.",
  },
  {
    icon: Palette,
    title: "Beautiful Templates",
    description: "Choose from multiple professional templates.",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Receipt className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">InvoiceGen</span>
          </div>
          <Link to="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/50 to-background py-20 lg:py-32">
        <div className="container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Create Invoice & Quotation
              <span className="block text-primary">in Minutes</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              No login. No backend. Your data stays in your browser.
              <br className="hidden sm:block" />
              Perfect for freelancers, small businesses, and consultants.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/editor?type=invoice">
                <Button size="lg" className="w-full gap-2 sm:w-auto">
                  <FileText className="h-5 w-5" />
                  Create Invoice
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/editor?type=quotation">
                <Button size="lg" variant="outline" className="w-full gap-2 sm:w-auto">
                  <Receipt className="h-5 w-5" />
                  Create Quotation
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold">Everything You Need</h2>
            <p className="text-muted-foreground">
              Simple tools to create professional documents for your business.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="hover-lift rounded-xl border bg-card p-6"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mb-8 text-muted-foreground">
              Create your first invoice or quotation in minutes. No account needed.
            </p>
            <Link to="/dashboard">
              <Button size="lg" className="gap-2">
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>
            🔒 Your data is stored locally in your browser. We never collect or store your information.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
