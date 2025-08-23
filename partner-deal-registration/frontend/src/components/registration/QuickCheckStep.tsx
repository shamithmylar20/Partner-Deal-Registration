import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Building2, Globe } from "lucide-react";

interface QuickCheckStepProps {
  formData: any;
  setFormData: (data: any) => void;
  onNext: () => void;
}

const QuickCheckStep: React.FC<QuickCheckStepProps> = ({ formData, setFormData, onNext }) => {
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [validationTimer, setValidationTimer] = useState<{[key: string]: NodeJS.Timeout | null}>({});

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
  };

  // Check if form is valid for progression
  const isFormValid = () => {
    const companyNameError = validateCompanyName(formData.companyName || '');
    const domainError = validateDomain(formData.domain || '');
    return !companyNameError && !domainError;
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(validationTimer).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [validationTimer]);

  const handleNext = () => {
    if (isFormValid()) {
      onNext();
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
              {validationErrors.companyName ? (
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
            <Input
              id="domain"
              type="text"
              placeholder="company.com"
              value={formData.domain || ''}
              onChange={(e) => handleInputChange('domain', e.target.value, validateDomain)}
              onBlur={(e) => handleBlur('domain', e.target.value, validateDomain)}
              className={`pr-10 ${
                validationErrors.domain 
                  ? 'border-red-500 focus:border-red-500' 
                  : formData.domain && !validateDomain(formData.domain)
                  ? 'border-green-500 focus:border-green-500'
                  : ''
              }`}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {validationErrors.domain ? (
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
      </CardContent>
    </Card>
  );
};

export default QuickCheckStep;