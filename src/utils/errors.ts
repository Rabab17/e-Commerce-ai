/**
 * Custom Error Classes for Enhanced Error Handling
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, 500, 'DATABASE_ERROR', true, details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(message: string = 'External service error', details?: any) {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', true, details);
  }
}

export class BusinessLogicError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 422, 'BUSINESS_LOGIC_ERROR', true, details);
  }
}

/**
 * Standardized Error Response Interface (RFC-like)
 */
export interface ErrorResponse {
  status: 'error';
  statusCode: number;
  errorCode: string;
  message: string;
  details?: any;
  path?: string;
  requestId?: string;
  timestamp: string;
  meta?: {
    suggestions?: string[];
    documentation?: string;
  };
}

/**
 * Error Handler Utility
 */
export class ErrorHandler {
  /**
   * Handle different types of errors
   */
  static handle(error: any): ErrorResponse {
    // Strapi validation errors
    if (error.name === 'ValidationError') {
      return this.handleValidationError(error);
    }

    // Strapi authorization errors
    if (error.name === 'ForbiddenError') {
      return this.handleAuthorizationError(error);
    }

    // Strapi not found errors
    if (error.name === 'NotFoundError') {
      return this.handleNotFoundError(error);
    }

    // Custom app errors
    if (error instanceof AppError) {
      return this.handleAppError(error);
    }

    // Database errors
    if (error.code && error.code.startsWith('ER_')) {
      return this.handleDatabaseError(error);
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
      return this.handleJWTError(error);
    }

    // Default error handling
    return this.handleGenericError(error);
  }

  private static handleValidationError(error: any): ErrorResponse {
    const details = error.details || {};
    const suggestions = this.getValidationSuggestions(details);

    return {
      status: 'error',
      statusCode: 400,
      errorCode: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: details,
      timestamp: new Date().toISOString(),
      meta: {
        suggestions,
        documentation: '/docs/validation'
      }
    };
  }

  private static handleAuthorizationError(error: any): ErrorResponse {
    return {
      status: 'error',
      statusCode: 403,
      errorCode: 'AUTHORIZATION_ERROR',
      message: error.message || 'Insufficient permissions',
      timestamp: new Date().toISOString(),
      meta: {
        suggestions: [
          'Check if you have the required permissions',
          'Verify your user role',
          'Contact administrator if you believe this is an error'
        ],
        documentation: '/docs/authentication'
      }
    };
  }

  private static handleNotFoundError(error: any): ErrorResponse {
    return {
      status: 'error',
      statusCode: 404,
      errorCode: 'NOT_FOUND_ERROR',
      message: error.message || 'Resource not found',
      timestamp: new Date().toISOString(),
      meta: {
        suggestions: [
          'Check if the resource ID is correct',
          'Verify the resource exists',
          'Check if you have access to this resource'
        ],
        documentation: '/docs/api-reference'
      }
    };
  }

  private static handleAppError(error: AppError): ErrorResponse {
    return {
      status: 'error',
      statusCode: error.statusCode,
      errorCode: error.errorCode,
      message: error.message,
      details: error.details,
      timestamp: new Date().toISOString(),
      meta: {
        suggestions: this.getSuggestionsForErrorCode(error.errorCode),
        documentation: '/docs/error-codes'
      }
    };
  }

  private static handleDatabaseError(error: any): ErrorResponse {
    const suggestions = this.getDatabaseErrorSuggestions(error.code);

    return {
      status: 'error',
      statusCode: 500,
      errorCode: 'DATABASE_ERROR',
      message: 'Database operation failed',
      details: {
        code: error.code,
        sqlMessage: error.sqlMessage
      },
      timestamp: new Date().toISOString(),
      meta: {
        suggestions,
        documentation: '/docs/database'
      }
    };
  }

  private static handleJWTError(error: any): ErrorResponse {
    return {
      status: 'error',
      statusCode: 401,
      errorCode: 'AUTHENTICATION_ERROR',
      message: 'Invalid or expired token',
      details: {
        jwtError: error.message
      },
      timestamp: new Date().toISOString(),
      meta: {
        suggestions: [
          'Check if your token is valid',
          'Try logging in again',
          'Verify token expiration'
        ],
        documentation: '/docs/authentication'
      }
    };
  }

  private static handleGenericError(error: any): ErrorResponse {
    return {
      status: 'error',
      statusCode: 500,
      errorCode: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        message: error.message
      } : undefined,
      timestamp: new Date().toISOString(),
      meta: {
        suggestions: [
          'Try again later',
          'Contact support if the problem persists'
        ],
        documentation: '/docs/support'
      }
    };
  }

  private static getValidationSuggestions(details: any): string[] {
    const suggestions: string[] = [];

    if (details.title) {
      suggestions.push('Title must be 3-100 characters long');
    }
    if (details.description) {
      suggestions.push('Description must be 10-2000 characters long');
    }
    if (details.price) {
      suggestions.push('Price must be between $0.01 and $999,999.99');
    }
    if (details.stock) {
      suggestions.push('Stock must be between 0 and 99,999');
    }
    if (details.discount) {
      suggestions.push('Discount must be between 0% and 100%');
    }

    return suggestions;
  }

  private static getSuggestionsForErrorCode(errorCode: string): string[] {
    const suggestionsMap: { [key: string]: string[] } = {
      'VALIDATION_ERROR': [
        'Check your input data',
        'Verify required fields are provided',
        'Ensure data format is correct'
      ],
      'AUTHENTICATION_ERROR': [
        'Check your credentials',
        'Verify your token is valid',
        'Try logging in again'
      ],
      'AUTHORIZATION_ERROR': [
        'Check your permissions',
        'Verify your user role',
        'Contact administrator'
      ],
      'NOT_FOUND_ERROR': [
        'Check if the resource exists',
        'Verify the resource ID',
        'Check your access permissions'
      ],
      'BUSINESS_LOGIC_ERROR': [
        'Check business rules',
        'Verify data constraints',
        'Review operation requirements'
      ]
    };

    return suggestionsMap[errorCode] || ['Try again later'];
  }

  private static getDatabaseErrorSuggestions(errorCode: string): string[] {
    const suggestionsMap: { [key: string]: string[] } = {
      'ER_DUP_ENTRY': [
        'The record already exists',
        'Check for duplicate data',
        'Use unique identifiers'
      ],
      'ER_NO_REFERENCED_ROW_2': [
        'Referenced record does not exist',
        'Check foreign key relationships',
        'Verify related data exists'
      ],
      'ER_ROW_IS_REFERENCED_2': [
        'Cannot delete referenced record',
        'Remove dependent records first',
        'Check for related data'
      ]
    };

    return suggestionsMap[errorCode] || ['Check database constraints'];
  }
}
