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
import { ImageProcessor, imageProcessingMiddleware } from '../../../utils/image-processing';

export default factories.createCoreController('api::product.product', ({ strapi }) => ({
  /**
   * Get Cloudinary cloud name safely
   */
  getCloudinaryCloudName(): string | null {
    try {
      const cloudName = strapi.config.get('plugin.upload.providerOptions.cloud_name') as string;
      return cloudName && typeof cloudName === 'string' ? cloudName : null;
    } catch (error) {
      strapi.log.warn('Failed to get Cloudinary cloud name:', error.message);
      return null;
    }
  },
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

      // Validate request body structure and product fields (detailed)
      const { data } = ctx.request.body;
      if (!data) {
        throw new ValidationError('Validation failed', { data: ['is required'] });
      }

      // Detailed validation using global validation middleware
      // Validate mandatory fields presence and constraints
      ctx.validateRequestAt('data', {
        title: { required: true, minLength: 3, maxLength: 100 },
        description: { required: true, minLength: 10, maxLength: 2000 },
        price: { required: true, min: 0.01, max: 999999.99 },
        stock: { required: true, min: 0, max: 99999 },
        discount: { min: 0, max: 100 },
      });

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
        throw new AuthenticationError('Authentication required');
      }

      // Check permissions
      const userRole = ctx.state.user.role?.type;
      if (userRole !== 'authenticated' && userRole !== 'admin') {
        throw new AuthorizationError('Insufficient permissions');
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
      if (error instanceof ValidationError || error instanceof AuthenticationError || error instanceof AuthorizationError) {
        throw error;
      }
      throw new BusinessLogicError('Failed to update product', {
        originalError: error.message,
        operation: 'update_product',
        productId: ctx.params.id
      });
    }
  },

  /**
   * Delete product with enhanced error handling
   */
  async delete(ctx) {
    try {
      // Check authentication
      if (!ctx.state.user) {
        throw new AuthenticationError('Authentication required');
      }

      // Check permissions
      const userRole = ctx.state.user.role?.type;
      if (userRole !== 'authenticated' && userRole !== 'admin') {
        throw new AuthorizationError('Insufficient permissions');
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
      if (error instanceof ValidationError || error instanceof AuthenticationError || error instanceof AuthorizationError) {
        throw error;
      }
      throw new BusinessLogicError('Failed to delete product', {
        originalError: error.message,
        operation: 'delete_product',
        productId: ctx.params.id
      });
    }
  },

  /**
   * Get products with enhanced filtering and image processing
   */
  async find(ctx) {
    try {
      const result = await super.find(ctx);
      
      // Get Cloudinary cloud name from environment
      const cloudName = this.getCloudinaryCloudName();
      
      // Add computed fields and process images for each product
      if (result.data && Array.isArray(result.data)) {
        result.data = result.data.map(product => {
          // Check if product and attributes exist before accessing properties
          if (product && product.attributes) {
            // Add discounted price calculation
            if (product.attributes.price && product.attributes.discount) {
              product.attributes.discountedPrice = 
                product.attributes.price * (1 - product.attributes.discount / 100);
            }
            
            // Process images if they exist and cloudName is valid
            if (product.attributes.images && Array.isArray(product.attributes.images) && cloudName) {
              try {
                product.attributes.images = ImageProcessor.processImages(
                  product.attributes.images,
                  cloudName
                );
              } catch (imageError) {
                strapi.log.warn('Image processing error:', imageError.message);
                // Continue without processed images rather than failing the entire request
              }
            }
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
   * Get single product with enhanced data and image processing
   */
  async findOne(ctx) {
    try {
      const result = await super.findOne(ctx);
      
      if (result.data && result.data.attributes) {
        // Get Cloudinary cloud name from environment
        const cloudName = this.getCloudinaryCloudName();
        
        // Add computed fields
        if (result.data.attributes.price && result.data.attributes.discount) {
          result.data.attributes.discountedPrice = 
            result.data.attributes.price * (1 - result.data.attributes.discount / 100);
        }
        
        // Process images if they exist and cloudName is valid
        if (result.data.attributes.images && Array.isArray(result.data.attributes.images) && cloudName) {
          try {
            result.data.attributes.images = ImageProcessor.processImages(
              result.data.attributes.images,
              cloudName
            );
          } catch (imageError) {
            strapi.log.warn('Image processing error:', imageError.message);
            // Continue without processed images rather than failing the entire request
          }
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
