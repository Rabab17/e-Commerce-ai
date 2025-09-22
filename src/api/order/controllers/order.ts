/**
 * Enhanced order controller with comprehensive error handling
 */

import { factories } from '@strapi/strapi';
import { 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError,
  BusinessLogicError 
} from '../../../utils/errors';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  /**
   * Create order with enhanced error handling
   */
  async create(ctx) {
    try {
      // Check authentication
      if (!ctx.state.user) {
        throw new AuthenticationError('Authentication required to create orders');
      }

      // Validate request body structure and order fields (detailed)
      const { data } = ctx.request.body;
      if (!data) {
        throw new ValidationError('Validation failed', { data: ['is required'] });
      }

      ctx.validateRequestAt('data', {
        orderNumber: { required: true, minLength: 8, maxLength: 20 },
        totalAmount: { required: true, min: 0.01, max: 999999.99 },
        items: { required: true, isArray: true, minItems: 1 },
        orderStatus: { enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] },
        paymentStatus: { enum: ['complete', 'pending', 'paid', 'failed', 'refunded'] }
      });

      // Validate order data
      if (!data.orderNumber) {
        throw new ValidationError('Order number is required', {
          field: 'orderNumber',
          message: 'Order number must be provided'
        });
      }

      if (!data.totalAmount || data.totalAmount <= 0) {
        throw new ValidationError('Valid total amount is required', {
          field: 'totalAmount',
          message: 'Total amount must be greater than 0'
        });
      }

      const result = await super.create(ctx);
      
      // Add success message
      if (ctx.body && typeof ctx.body === 'object') {
        ctx.body = {
          ...ctx.body,
          meta: {
            ...(ctx.body as any).meta,
            message: 'Order created successfully',
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
      strapi.log.error('Order creation error:', {
        error: error.message,
        stack: error.stack,
        user: ctx.state.user?.id,
        data: ctx.request.body
      });
      
      throw new BusinessLogicError('Failed to create order', {
        originalError: error.message,
        operation: 'create_order'
      });
    }
  },

  /**
   * Update order with enhanced error handling
   */
  async update(ctx) {
    try {
      // Check authentication
      if (!ctx.state.user) {
        throw new AuthenticationError('Authentication required to update orders');
      }

      // Optional: validate updates if payload is present
      if (ctx.request.body && ctx.request.body.data) {
        ctx.validateRequestAt('data', {
          totalAmount: { min: 0.01, max: 999999.99 },
          orderStatus: { enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'] },
          paymentStatus: { enum: ['complete', 'pending', 'paid', 'failed', 'refunded'] }
        });
      }

      const result = await super.update(ctx);
      
      // Add success message
      if (ctx.body && typeof ctx.body === 'object') {
        ctx.body = {
          ...ctx.body,
          meta: {
            ...(ctx.body as any).meta,
            message: 'Order updated successfully',
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
      strapi.log.error('Order update error:', {
        error: error.message,
        stack: error.stack,
        user: ctx.state.user?.id,
        orderId: ctx.params.id
      });
      
      throw new BusinessLogicError('Failed to update order', {
        originalError: error.message,
        operation: 'update_order'
      });
    }
  },

  /**
   * Delete order with enhanced error handling
   */
  async delete(ctx) {
    try {
      // Check authentication
      if (!ctx.state.user) {
        throw new AuthenticationError('Authentication required to delete orders');
      }

      const result = await super.delete(ctx);
      
      return {
        data: null,
        meta: {
          message: 'Order deleted successfully',
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
      strapi.log.error('Order deletion error:', {
        error: error.message,
        stack: error.stack,
        user: ctx.state.user?.id,
        orderId: ctx.params.id
      });
      
      throw new BusinessLogicError('Failed to delete order', {
        originalError: error.message,
        operation: 'delete_order'
      });
    }
  },

  /**
   * Get orders with enhanced filtering
   */
  async find(ctx) {
    try {
      const result = await super.find(ctx);
      return result;
    } catch (error) {
      strapi.log.error('Order fetch error:', {
        error: error.message,
        stack: error.stack,
        user: ctx.state.user?.id
      });
      
      throw new BusinessLogicError('Failed to fetch orders', {
        originalError: error.message,
        operation: 'find_orders'
      });
    }
  },

  /**
   * Get single order with enhanced data
   */
  async findOne(ctx) {
    try {
      const result = await super.findOne(ctx);
      return result;
    } catch (error) {
      strapi.log.error('Order fetch error:', {
        error: error.message,
        stack: error.stack,
        user: ctx.state.user?.id,
        orderId: ctx.params.id
      });
      
      throw new BusinessLogicError('Failed to fetch order', {
        originalError: error.message,
        operation: 'find_one_order'
      });
    }
  }
}));
