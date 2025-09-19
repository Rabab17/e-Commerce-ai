/**
 * product service
 */

import { factories } from '@strapi/strapi';
import validationService from './validation';

export default factories.createCoreService('api::product.product', ({ strapi }) => ({
  /**
   * Create a product with validation
   */
  async create(params) {
    const { data } = params;
    
    // Validate and sanitize data
    await validationService.validateProductData(data, 'create');
    const sanitizedData = validationService.sanitizeProductData(data);
    
    // Check business rules
    const warnings = await validationService.validateBusinessRules(sanitizedData);
    if (warnings.length > 0) {
      strapi.log.warn(`Product creation warnings: ${warnings.join(', ')}`);
    }

    // Create the product
    const result = await super.create({ ...params, data: sanitizedData });
    
    return result;
  },

  /**
   * Update a product with validation
   */
  async update(entityId, params) {
    const { data } = params;
    
    // Validate and sanitize data
    await validationService.validateProductData(data, 'update');
    const sanitizedData = validationService.sanitizeProductData(data);
    
    // Check business rules
    const warnings = await validationService.validateBusinessRules(sanitizedData);
    if (warnings.length > 0) {
      strapi.log.warn(`Product update warnings: ${warnings.join(', ')}`);
    }

    // Update the product
    const result = await super.update(entityId, { ...params, data: sanitizedData });
    
    return result;
  },

  /**
   * Get products with enhanced filtering
   */
  async find(params) {
    const { filters = {} } = params;
    
    // Add default filters for published products
    const enhancedFilters = {
      ...filters,
      publishedAt: { $notNull: true }
    };

    return super.find({ ...params, filters: enhancedFilters });
  },

  /**
   * Get a single product with validation
   */
  async findOne(entityId, params) {
    const product = await super.findOne(entityId, params);
    
    if (!product) {
      throw new Error('Product not found');
    }

    // Add computed fields
    if (product.price && product.discount) {
      product.discountedPrice = product.price * (1 - product.discount / 100);
    }

    return product;
  }
}));
