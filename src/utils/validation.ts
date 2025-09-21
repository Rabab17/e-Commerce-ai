/**
 * Global validation utilities
 */

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ValidationUtils {
  /**
   * Validate required fields
   */
  static validateRequired(data: any, requiredFields: string[]): void {
    const missingFields = requiredFields.filter(field => 
      data[field] === undefined || data[field] === null || data[field] === ''
    );
    
    if (missingFields.length > 0) {
      throw new ValidationError(`Required fields missing: ${missingFields.join(', ')}`);
    }
  }

  /**
   * Validate string length
   */
  static validateStringLength(value: string, min: number, max: number, fieldName: string): void {
    if (value.length < min) {
      throw new ValidationError(`${fieldName} must be at least ${min} characters`, fieldName);
    }
    if (value.length > max) {
      throw new ValidationError(`${fieldName} must not exceed ${max} characters`, fieldName);
    }
  }
  /**
   * Validate number range
   */
  static validateNumberRange(value: number, min: number, max: number, fieldName: string): void {
    if (value < min) {
      throw new ValidationError(`${fieldName} must be at least ${min}`, fieldName);
    }
    if (value > max) {
      throw new ValidationError(`${fieldName} must not exceed ${max}`, fieldName);
    }
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format', 'email');
    }
  }

  /**
   * Validate phone number
   */
  static validatePhone(phone: string): void {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanedPhone = phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
      throw new ValidationError('Invalid phone number format', 'phone');
    }
  }

  /**
   * Validate URL
   */
  static validateUrl(url: string): void {
    try {
      new URL(url);
    } catch {
      throw new ValidationError('Invalid URL format', 'url');
    }
  }

  /**
   * Validate enum value
   */
  static validateEnum(value: string, allowedValues: string[], fieldName: string): void {
    if (!allowedValues.includes(value)) {
      throw new ValidationError(`${fieldName} must be one of: ${allowedValues.join(', ')}`, fieldName);
    }
  }

  /**
   * Validate array length
   */
  static validateArrayLength(array: any[], min: number, max: number, fieldName: string): void {
    if (array.length < min) {
      throw new ValidationError(`${fieldName} must contain at least ${min} items`, fieldName);
    }
    if (array.length > max) {
      throw new ValidationError(`${fieldName} must not exceed ${max} items`, fieldName);
    }
  }

  /**
   * Validate file type
   */
  static validateFileType(filename: string, allowedTypes: string[]): void {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (!extension || !allowedTypes.includes(extension)) {
      throw new ValidationError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`, 'file');
    }
  }

  /**
   * Validate file size
   */
  static validateFileSize(size: number, maxSizeMB: number): void {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (size > maxSizeBytes) {
      throw new ValidationError(`File size must not exceed ${maxSizeMB}MB`, 'file');
    }
  }

  /**
   * Sanitize string
   */
  static sanitizeString(value: string): string {
    return value.trim().replace(/[<>]/g, '');
  }

  /**
   * Sanitize HTML
   */
  static sanitizeHtml(html: string): string {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '');
  }

  /**
   * Round decimal to specified places
   */
  static roundDecimal(value: number, places: number = 2): number {
    return Math.round(value * Math.pow(10, places)) / Math.pow(10, places);
  }

  /**
   * Validate business rules
   */
  static validateBusinessRules(data: any, rules: any[]): string[] {
    const warnings: string[] = [];
    
    rules.forEach(rule => {
      if (rule.condition(data)) {
        warnings.push(rule.message);
      }
    });
    
    return warnings;
  }
}

/**
 * Common validation rules for e-commerce
 */
export const EcommerceValidationRules = {
  // Product validation rules
  product: {
    required: ['title', 'description', 'price', 'stock'],
    title: { minLength: 3, maxLength: 100 },
    description: { minLength: 10, maxLength: 2000 },
    price: { min: 0.01, max: 999999.99 },
    discount: { min: 0, max: 100 },
    stock: { min: 0, max: 99999 },
    sizes: ['s', 'm', 'l', 'xl', 'xxl'],
    gender: ['men', 'women', 'unisex']
  },

  // Order validation rules
  order: {
    required: ['orderNumber', 'totalAmount', 'items'],
    orderNumber: { minLength: 8, maxLength: 20 },
    totalAmount: { min: 0.01, max: 999999.99 },
    trackingNumber: { minLength: 5, maxLength: 50 },
    orderStatus: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    paymentStatus: ['complete', 'pending', 'paid', 'failed', 'refunded']
  },

  // Cart validation rules
  cart: {
    sessionId: { minLength: 10, maxLength: 100 },
    maxItems: 20,
    maxQuantityPerItem: 99
  },

  // Address validation rules
  address: {
    required: ['street', 'city', 'postalCode', 'country'],
    street: { minLength: 5, maxLength: 200 },
    city: { minLength: 2, maxLength: 100 },
    postalCode: { minLength: 5, maxLength: 10 },
    country: { minLength: 2, maxLength: 50 }
  },

  // Review validation rules
  review: {
    required: ['rating'],
    rating: { min: 1, max: 5 },
    comment: { minLength: 10, maxLength: 1000 }
  }
};
