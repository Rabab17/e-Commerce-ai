/**
 * Enhanced cart controller with comprehensive error handling
 */

import { factories } from '@strapi/strapi';
import { 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError,
  BusinessLogicError 
} from '../../../utils/errors';

export default factories.createCoreController('api::cart.cart', ({ strapi }) => ({
  /**
   * Create cart with enhanced error handling
   */
  async create(ctx) {
    try {
      // Check authentication
      if (!ctx.state.user) {
        throw new AuthenticationError('Authentication required to create carts');
      }

      // Validate request body structure and cart fields (detailed)
      const { data } = ctx.request.body;
      if (!data) {
        throw new ValidationError('Validation failed', { data: ['is required'] });
      }

      ctx.validateRequestAt('data', {
        sessionId: { required: true, minLength: 10, maxLength: 100 },
        items: { required: true, isArray: true, minItems: 1 }
      });

      const result = await super.create(ctx);
      
      // Add success message
      if (ctx.body && typeof ctx.body === 'object') {
        ctx.body = {
          ...ctx.body,
          meta: {
            ...(ctx.body as any).meta,
            message: 'Cart created successfully',
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
      strapi.log.error('Cart creation error:', {
        error: error.message,
        stack: error.stack,
        user: ctx.state.user?.id,
        data: ctx.request.body
      });
      
      throw new BusinessLogicError('Failed to create cart', {
        originalError: error.message,
        operation: 'create_cart'
      });
    }
  },

  /**
   * Update cart with enhanced error handling
   */
  async update(ctx) {
    try {
      // Check authentication
      if (!ctx.state.user) {
        throw new AuthenticationError('Authentication required to update carts');
      }

      if (ctx.request.body && ctx.request.body.data) {
        ctx.validateRequestAt('data', {
          items: { isArray: true, minItems: 1 }
        });
      }

      const result = await super.update(ctx);
      
      // Add success message
      if (ctx.body && typeof ctx.body === 'object') {
        ctx.body = {
          ...ctx.body,
          meta: {
            ...(ctx.body as any).meta,
            message: 'Cart updated successfully',
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
      strapi.log.error('Cart update error:', {
        error: error.message,
        stack: error.stack,
        user: ctx.state.user?.id,
        cartId: ctx.params.id
      });
      
      throw new BusinessLogicError('Failed to update cart', {
        originalError: error.message,
        operation: 'update_cart'
      });
    }
  },

  /**
   * Delete cart with enhanced error handling
   */
  async delete(ctx) {
    try {
      // Check authentication
      if (!ctx.state.user) {
        throw new AuthenticationError('Authentication required to delete carts');
      }

      const result = await super.delete(ctx);
      
      return {
        data: null,
        meta: {
          message: 'Cart deleted successfully',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      // Re-throw custom errors to be handled by middleware
      if (error instanceof ValidationError || 
          error instanceof AuthenticationError || 
          error instanceof AuthorizationError) {
        throw error;
      }

      // Handle other errors
      strapi.log.error('Cart deletion error:', {
        error: error.message,
        stack: error.stack,
        user: ctx.state.user?.id,
        cartId: ctx.params.id
      });
      
      throw new BusinessLogicError('Failed to delete cart', {
        originalError: error.message,
        operation: 'delete_cart'
      });
    }
  },

  /**
   * Get carts with enhanced filtering
   */
  async find(ctx) {
    try {
      const result = await super.find(ctx);
      return result;
    } catch (error) {
      strapi.log.error('Cart fetch error:', {
        error: error.message,
        stack: error.stack,
        user: ctx.state.user?.id
      });
      
      throw new BusinessLogicError('Failed to fetch carts', {
        originalError: error.message,
        operation: 'find_carts'
      });
    }
  },

  /**
   * Get single cart with enhanced data
   */
  async findOne(ctx) {
    try {
      const result = await super.findOne(ctx);
      return result;
    } catch (error) {
      strapi.log.error('Cart fetch error:', {
        error: error.message,
        stack: error.stack,
        user: ctx.state.user?.id,
        cartId: ctx.params.id
      });
      
      throw new BusinessLogicError('Failed to fetch cart', {
        originalError: error.message,
        operation: 'find_one_cart'
      });
    }
  }
}));
