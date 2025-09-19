/**
 * Enhanced product controller with better error handling
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::product.product', ({ strapi }) => ({
  /**
   * Create product with enhanced error handling
   */
  async create(ctx) {
    try {
      // Check authentication
      if (!ctx.state.user) {
        return ctx.unauthorized('Authentication required');
      }

      // Check permissions
      const userRole = ctx.state.user.role?.type;
      if (userRole !== 'authenticated' && userRole !== 'admin') {
        return ctx.forbidden('Insufficient permissions');
      }

      const result = await super.create(ctx);
      
      // Add success message
      if (ctx.body && typeof ctx.body === 'object') {
        ctx.body = {
          ...ctx.body,
          meta: {
            ...(ctx.body as any).meta,
            message: 'Product created successfully'
          }
        };
      }

      return result;
    } catch (error) {
      strapi.log.error('Product creation error:', error);
      
      if (error.message.includes('Validation failed')) {
        return ctx.badRequest(error.message);
      }
      
      return ctx.internalServerError('Failed to create product');
    }
  },

  /**
   * Update product with enhanced error handling
   */
  async update(ctx) {
    try {
      // Check authentication
      if (!ctx.state.user) {
        return ctx.unauthorized('Authentication required');
      }

      // Check permissions
      const userRole = ctx.state.user.role?.type;
      if (userRole !== 'authenticated' && userRole !== 'admin') {
        return ctx.forbidden('Insufficient permissions');
      }

      const result = await super.update(ctx);
      
      // Add success message
      if (ctx.body && typeof ctx.body === 'object') {
        ctx.body = {
          ...ctx.body,
          meta: {
            ...(ctx.body as any).meta,
            message: 'Product updated successfully'
          }
        };
      }

      return result;
    } catch (error) {
      strapi.log.error('Product update error:', error);
      
      if (error.message.includes('Validation failed')) {
        return ctx.badRequest(error.message);
      }
      
      return ctx.internalServerError('Failed to update product');
    }
  },

  /**
   * Delete product with enhanced error handling
   */
  async delete(ctx) {
    try {
      // Check authentication
      if (!ctx.state.user) {
        return ctx.unauthorized('Authentication required');
      }

      // Check permissions
      const userRole = ctx.state.user.role?.type;
      if (userRole !== 'authenticated' && userRole !== 'admin') {
        return ctx.forbidden('Insufficient permissions');
      }

      const result = await super.delete(ctx);
      
      return {
        data: null,
        meta: {
          message: 'Product deleted successfully'
        }
      };
    } catch (error) {
      strapi.log.error('Product deletion error:', error);
      return ctx.internalServerError('Failed to delete product');
    }
  },

  /**
   * Get products with enhanced filtering
   */
  async find(ctx) {
    try {
      const result = await super.find(ctx);
      
      // Add computed fields to each product
      if (result.data && Array.isArray(result.data)) {
        result.data = result.data.map(product => {
          if (product.attributes.price && product.attributes.discount) {
            product.attributes.discountedPrice = 
              product.attributes.price * (1 - product.attributes.discount / 100);
          }
          return product;
        });
      }

      return result;
    } catch (error) {
      strapi.log.error('Product fetch error:', error);
      return ctx.internalServerError('Failed to fetch products');
    }
  },

  /**
   * Get single product with enhanced data
   */
  async findOne(ctx) {
    try {
      const result = await super.findOne(ctx);
      
      if (result.data && result.data.attributes) {
        // Add computed fields
        if (result.data.attributes.price && result.data.attributes.discount) {
          result.data.attributes.discountedPrice = 
            result.data.attributes.price * (1 - result.data.attributes.discount / 100);
        }
        
        // Add related data
        if (result.data.attributes.category) {
          result.data.attributes.category = await strapi
            .service('api::category.category')
            .findOne(result.data.attributes.category.data.id);
        }
      }

      return result;
    } catch (error) {
      strapi.log.error('Product fetch error:', error);
      return ctx.internalServerError('Failed to fetch product');
    }
  }
}));
