import { useState, useEffect, useMemo } from 'react';

export interface ValidationRule {
  field: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  futureDate?: boolean;
  positiveNumber?: boolean;
  custom?: (value: any) => string | null;
}

export const useFormValidation = (formData: any, rules: ValidationRule[]) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Memoize the rules to prevent infinite re-renders
  const memoizedRules = useMemo(() => rules, [JSON.stringify(rules)]);
  
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    memoizedRules.forEach(rule => {
      const value = formData[rule.field];
      
      // Required validation
      if (rule.required) {
        if (rule.field === 'agreedToTerms') {
          if (value !== true) {
            newErrors[rule.field] = 'You must agree to the terms and conditions.';
            return;
          }
        } else {
          if (!value || value.toString().trim() === '') {
            newErrors[rule.field] = 'This field is required.';
            return;
          }
        }
      }
      
      // Skip other validations if field is empty and not required
      if (!value || value.toString().trim() === '') {
        return;
      }
      
      // Email validation
      if (rule.email && !isValidEmail(value)) {
        newErrors[rule.field] = 'Enter a valid email.';
        return;
      }
      
      // Pattern validation
      if (rule.pattern && !rule.pattern.test(value)) {
        if (rule.field === 'domain') {
          newErrors[rule.field] = 'Enter a valid domain like example.com.';
        } else {
          newErrors[rule.field] = 'Invalid format.';
        }
        return;
      }
      
      // Length validations
      if (rule.minLength && value.length < rule.minLength) {
        newErrors[rule.field] = `Minimum ${rule.minLength} characters required.`;
        return;
      }
      
      if (rule.maxLength && value.length > rule.maxLength) {
        newErrors[rule.field] = `Maximum ${rule.maxLength} characters allowed.`;
        return;
      }
      
      // Future date validation
      if (rule.futureDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(value);
        if (inputDate <= today) {
          newErrors[rule.field] = 'Choose a future date.';
          return;
        }
      }
      
      // Positive number validation
      if (rule.positiveNumber) {
        const num = parseFloat(value.toString().replace(/[^0-9.]/g, ''));
        if (isNaN(num) || num <= 0) {
          newErrors[rule.field] = 'Enter a positive amount.';
          return;
        }
      }
      
      // Custom validation
      if (rule.custom) {
        const customError = rule.custom(value);
        if (customError) {
          newErrors[rule.field] = customError;
          return;
        }
      }
    });
    
    setErrors(newErrors);
  }, [formData, memoizedRules]);
  
  const isValid = Object.keys(errors).length === 0;
  
  return { errors, isValid };
};

const isValidEmail = (email: string): boolean => {
  // RFC5322 compliant email regex (simplified)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};

// Form data sanitization
export const sanitizeFormData = (formData: any) => {
  const sanitized = { ...formData };
  
  // Trim all string values
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitized[key].trim();
    }
  });
  
  // Lowercase domain
  if (sanitized.domain) {
    sanitized.domain = sanitized.domain.toLowerCase();
  }
  
  return sanitized;
};

// Extract only the fields that should be included in submission
export const getSubmissionPayload = (formData: any) => {
  const payload: any = {};
  
  // Only include retained fields as per requirements
  const allowedFields = [
    'partnerCompany',
    'submitterName', 
    'submitterEmail',
    'territory',
    'companyName',
    'domain',
    'customerLegalName',
    'customerIndustry',
    'customerLocation',
    'dealStage',
    'expectedCloseDate',
    'dealValue',
    'contractType',
    'primaryProduct',
    'additionalNotes',
    'uploadedFiles',
    'agreedToTerms' // ADD THIS LINE
  ];
  
  allowedFields.forEach(field => {
    if (formData[field] !== undefined && formData[field] !== null && formData[field] !== '') {
      payload[field] = formData[field];
    }
  });
  
  return sanitizeFormData(payload);
};