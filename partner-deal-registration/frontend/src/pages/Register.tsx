import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { ProgressIndicator, Step } from "@/components/ui/progress-indicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Save, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useFormValidation, getSubmissionPayload, ValidationRule } from "@/hooks/useFormValidation";
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/services/apiClient';

// Import step components
import { QuickCheckStep } from "@/components/registration/QuickCheckStep";
import { CoreInfoStep } from "@/components/registration/CoreInfoStep";
import { DealIntelligenceStep } from "@/components/registration/DealIntelligenceStep";
import { DocumentationStep } from "@/components/registration/DocumentationStep";
import { ReviewStep } from "@/components/registration/ReviewStep";

// Define FormData interface
interface FormData {
  companyName?: string;
  domain?: string;
  partnerCompany?: string;
  submitterName?: string;
  submitterEmail?: string;
  territory?: string;
  customerLegalName?: string;
  customerIndustry?: string;
  customerLocation?: string;
  dealStage?: string;
  expectedCloseDate?: string;
  dealValue?: string;
  contractType?: string;
  primaryProduct?: string;
  additionalNotes?: string;
  uploadedFiles?: any[];
  agreedToTerms?: boolean;
}

const steps: Step[] = [
  {
    id: "quick-check",
    title: "Quick Check",
    description: "Duplicate detection",
    status: "current"
  },
  {
    id: "core-info",
    title: "Core Info",
    description: "Partner & customer",
    status: "upcoming"
  },
  {
    id: "deal-intelligence",
    title: "Deal Intelligence",
    description: "Opportunity details",
    status: "upcoming"
  },
  {
    id: "documentation",
    title: "Documentation",
    description: "Supporting files",
    status: "upcoming"
  },
  {
    id: "review",
    title: "Review",
    description: "Final submission",
    status: "upcoming"
  }
];

const Register = () => {
  const { isAuthenticated, user } = useAuth();
  const [currentStepId, setCurrentStepId] = useState("quick-check");
  
  // Initialize formData with proper structure
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    domain: '',
    partnerCompany: '',
    submitterName: '',
    submitterEmail: '',
    territory: '',
    customerLegalName: '',
    customerIndustry: '',
    customerLocation: '',
    dealStage: '',
    expectedCloseDate: '',
    dealValue: '',
    contractType: '',
    primaryProduct: '',
    additionalNotes: '',
    uploadedFiles: [],
    agreedToTerms: false
  });
  
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation rules for all required fields
  const validationRules: ValidationRule[] = [
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

  const { errors, isValid } = useFormValidation(formData, validationRules);

  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Update step statuses based on current step
  const updatedSteps = steps.map((step, index) => ({
    ...step,
    status: index < currentStepIndex ? "completed" :
      index === currentStepIndex ? "current" : "upcoming"
  })) as Step[];

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStepId(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepId(steps[currentStepIndex - 1].id);
    }
  };

  const handleAutoSave = async () => {
    setIsAutoSaving(true);
    // Simulate auto-save API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsAutoSaving(false);
    toast({
      title: "Draft saved",
      description: "Your progress has been automatically saved.",
    });
  };

  const handleSubmit = async () => {
    console.log('=== FORM VALIDATION DEBUG ===');
    console.log('Form data:', formData);
    console.log('Validation errors:', errors);
    console.log('Is valid:', isValid);
    console.log('All required fields present?', {
      companyName: !!formData.companyName,
      domain: !!formData.domain,
      partnerCompany: !!formData.partnerCompany,
      submitterName: !!formData.submitterName,
      submitterEmail: !!formData.submitterEmail,
      territory: !!formData.territory,
      customerIndustry: !!formData.customerIndustry,
      customerLocation: !!formData.customerLocation,
      dealStage: !!formData.dealStage,
      expectedCloseDate: !!formData.expectedCloseDate,
      dealValue: !!formData.dealValue,
      contractType: !!formData.contractType,
      agreedToTerms: !!formData.agreedToTerms
    });
    console.log('================================');

    if (!isValid) {
      console.log('Form is not valid, showing error toast');
      toast({
        title: "Validation Error",
        description: "Please fix all validation errors before submitting.",
        variant: "destructive"
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to submit deal registration.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Get sanitized payload with only allowed fields
      const payload = getSubmissionPayload(formData);

      // Submit to real backend API
      console.log('Submitting deal registration to API:', payload);
      const response = await apiClient.submitDeal(payload);

      console.log('API Response:', response);

      toast({
        title: "Deal submitted successfully!",
        description: response.message || "Your deal registration has been submitted for review.",
      });

      // Optional: redirect to dashboard after successful submission
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (error: any) {
      console.error('Submission error:', error);
      toast({
        title: "Submission Error",
        description: error.message || "There was an error submitting your deal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStepId) {
      case "quick-check":
        return (
          <QuickCheckStep 
            formData={formData} 
            setFormData={setFormData} 
            onNext={() => setCurrentStepId("core-info")}
          />
        );
      case "core-info":
        return (
          <CoreInfoStep 
            formData={formData} 
            setFormData={setFormData} 
            onNext={() => setCurrentStepId("deal-intelligence")}
          />
        );
      case "deal-intelligence":
        return (
          <DealIntelligenceStep 
            formData={formData} 
            setFormData={setFormData} 
            onNext={() => setCurrentStepId("documentation")}
          />
        );
      case "documentation":
        return (
          <DocumentationStep 
            formData={formData} 
            setFormData={setFormData} 
            onNext={() => setCurrentStepId("review")}
          />
        );
      case "review":
        return (
          <ReviewStep 
            formData={formData} 
            setFormData={setFormData} 
            onNext={handleSubmit}
          />
        );
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Header />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Register New Deal
              </h1>
              <p className="text-muted-foreground">
                Complete all steps to register your deal for approval
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <ProgressIndicator
                steps={updatedSteps}
                currentStep={currentStepId}
              />
            </div>

            {/* Form Card */}
            <Card className="shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl">
                  {steps.find(step => step.id === currentStepId)?.title}
                </CardTitle>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {steps.find(step => step.id === currentStepId)?.description}
                  </span>
                  <div className="flex items-center gap-2">
                    {isAutoSaving && (
                      <div className="flex items-center gap-1">
                        <Save className="w-3 h-3 animate-spin" />
                        <span>Saving...</span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAutoSave}
                      disabled={isAutoSaving}
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save Draft
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pb-6">
                {renderCurrentStep()}
              </CardContent>

              {/* Navigation */}
              <div className="border-t border-border p-6">
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={isFirstStep}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex gap-3">
                    {!isLastStep ? (
                      <Button onClick={handleNext}>
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        className="w-full"
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting Deal...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Submit Deal Registration
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Help Text */}
            <div className="text-center mt-6 text-sm text-muted-foreground">
              Need help? Contact your Partner Manager or visit our{" "}
              <a href="/support" className="text-primary hover:underline">
                Support Center
              </a>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Register;