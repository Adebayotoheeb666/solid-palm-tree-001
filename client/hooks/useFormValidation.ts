import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule[];
}

export interface ValidationErrors {
  [key: string]: string[];
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = useCallback((name: string, value: any): string[] => {
    const fieldRules = rules[name] || [];
    const fieldErrors: string[] = [];

    for (const rule of fieldRules) {
      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        fieldErrors.push(rule.message);
        continue;
      }

      if (value && typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          fieldErrors.push(rule.message);
        }

        if (rule.maxLength && value.length > rule.maxLength) {
          fieldErrors.push(rule.message);
        }

        if (rule.pattern && !rule.pattern.test(value)) {
          fieldErrors.push(rule.message);
        }
      }

      if (rule.custom && !rule.custom(value)) {
        fieldErrors.push(rule.message);
      }
    }

    return fieldErrors;
  }, [rules]);

  const validateForm = useCallback((formData: { [key: string]: any }): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const fieldErrors = validateField(fieldName, formData[fieldName]);
      if (fieldErrors.length > 0) {
        newErrors[fieldName] = fieldErrors;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  const validateSingleField = useCallback((name: string, value: any) => {
    const fieldErrors = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldErrors
    }));
    return fieldErrors.length === 0;
  }, [validateField]);

  const setFieldTouched = useCallback((name: string, isTouched: boolean = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched
    }));
  }, []);

  const clearFieldError = useCallback((name: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
    setTouched({});
  }, []);

  const getFieldError = useCallback((name: string): string | undefined => {
    return touched[name] && errors[name] ? errors[name][0] : undefined;
  }, [errors, touched]);

  const hasFieldError = useCallback((name: string): boolean => {
    return touched[name] && errors[name] && errors[name].length > 0;
  }, [errors, touched]);

  const hasAnyError = useCallback((): boolean => {
    return Object.keys(errors).some(key => errors[key] && errors[key].length > 0);
  }, [errors]);

  return {
    errors,
    touched,
    validateForm,
    validateSingleField,
    setFieldTouched,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    hasFieldError,
    hasAnyError,
  };
};

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  name: /^[a-zA-Z\s-']+$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  airportCode: /^[A-Z]{3}$/,
  phone: /^\+?[\d\s-()]+$/,
};

// Common validation rules
export const CommonValidationRules = {
  email: [
    { required: true, message: 'Email is required' },
    { pattern: ValidationPatterns.email, message: 'Please enter a valid email address' }
  ],
  firstName: [
    { required: true, message: 'First name is required' },
    { minLength: 2, message: 'First name must be at least 2 characters' },
    { pattern: ValidationPatterns.name, message: 'First name can only contain letters, spaces, hyphens, and apostrophes' }
  ],
  lastName: [
    { required: true, message: 'Last name is required' },
    { minLength: 2, message: 'Last name must be at least 2 characters' },
    { pattern: ValidationPatterns.name, message: 'Last name can only contain letters, spaces, hyphens, and apostrophes' }
  ],
  password: [
    { required: true, message: 'Password is required' },
    { minLength: 6, message: 'Password must be at least 6 characters long' }
  ],
  title: [
    { required: true, message: 'Title is required' }
  ],
  airportCode: [
    { required: true, message: 'Please select an airport' },
    { pattern: ValidationPatterns.airportCode, message: 'Invalid airport code' }
  ],
  date: [
    { required: true, message: 'Date is required' },
    { 
      custom: (value: string) => {
        if (!value) return false;
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }, 
      message: 'Date must be today or in the future' 
    }
  ],
  termsAccepted: [
    { 
      custom: (value: boolean) => value === true, 
      message: 'You must accept the terms and conditions' 
    }
  ]
};
