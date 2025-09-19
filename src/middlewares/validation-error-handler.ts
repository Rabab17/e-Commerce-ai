/**
 * Enhanced Validation Error Handler Middleware
 */

import { Core } from '@strapi/strapi';
import { ValidationError, ErrorResponse } from '../utils/errors';

export default (config: any, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: any, next: () => Promise<void>) => {
    try {
      await next();
    } catch (error) {
      // Handle Strapi validation errors
      if (error.name === 'ValidationError' && error.details) {
        const validationErrors = parseStrapiValidationErrors(error.details);
        
        const requestId = generateRequestId();
        const errorResponse: ErrorResponse = {
          status: 'error',
          statusCode: 400,
          errorCode: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: validationErrors,
          path: ctx.url,
          requestId: requestId,
          timestamp: new Date().toISOString(),
          meta: {
            suggestions: getValidationSuggestions(validationErrors),
            documentation: '/docs/validation'
          }
        };

        ctx.status = 400;
        ctx.body = errorResponse;
        ctx.set('X-Request-ID', requestId);
        ctx.set('X-Error-Code', 'VALIDATION_ERROR');
        return;
      }

      // Handle custom validation errors
      if (error instanceof ValidationError) {
        const requestId = generateRequestId();
        const errorResponse: ErrorResponse = {
          status: 'error',
          statusCode: 400,
          errorCode: 'VALIDATION_ERROR',
          message: error.message,
          details: error.details,
          path: ctx.url,
          requestId: requestId,
          timestamp: new Date().toISOString(),
          meta: {
            suggestions: getValidationSuggestions(error.details),
            documentation: '/docs/validation'
          }
        };

        ctx.status = 400;
        ctx.body = errorResponse;
        ctx.set('X-Request-ID', requestId);
        ctx.set('X-Error-Code', 'VALIDATION_ERROR');
        return;
      }

      // Re-throw other errors to be handled by main error handler
      throw error;
    }
  };
};

/**
 * Parse Strapi validation errors into structured format
 */
function parseStrapiValidationErrors(details: any): any {
  const errors: any = {};

  if (details.errors) {
    details.errors.forEach((error: any) => {
      const field = error.path.join('.');
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push({
        message: error.message,
        code: error.code || 'VALIDATION_ERROR',
        value: error.value
      });
    });
  }

  return errors;
}

/**
 * Generate validation suggestions based on errors
 */
function getValidationSuggestions(errors: any): string[] {
  const suggestions: string[] = [];

  if (errors.title) {
    suggestions.push('Title must be 3-100 characters long');
  }
  if (errors.description) {
    suggestions.push('Description must be 10-2000 characters long');
  }
  if (errors.price) {
    suggestions.push('Price must be between $0.01 and $999,999.99');
  }
  if (errors.stock) {
    suggestions.push('Stock must be between 0 and 99,999');
  }
  if (errors.discount) {
    suggestions.push('Discount must be between 0% and 100%');
  }
  if (errors.sizes) {
    suggestions.push('Size must be one of: s, m, l, xl, xxl');
  }
  if (errors.gender) {
    suggestions.push('Gender must be one of: men, women, unisex');
  }
  if (errors.email) {
    suggestions.push('Please provide a valid email address');
  }
  if (errors.password) {
    suggestions.push('Password must be at least 6 characters long');
  }

  return suggestions;
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
