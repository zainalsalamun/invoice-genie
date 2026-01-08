import { useRef } from "react";
import { Upload, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface LogoUploadProps {
  logo?: string;
  onLogoChange: (logo: string | undefined) => void;
  labels: {
    logo: string;
    uploadLogo: string;
    removeLogo: string;
  };
}

const LogoUpload = ({ logo, onLogoChange, labels }: LogoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 500KB)
    if (file.size > 500 * 1024) {
      alert('File terlalu besar. Maksimal 500KB.');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onLogoChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onLogoChange(undefined);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <Label>{labels.logo}</Label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {logo ? (
        <div className="relative inline-block">
          <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-muted">
            <img 
              src={logo} 
              alt="Business logo" 
              className="h-full w-full object-contain"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="h-20 w-full gap-2 border-dashed"
          onClick={() => inputRef.current?.click()}
        >
          <Image className="h-5 w-5 text-muted-foreground" />
          <span className="text-muted-foreground">{labels.uploadLogo}</span>
        </Button>
      )}
    </div>
  );
};

export default LogoUpload;
