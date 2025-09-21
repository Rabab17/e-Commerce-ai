/**
 * Custom validation service for Product
 */

import { Core } from '@strapi/strapi';

interface ProductData {
  title?: string;
  description?: string;
  price?: number;
  discount?: number;
  stock?: number;
  sizes?: string;
  images?: any[];
  aiTags?: any;
  aiDescription?: string;
  aiRecommendations?: any;
  vectorEmbedding?: any;
}

export default {
  /**
   * Validate product data before creation/update
   */
  async validateProductData(data: ProductData, action: 'create' | 'update' = 'create') {
    const errors: string[] = [];

    // Title validation
    if (data.title !== undefined) {
      if (!data.title || data.title.trim().length < 3) {
        errors.push('Title must be at least 3 characters long');
      }
      if (data.title.length > 100) {
        errors.push('Title must not exceed 100 characters');
      }
    }

    // Description validation
    if (data.description !== undefined) {
      if (!data.description || data.description.trim().length < 10) {
        errors.push('Description must be at least 10 characters long');
      }
      if (data.description.length > 2000) {
        errors.push('Description must not exceed 2000 characters');
      }
    }

    // Price validation
    if (data.price !== undefined) {
      if (data.price < 0.01) {
        errors.push('Price must be at least $0.01');
      }
      if (data.price > 999999.99) {
        errors.push('Price must not exceed $999,999.99');
      }
    }

    // Discount validation
    if (data.discount !== undefined) {
      if (data.discount < 0) {
        errors.push('Discount cannot be negative');
      }
      if (data.discount > 100) {
        errors.push('Discount cannot exceed 100%');
      }
    }

    // Stock validation
    if (data.stock !== undefined) {
      if (data.stock < 0) {
        errors.push('Stock cannot be negative');
      }
      if (data.stock > 99999) {
        errors.push('Stock cannot exceed 99,999 units');
      }
    }

    // Size validation
    if (data.sizes !== undefined) {
      const validSizes = ['s', 'm', 'l', 'xl', 'xxl'];
      if (!validSizes.includes(data.sizes.toLowerCase())) {
        errors.push('Size must be one of: s, m, l, xl, xxl');
      }
    }

    // Images validation
    if (data.images !== undefined) {
      if (Array.isArray(data.images) && data.images.length === 0) {
        errors.push('At least one image is required');
      }
      if (Array.isArray(data.images) && data.images.length > 10) {
        errors.push('Maximum 10 images allowed per product');
      }
    }

    // AI Tags validation
    if (data.aiTags !== undefined && data.aiTags !== null) {
      if (typeof data.aiTags !== 'object' || Array.isArray(data.aiTags)) {
        errors.push('AI Tags must be a valid JSON object');
      }
    }

    // AI Description validation
    if (data.aiDescription !== undefined) {
      if (data.aiDescription && data.aiDescription.length > 1000) {
        errors.push('AI Description must not exceed 1000 characters');
      }
    }

    // AI Recommendations validation
    if (data.aiRecommendations !== undefined && data.aiRecommendations !== null) {
      if (typeof data.aiRecommendations !== 'object' || Array.isArray(data.aiRecommendations)) {
        errors.push('AI Recommendations must be a valid JSON object');
      }
    }

    // Vector Embedding validation
    if (data.vectorEmbedding !== undefined && data.vectorEmbedding !== null) {
      if (!Array.isArray(data.vectorEmbedding)) {
        errors.push('Vector Embedding must be an array');
      }
      if (Array.isArray(data.vectorEmbedding) && data.vectorEmbedding.length === 0) {
        errors.push('Vector Embedding cannot be empty');
      }
    }

    // Business logic validation
    if (data.price && data.discount) {
      const discountedPrice = data.price * (1 - data.discount / 100);
      if (discountedPrice < 0.01) {
        errors.push('Discounted price cannot be less than $0.01');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return true;
  },

  /**
   * Validate product for business rules
   */
  async validateBusinessRules(data: ProductData) {
    const warnings: string[] = [];

    // Check if product is out of stock
    if (data.stock === 0) {
      warnings.push('Product is out of stock');
    }

    // Check if discount is too high
    if (data.discount && data.discount > 50) {
      warnings.push('High discount detected (>50%)');
    }

    // Check if price is suspiciously low
    if (data.price && data.price < 1) {
      warnings.push('Very low price detected (<$1)');
    }

    return warnings;
  },

  /**
   * Sanitize product data
   */
  sanitizeProductData(data: ProductData): ProductData {
    const sanitized = { ...data };

    // Sanitize title
    if (sanitized.title) {
      sanitized.title = sanitized.title.trim();
    }

    // Sanitize description
    if (sanitized.description) {
      sanitized.description = sanitized.description.trim();
    }

    // Round price to 2 decimal places
    if (sanitized.price) {
      sanitized.price = Math.round(sanitized.price * 100) / 100;
    }

    // Round discount to 2 decimal places
    if (sanitized.discount) {
      sanitized.discount = Math.round(sanitized.discount * 100) / 100;
    }

    // Ensure stock is integer
    if (sanitized.stock) {
      sanitized.stock = Math.floor(sanitized.stock);
    }

    // Sanitize AI description
    if (sanitized.aiDescription) {
      sanitized.aiDescription = sanitized.aiDescription.trim();
    }

    return sanitized;
  }
};
