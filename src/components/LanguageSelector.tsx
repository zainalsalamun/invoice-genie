import { Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Language } from "@/lib/i18n";

interface LanguageSelectorProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  label: string;
}

const LanguageSelector = ({ language, onLanguageChange, label }: LanguageSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        {label}
      </Label>
      <Select value={language} onValueChange={(val: Language) => onLanguageChange(val)}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="id">
            <span className="flex items-center gap-2">
              🇮🇩 Bahasa Indonesia
            </span>
          </SelectItem>
          <SelectItem value="en">
            <span className="flex items-center gap-2">
              🇬🇧 English
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
