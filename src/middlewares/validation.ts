/**
 * Custom validation middleware
 */

import { Core } from '@strapi/strapi';
import { ValidationError as AppValidationError } from '../utils/errors';

// Type definitions for validation rules
interface ValidationRule {
  required?: boolean;
  type?: 'email' | 'phone' | 'url';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: any[];
  isArray?: boolean;
  minItems?: number;
  maxItems?: number;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

export default (config: any, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    try {
      // Add validation helpers to context
      ctx.validate = {
        // Validate email format
        email: (email: string) => {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },

        // Validate phone number format
        phone: (phone: string) => {
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          return phoneRegex.test(phone.replace(/\s/g, ''));
        },

        // Validate URL format
        url: (url: string) => {
          try {
            new URL(url);
            return true;
          } catch {
            return false;
          }
        },

        // Validate postal code format
        postalCode: (code: string, country: string = 'US') => {
          const patterns: { [key: string]: RegExp } = {
            US: /^\d{5}(-\d{4})?$/,
            CA: /^[A-Z]\d[A-Z] \d[A-Z]\d$/,
            UK: /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/,
            DE: /^\d{5}$/,
            FR: /^\d{5}$/,
          };
          const pattern = patterns[country.toUpperCase()] || patterns.US;
          return pattern.test(code);
        },

        // Validate credit card number (basic Luhn algorithm)
        creditCard: (cardNumber: string) => {
          const cleaned = cardNumber.replace(/\s/g, '');
          if (!/^\d{13,19}$/.test(cleaned)) return false;
          
          let sum = 0;
          let isEven = false;
          
          for (let i = cleaned.length - 1; i >= 0; i--) {
            let digit = parseInt(cleaned[i]);
            
            if (isEven) {
              digit *= 2;
              if (digit > 9) digit -= 9;
            }
            
            sum += digit;
            isEven = !isEven;
          }
          
          return sum % 10 === 0;
        },

        // Validate password strength
        password: (password: string) => {
          const minLength = 8;
          const hasUpperCase = /[A-Z]/.test(password);
          const hasLowerCase = /[a-z]/.test(password);
          const hasNumbers = /\d/.test(password);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
          
          return {
            isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
            requirements: {
              minLength: password.length >= minLength,
              hasUpperCase,
              hasLowerCase,
              hasNumbers,
              hasSpecialChar
            }
          };
        },

        // Sanitize HTML content
        sanitizeHtml: (html: string) => {
          // Basic HTML sanitization - remove script tags and dangerous attributes
          return html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/javascript:/gi, '');
        },

        // Validate file type
        fileType: (filename: string, allowedTypes: string[]) => {
          const extension = filename.split('.').pop()?.toLowerCase();
          return extension ? allowedTypes.includes(extension) : false;
        },

        // Validate file size
        fileSize: (size: number, maxSizeMB: number) => {
          const maxSizeBytes = maxSizeMB * 1024 * 1024;
          return size <= maxSizeBytes;
        }
      };

      // Add request validation
      const validateObject = (obj: any, rules: ValidationRules) => {
        const errors: Record<string, string[]> = {};
        for (const [field, rule] of Object.entries(rules)) {
          const value = obj ? obj[field] : undefined;
          if (rule.required && (value === undefined || value === null || value === '')) {
            errors[field] = errors[field] || [];
            errors[field].push('is required');
            continue;
          }
          if (value !== undefined && value !== null && value !== '') {
            if (rule.isArray) {
              if (!Array.isArray(value)) {
                errors[field] = errors[field] || [];
                errors[field].push('must be an array');
              } else {
                if (rule.minItems !== undefined && value.length < rule.minItems) {
                  errors[field] = errors[field] || [];
                  errors[field].push(`must contain at least ${rule.minItems} items`);
                }
                if (rule.maxItems !== undefined && value.length > rule.maxItems) {
                  errors[field] = errors[field] || [];
                  errors[field].push(`must not exceed ${rule.maxItems} items`);
                }
              }
            }
            if (rule.type === 'email' && !ctx.validate.email(String(value))) {
              errors[field] = errors[field] || [];
              errors[field].push('must be a valid email');
            }
            if (rule.type === 'phone' && !ctx.validate.phone(String(value))) {
              errors[field] = errors[field] || [];
              errors[field].push('must be a valid phone number');
            }
            if (rule.type === 'url' && !ctx.validate.url(String(value))) {
              errors[field] = errors[field] || [];
              errors[field].push('must be a valid URL');
            }
            if (rule.minLength || rule.maxLength) {
              const str = String(value);
              if (rule.minLength && str.length < rule.minLength) {
                errors[field] = errors[field] || [];
                errors[field].push(`must be at least ${rule.minLength} characters`);
              }
              if (rule.maxLength && str.length > rule.maxLength) {
                errors[field] = errors[field] || [];
                errors[field].push(`must not exceed ${rule.maxLength} characters`);
              }
            }
            if (rule.min !== undefined || rule.max !== undefined) {
              const num = typeof value === 'number' ? value : Number(value);
              if (Number.isNaN(num)) {
                errors[field] = errors[field] || [];
                errors[field].push('must be a valid number');
              } else {
                if (rule.min !== undefined && num < rule.min) {
                  errors[field] = errors[field] || [];
                  errors[field].push(`must be at least ${rule.min}`);
                }
                if (rule.max !== undefined && num > rule.max) {
                  errors[field] = errors[field] || [];
                  errors[field].push(`must not exceed ${rule.max}`);
                }
              }
            }
            if (rule.pattern && !rule.pattern.test(String(value))) {
              errors[field] = errors[field] || [];
              errors[field].push('format is invalid');
            }
            if (rule.enum && Array.isArray(rule.enum) && !rule.enum.includes(value)) {
              errors[field] = errors[field] || [];
              errors[field].push(`must be one of: ${rule.enum.join(', ')}`);
            }
          }
        }
        if (Object.keys(errors).length > 0) {
          throw new AppValidationError('Validation failed', errors);
        }
        return true;
      };

      ctx.validateRequest = (rules: ValidationRules) => {
        return validateObject(ctx.request.body || {}, rules);
      };

      ctx.validateRequestAt = (pathOrObject: string | any, rules: ValidationRules) => {
        let target: any = null;
        if (typeof pathOrObject === 'string') {
          const segments = pathOrObject.split('.');
          target = segments.reduce((acc, seg) => (acc ? acc[seg] : undefined), ctx.request.body || {});
        } else {
          target = pathOrObject;
        }
        return validateObject(target || {}, rules);
      };

      await next();
    } catch (error) {
      strapi.log.error('Validation middleware error:', error);
      throw error;
    }
  };
};
