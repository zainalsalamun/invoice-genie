import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplateType } from "@/types/invoice";
import { Translations } from "@/lib/i18n";

interface TemplateSelectorProps {
  selectedTemplate: TemplateType;
  accentColor: string;
  onSelectTemplate: (template: TemplateType) => void;
  onSelectColor: (color: string) => void;
  t: Translations;
}

const getTemplates = (t: Translations): { id: TemplateType; name: string; description: string }[] => [
  { id: 'minimal', name: t.minimal, description: 'Clean & simple' },
  { id: 'modern', name: t.modern, description: 'Bold & contemporary' },
  { id: 'creative', name: t.creative, description: 'Unique & artistic' },
  { id: 'corporate', name: t.corporate, description: 'Professional & formal' },
  { id: 'elegant', name: t.elegant, description: 'Sophisticated & refined' },
  { id: 'bold', name: t.bold, description: 'Strong & impactful' },
];

const colors = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#84cc16', // lime
  '#f97316', // orange
];

const TemplateSelector = ({
  selectedTemplate,
  accentColor,
  onSelectTemplate,
  onSelectColor,
  t,
}: TemplateSelectorProps) => {
  const templates = getTemplates(t);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">{t.templateStyle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Templates */}
        <div className="grid grid-cols-2 gap-3">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template.id)}
              className={`relative flex flex-col items-start rounded-lg border-2 p-3 text-left transition-all hover:border-primary/50 ${
                selectedTemplate === template.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              }`}
            >
              {selectedTemplate === template.id && (
                <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
              <span className="font-medium">{template.name}</span>
              <span className="text-xs text-muted-foreground">{template.description}</span>
            </button>
          ))}
        </div>

        {/* Color Picker */}
        <div>
          <p className="mb-3 text-sm font-medium">{t.accentColor}</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => onSelectColor(color)}
                className={`relative h-8 w-8 rounded-full transition-transform hover:scale-110 ${
                  accentColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                }`}
                style={{ backgroundColor: color }}
              >
                {accentColor === color && (
                  <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />
                )}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateSelector;
