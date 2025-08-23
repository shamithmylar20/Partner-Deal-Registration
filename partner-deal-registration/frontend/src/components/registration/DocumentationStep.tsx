import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/form/FormField";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentationStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

export const DocumentationStep = ({ formData, setFormData }: DocumentationStepProps) => {
  const [additionalNotes, setAdditionalNotes] = useState(formData.additionalNotes || "");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(formData.uploadedFiles || []);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = {
    'rfp': ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'architecture': ['application/pdf', 'image/png', 'image/jpeg'],
    'email': ['message/rfc822', 'application/pdf']
  };

  // Update form data when local state changes
  useEffect(() => {
    setFormData({
      ...formData,
      additionalNotes,
      uploadedFiles
    });
  }, [additionalNotes, uploadedFiles, formData, setFormData]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const files = Array.from(event.target.files || []);
    const errors: string[] = [];
    const newFiles: UploadedFile[] = [];

    files.forEach((file) => {
      // Check file size
      if (file.size > maxFileSize) {
        errors.push(`${file.name}: File size exceeds 10MB limit`);
        return;
      }

      // Check file type based on category
      const allowedTypesForCategory = allowedTypes[category as keyof typeof allowedTypes] || [];
      if (allowedTypesForCategory.length > 0 && !allowedTypesForCategory.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type for ${category}`);
        return;
      }

      newFiles.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      });
    });

    if (errors.length > 0) {
      setUploadErrors(errors);
    } else {
      setUploadErrors([]);
    }

    setUploadedFiles([...uploadedFiles, ...newFiles]);
    
    // Reset input
    event.target.value = '';
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const FileUploadCard = ({ 
    title, 
    description, 
    category, 
    acceptedTypes 
  }: { 
    title: string; 
    description: string; 
    category: string; 
    acceptedTypes: string;
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Drag and drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                {acceptedTypes} • Max 10MB per file
              </p>
              <Button variant="outline" size="sm" asChild>
                <label htmlFor={`upload-${category}`} className="cursor-pointer">
                  Choose Files
                  <input
                    id={`upload-${category}`}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, category)}
                    accept={acceptedTypes}
                  />
                </label>
              </Button>
            </div>
          </div>
          
          {/* Show uploaded files for this category */}
          {uploadedFiles.filter(file => file.name.toLowerCase().includes(category.slice(0, 3))).map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <File className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(file.id)}
                className="text-destructive hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Supporting Documentation
        </h3>
        <p className="text-muted-foreground">
          Upload any relevant documents that support your deal registration (optional)
        </p>
      </div>

      {/* Upload Error Alert */}
      {uploadErrors.length > 0 && (
        <Alert className="border-destructive/20 bg-destructive/5">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium text-destructive">Upload Errors:</div>
              {uploadErrors.map((error, index) => (
                <div key={index} className="text-sm text-foreground">{error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* File Upload Cards */}
      <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
        <FileUploadCard
          title="RFP/RFQ Document"
          description="Request for Proposal or Quote documents"
          category="rfp"
          acceptedTypes="PDF, DOCX"
        />
        
        <FileUploadCard
          title="Architecture Diagram"
          description="Technical architecture or solution diagrams"
          category="architecture"
          acceptedTypes="PDF, PNG, JPG"
        />
      </div>

      <FileUploadCard
        title="Email Thread"
        description="Relevant email communications with the customer"
        category="email"
        acceptedTypes="EML, PDF"
      />

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional Notes</CardTitle>
        </CardHeader>
        <CardContent>
        <FormField
          label="Additional Context"
          tooltip="Optional. Add RFPs, diagrams, or email threads any time after submission."
          helpText="Optional - Maximum 2000 characters"
          >
            <Textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Provide any additional context, special considerations, or important details about this deal..."
              rows={6}
              maxLength={2000}
            />
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {additionalNotes.length}/2000 characters
            </div>
          </FormField>
        </CardContent>
      </Card>

      {/* All Uploaded Files Summary */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uploaded Files Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <File className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};