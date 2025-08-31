import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { useFormValidation, ValidationRule } from "@/hooks/useFormValidation";


interface ReviewStepProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const ReviewStep = ({ formData, setFormData }: ReviewStepProps) => {
  // Use formData directly instead of local state
  const agreedToTerms = formData.agreedToTerms || false;

  // Update form data when terms agreement changes
  const handleTermsChange = (checked: boolean) => {
    console.log('Terms checkbox changed:', checked);
    setFormData({ ...formData, agreedToTerms: checked });
    console.log('Updated formData:', { ...formData, agreedToTerms: checked });
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
    if (isNaN(num)) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatArray = (arr: any[]) => {
    if (!arr || arr.length === 0) return 'None selected';
    return arr.join(', ');
  };

  const getEstimatedApprovalTime = () => {
    const dealValue = parseFloat(formData.dealValue?.replace(/[^0-9.]/g, '') || '0');
    
    if (dealValue > 500000) {
      return "24-48 hours (Manual review required)";
    } else if (dealValue > 100000) {
      return "4-24 hours (Standard review)";
    } else {
      return "Under 4 hours (Fast-track approval)";
    }
  };

  const getApprovalRoute = () => {
    const dealValue = parseFloat(formData.dealValue?.replace(/[^0-9.]/g, '') || '0');
    
    if (dealValue > 500000) {
      return "Enterprise Sales Director + Regional VP";
    } else if (dealValue > 100000) {
      return "Regional Sales Manager + Partner Manager";
    } else {
      return "Auto-approval with Partner Manager notification";
    }
  };

  const debugValidationRules: ValidationRule[] = [
  { field: 'companyName', required: true, minLength: 2 },
  { field: 'domain', required: true, pattern: /^[a-z0-9.-]+\.[a-z]{2,}$/ },
  { field: 'partnerCompany', required: true },
  { field: 'submitterName', required: true, minLength: 2, maxLength: 50 },
  { field: 'submitterEmail', required: true, email: true },
  { field: 'territory', required: true },
  { field: 'customerIndustry', required: true },
  { field: 'customerLocation', required: true },
  { field: 'dealStage', required: true },
  { field: 'expectedCloseDate', required: true, futureDate: true },
  { field: 'dealValue', required: true, positiveNumber: true },
  { field: 'contractType', required: true },
  { field: 'agreedToTerms', required: true }
];

const { errors: debugErrors, isValid: debugIsValid } = useFormValidation(formData, debugValidationRules);


  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Review Your Deal Registration
        </h3>
        <p className="text-muted-foreground">
          Please review all information before submitting. You can edit any section if needed.
        </p>
      </div>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Company Name</p>
              <p className="text-foreground">{formData.companyName || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Domain</p>
              <p className="text-foreground">{formData.domain || 'Not specified'}</p>
            </div>
          </div>

          {formData.customerLegalName && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Legal Entity Name</p>
              <p className="text-foreground">{formData.customerLegalName}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Industry</p>
              <p className="text-foreground">{formData.customerIndustry || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Location</p>
              <p className="text-foreground">{formData.customerLocation || 'Not specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Partner Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Partner Company</p>
              <p className="text-foreground">{formData.partnerCompany || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Territory</p>
              <p className="text-foreground">{formData.territory || 'Not specified'}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Submitter Name</p>
              <p className="text-foreground">{formData.submitterName || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Submitter Email</p>
              <p className="text-foreground">{formData.submitterEmail || 'Not specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Deal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deal Value</p>
              <p className="text-foreground">{formatCurrency(formData.dealValue)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Expected Close Date</p>
              <p className="text-foreground">{formatDate(formData.expectedCloseDate)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deal Stage</p>
              <p className="text-foreground">{formData.dealStage || 'Not specified'}</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Contract Type</p>
              <p className="text-foreground">{formData.contractType || 'Not specified'}</p>
            </div>

            {formData.primaryProduct && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Primary Product</p>
                <p className="text-foreground">{formData.primaryProduct}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Documentation */}
      {(formData.uploadedFiles?.length > 0 || formData.additionalNotes) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Documentation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {formData.uploadedFiles?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Uploaded Files</p>
                <div className="space-y-1">
                  {formData.uploadedFiles.map((file: any, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {formData.additionalNotes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Additional Notes</p>
                <p className="text-foreground text-sm">{formData.additionalNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Approval Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Approval Process</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estimated Approval Time</p>
              <p className="text-foreground">{getEstimatedApprovalTime()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Approval Route</p>
              <p className="text-foreground">{getApprovalRoute()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Terms and Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => handleTermsChange(checked as boolean)}
              />
              <div className="space-y-1">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the terms and conditions
                </label>
                <p className="text-sm text-muted-foreground">
                  By submitting this deal registration, I confirm that all information provided is accurate 
                  and complete. I understand that providing false information may result in deal rejection 
                  and potential termination of partner status.
                </p>
              </div>
            </div>

            {agreedToTerms && (
              <Alert className="border-success/20 bg-success/5">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  Thank you for confirming. Your deal is ready for submission.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Summary */}
      {!agreedToTerms && (
        <Alert className="border-warning/20 bg-warning/5">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning">
            Please review all sections and agree to the terms and conditions before submitting.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};