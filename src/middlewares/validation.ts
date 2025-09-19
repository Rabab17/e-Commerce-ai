/**
 * Custom validation middleware
 */

import { Core } from '@strapi/strapi';

// Type definitions for validation rules
interface ValidationRule {
  required?: boolean;
  type?: 'email' | 'phone' | 'url';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
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
      ctx.validateRequest = (rules: ValidationRules) => {
        const errors: string[] = [];
        
        for (const [field, rule] of Object.entries(rules)) {
          const value = ctx.request.body[field];
          
          if (rule.required && (value === undefined || value === null || value === '')) {
            errors.push(`${field} is required`);
            continue;
          }
          
          if (value !== undefined && value !== null && value !== '') {
            if (rule.type === 'email' && !ctx.validate.email(value)) {
              errors.push(`${field} must be a valid email`);
            }
            
            if (rule.type === 'phone' && !ctx.validate.phone(value)) {
              errors.push(`${field} must be a valid phone number`);
            }
            
            if (rule.type === 'url' && !ctx.validate.url(value)) {
              errors.push(`${field} must be a valid URL`);
            }
            
            if (rule.minLength && value.length < rule.minLength) {
              errors.push(`${field} must be at least ${rule.minLength} characters`);
            }
            
            if (rule.maxLength && value.length > rule.maxLength) {
              errors.push(`${field} must not exceed ${rule.maxLength} characters`);
            }
            
            if (rule.min && value < rule.min) {
              errors.push(`${field} must be at least ${rule.min}`);
            }
            
            if (rule.max && value > rule.max) {
              errors.push(`${field} must not exceed ${rule.max}`);
            }
            
            if (rule.pattern && !rule.pattern.test(value)) {
              errors.push(`${field} format is invalid`);
            }
          }
        }
        
        if (errors.length > 0) {
          ctx.throw(400, `Validation failed: ${errors.join(', ')}`);
        }
        
        return true;
      };

      await next();
    } catch (error) {
      strapi.log.error('Validation middleware error:', error);
      ctx.throw(500, 'Internal validation error');
    }
  };
};
