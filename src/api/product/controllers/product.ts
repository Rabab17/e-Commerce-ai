/**
 * Enhanced product controller with better error handling
 */

import { factories } from '@strapi/strapi';
import { 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError,
  BusinessLogicError 
} from '../../../utils/errors';

export default factories.createCoreController('api::product.product', ({ strapi }) => ({
  /**
   * Create product with enhanced error handling
   */
  async create(ctx) {
    try {
      // Check authentication
      if (!ctx.state.user) {
        throw new AuthenticationError('Authentication required to create products');
      }

      // Check permissions
      const userRole = ctx.state.user.role?.type;
      if (userRole !== 'authenticated' && userRole !== 'admin') {
        throw new AuthorizationError('Insufficient permissions to create products');
      }

      // Validate required fields
      const { data } = ctx.request.body;
      if (!data) {
        throw new ValidationError('Request data is required', {
          field: 'data',
          message: 'Request body must contain data object'
        });
      }

      const result = await super.create(ctx);
      
      // Add success message
      if (ctx.body && typeof ctx.body === 'object') {
        ctx.body = {
          ...ctx.body,
          meta: {
            ...(ctx.body as any).meta,
            message: 'Product created successfully',
            timestamp: new Date().toISOString()
          }
        };
      }

      return result;
    } catch (error) {
      // Re-throw custom errors to be handled by middleware
      if (error instanceof ValidationError || 
          error instanceof AuthenticationError || 
          error instanceof AuthorizationError) {
        throw error;
      }

      // Handle other errors
      strapi.log.error('Product creation error:', {
        error: error.message,
        stack: error.stack,
        user: ctx.state.user?.id,
        data: ctx.request.body
      });
      
      throw new BusinessLogicError('Failed to create product', {
        originalError: error.message,
        operation: 'create_product'
      });
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
          // Check if product and attributes exist before accessing properties
          if (product && product.attributes && 
              product.attributes.price && product.attributes.discount) {
            product.attributes.discountedPrice = 
              product.attributes.price * (1 - product.attributes.discount / 100);
          }
          return product;
        });
      }

      return result;
    } catch (error) {
      strapi.log.error('Product fetch error:', {
        error: error.message,
        stack: error.stack,
        user: ctx.state.user?.id
      });
      
      throw new BusinessLogicError('Failed to fetch products', {
        originalError: error.message,
        operation: 'find_products'
      });
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
        
        // Add related data - check if category exists and has data
        if (result.data.attributes.category && 
            result.data.attributes.category.data && 
            result.data.attributes.category.data.id) {
          try {
            result.data.attributes.category = await strapi
              .service('api::category.category')
              .findOne(result.data.attributes.category.data.id);
          } catch (categoryError) {
            strapi.log.warn('Failed to fetch category data:', categoryError.message);
            // Continue without category data rather than failing the entire request
          }
        }
      }

      return result;
    } catch (error) {
      strapi.log.error('Product fetch error:', {
        error: error.message,
        stack: error.stack,
        user: ctx.state.user?.id,
        productId: ctx.params.id
      });
      
      throw new BusinessLogicError('Failed to fetch product', {
        originalError: error.message,
        operation: 'find_one_product'
      });
    }
  }
}));
