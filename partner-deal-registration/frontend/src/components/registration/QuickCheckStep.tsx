import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Building2, Globe, Search, RefreshCw, AlertTriangle } from "lucide-react";
import apiClient from "@/services/apiClient";

interface QuickCheckStepProps {
  formData: any;
  setFormData: (data: any) => void;
  onNext: () => void;
  onValidationChange?: (isValid: boolean) => void;
}

interface DuplicateDeal {
  id: string;
  company_name: string;
  domain: string;
  partner_name: string;
  submitter_name: string;
  deal_value: string;
  status: string;
  created_at: string;
}

const QuickCheckStep: React.FC<QuickCheckStepProps> = ({ formData, setFormData, onNext, onValidationChange }) => {
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [validationTimer, setValidationTimer] = useState<{[key: string]: NodeJS.Timeout | null}>({});
  const [duplicateDeals, setDuplicateDeals] = useState<DuplicateDeal[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [duplicateCheckTimer, setDuplicateCheckTimer] = useState<NodeJS.Timeout | null>(null);
  const [duplicateCheckCompleted, setDuplicateCheckCompleted] = useState(false);
  const [hasTriggeredCheck, setHasTriggeredCheck] = useState(false);

  // Validation functions
  const validateCompanyName = (value: string): string | null => {
    if (!value || value.trim() === '') {
      return 'Enter a valid company name';
    }
    if (value.trim().length < 2) {
      return 'Company name too short';
    }
    if (value.trim().length > 100) {
      return 'Company name too long';
    }
    // Allow letters, numbers, spaces, and common business punctuation
    const validPattern = /^[a-zA-Z0-9\s\-&.,()]+$/;
    if (!validPattern.test(value.trim())) {
      return 'Enter a valid company name';
    }
    return null;
  };

  const validateDomain = (value: string): string | null => {
    if (!value || value.trim() === '') {
      return 'Enter a valid domain';
    }
    // Basic domain validation with common TLDs
    const domainPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.(com|ai|org|net|io|co|biz|info|tech|dev|app|cloud|edu|gov|mil)$/i;
    if (!domainPattern.test(value.trim())) {
      return 'Enter a valid domain';
    }
    return null;
  };

  // API call to check for duplicates - PRODUCTION READY
  const checkForDuplicates = async (companyName: string, domain: string) => {
    try {
      setDuplicateDeals([]);
      setDuplicateCheckCompleted(false);

      // Use apiClient instead of direct fetch - PRODUCTION READY
      const data = await apiClient.checkDuplicates(companyName.trim(), domain.trim());
      
      if (data.duplicates && data.duplicates.length > 0) {
        setDuplicateDeals(data.duplicates);
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
      // Don't block the user if API fails - continue silently
    } finally {
      setIsCheckingDuplicates(false);
      setDuplicateCheckCompleted(true);
    }
  };

  // Debounced duplicate checking
  const triggerDuplicateCheck = (companyName: string, domain: string) => {
    // Clear existing timer
    if (duplicateCheckTimer) {
      clearTimeout(duplicateCheckTimer);
    }

    // Reset states when new input is detected - but keep checking state until API completes
    setDuplicateCheckCompleted(false);
    setHasTriggeredCheck(false);
    setDuplicateDeals([]);

    // Only check if both fields are valid
    const companyError = validateCompanyName(companyName);
    const domainError = validateDomain(domain);
    
    if (!companyError && !domainError && companyName.trim() && domain.trim()) {
      setHasTriggeredCheck(true);
      // Set checking state immediately to disable the button
      setIsCheckingDuplicates(true);
      
      const timer = setTimeout(() => {
        checkForDuplicates(companyName, domain);
      }, 1000); // Wait 1 second after user stops typing
      
      setDuplicateCheckTimer(timer);
    } else {
      // If fields are invalid, make sure we're not in checking state
      setIsCheckingDuplicates(false);
      setDuplicateCheckCompleted(false);
      setHasTriggeredCheck(false);
    }
  };

  // Debounced validation while typing
  const handleInputChange = (field: string, value: string, validator: (val: string) => string | null) => {
    // Update form data immediately
    setFormData({ ...formData, [field]: value });

    // Clear existing timer for this field
    if (validationTimer[field]) {
      clearTimeout(validationTimer[field]);
    }

    // Set new timer for debounced validation
    const timer = setTimeout(() => {
      const error = validator(value);
      setValidationErrors(prev => ({
        ...prev,
        [field]: error || ''
      }));
    }, 500);

    setValidationTimer(prev => ({
      ...prev,
      [field]: timer
    }));

    // Trigger duplicate check if both fields might be valid
    if (field === 'companyName') {
      triggerDuplicateCheck(value, formData.domain || '');
    } else if (field === 'domain') {
      triggerDuplicateCheck(formData.companyName || '', value);
    }
  };

  // Validation on blur (immediate)
  const handleBlur = (field: string, value: string, validator: (val: string) => string | null) => {
    // Clear any pending timer
    if (validationTimer[field]) {
      clearTimeout(validationTimer[field]);
    }

    // Immediate validation
    const error = validator(value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error || ''
    }));

    // Trigger duplicate check on blur
    if (field === 'companyName') {
      triggerDuplicateCheck(value, formData.domain || '');
    } else if (field === 'domain') {
      triggerDuplicateCheck(formData.companyName || '', value);
    }
  };

  // Check if form is valid for progression
  const isFormValid = () => {
    const companyNameError = validateCompanyName(formData.companyName || '');
    const domainError = validateDomain(formData.domain || '');
    const hasValidationErrors = companyNameError || domainError;
    const hasDuplicates = duplicateDeals.length > 0;
    const isCurrentlyChecking = isCheckingDuplicates;
    
    // Block progression if there are validation errors OR duplicates found OR currently checking
    return !hasValidationErrors && !hasDuplicates && !isCurrentlyChecking;
  };

  // Notify parent component of validation state changes
  useEffect(() => {
    const isValid = isFormValid();
    onValidationChange?.(isValid);
  }, [formData.companyName, formData.domain, duplicateDeals, validationErrors, isCheckingDuplicates, onValidationChange]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(validationTimer).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
      if (duplicateCheckTimer) {
        clearTimeout(duplicateCheckTimer);
      }
    };
  }, [validationTimer, duplicateCheckTimer]);

  const handleNext = () => {
    if (isFormValid()) {
      onNext();
    }
  };

  // Format deal status with colors
  const getStatusDisplay = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'approved':
        return <span className="text-green-600 font-medium">✓ Approved</span>;
      case 'rejected':
        return <span className="text-red-600 font-medium">✗ Rejected</span>;
      case 'pending':
      case 'under_review':
        return <span className="text-yellow-600 font-medium">⏳ Under Review</span>;
      case 'submitted':
        return <span className="text-blue-600 font-medium">📝 Submitted</span>;
      default:
        return <span className="text-gray-600 font-medium">{status}</span>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Quick Company Check
        </CardTitle>
        <CardDescription>
          Let's start with basic company information to check for potential duplicates.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Company Name Field */}
        <div className="space-y-2">
          <Label htmlFor="companyName">
            Company Name <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="companyName"
              type="text"
              placeholder="Enter the customer's company name"
              value={formData.companyName || ''}
              onChange={(e) => handleInputChange('companyName', e.target.value, validateCompanyName)}
              onBlur={(e) => handleBlur('companyName', e.target.value, validateCompanyName)}
              className={`pr-10 ${
                validationErrors.companyName 
                  ? 'border-red-500 focus:border-red-500' 
                  : formData.companyName && !validateCompanyName(formData.companyName)
                  ? 'border-green-500 focus:border-green-500'
                  : ''
              }`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {isCheckingDuplicates ? (
                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
              ) : validationErrors.companyName ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : formData.companyName && !validateCompanyName(formData.companyName) ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : null}
            </div>
          </div>
          {validationErrors.companyName && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validationErrors.companyName}
            </p>
          )}
        </div>

        {/* Domain Field */}
        <div className="space-y-2">
          <Label htmlFor="domain">
            Company Domain <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              id="domain"
              type="text"
              placeholder="company.com"
              value={formData.domain || ''}
              onChange={(e) => handleInputChange('domain', e.target.value, validateDomain)}
              onBlur={(e) => handleBlur('domain', e.target.value, validateDomain)}
              className={`pl-10 pr-10 ${
                validationErrors.domain 
                  ? 'border-red-500 focus:border-red-500' 
                  : formData.domain && !validateDomain(formData.domain)
                  ? 'border-green-500 focus:border-green-500'
                  : ''
              }`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {isCheckingDuplicates ? (
                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
              ) : validationErrors.domain ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : formData.domain && !validateDomain(formData.domain) ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : null}
            </div>
          </div>
          {validationErrors.domain && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {validationErrors.domain}
            </p>
          )}
        </div>

        {/* Duplicate Detection Loading */}
        {isCheckingDuplicates && (
          <Alert className="border-blue-200 bg-blue-50">
            <Search className="h-4 w-4" />
            <AlertDescription className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Checking for existing deals...
            </AlertDescription>
          </Alert>
        )}

        {/* Duplicate Detection Results */}
        {duplicateDeals.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="font-medium text-red-800">
                  Duplicate deal detected - Registration blocked
                </p>
                <p className="text-sm text-red-700">
                  {duplicateDeals.length > 1 
                    ? `Found ${duplicateDeals.length} deals already registered for this company/domain.`
                    : 'A deal has already been registered for this company/domain.'
                  }
                </p>
                
                {/* Display duplicate deals - minimal info only */}
                <div className="space-y-2 mt-3">
                  {duplicateDeals.map((deal, index) => (
                    <div key={deal.id} className="bg-white border border-red-200 rounded-lg p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{deal.company_name}</p>
                          <p className="text-gray-600">{deal.domain}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-600">
                            Deal Already Registered
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <p className="text-sm text-red-700 mt-2 font-medium">
                  Please check with your partner manager or use different company details to proceed.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Success State - No Duplicates Found */}
        {!isCheckingDuplicates && duplicateCheckCompleted && hasTriggeredCheck && duplicateDeals.length === 0 && isFormValid() && formData.companyName && formData.domain && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              No duplicate deals found. You're good to proceed!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickCheckStep;