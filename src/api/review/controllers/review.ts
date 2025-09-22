/**
 * review controller
 */

import { factories } from '@strapi/strapi'
import { ValidationError, AuthenticationError, AuthorizationError, BusinessLogicError } from '../../../utils/errors';

export default factories.createCoreController('api::review.review', ({ strapi }) => ({
  async create(ctx) {
    try {
      if (!ctx.state.user) {
        throw new AuthenticationError('Authentication required to create reviews');
      }

      const { data } = ctx.request.body;
      if (!data) {
        throw new ValidationError('Validation failed', { data: ['is required'] });
      }

      ctx.validateRequestAt('data', {
        rating: { required: true, min: 1, max: 5 },
        comment: { minLength: 10, maxLength: 1000 }
      });

      const result = await super.create(ctx);
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AuthenticationError || error instanceof AuthorizationError) {
        throw error;
      }
      strapi.log.error('Review creation error:', error);
      throw new BusinessLogicError('Failed to create review', { originalError: error.message });
    }
  }
}));
