/**
 * address controller
 */

import { factories } from '@strapi/strapi'
import { ValidationError, AuthenticationError, BusinessLogicError } from '../../../utils/errors';

export default factories.createCoreController('api::address.address', ({ strapi }) => ({
  async create(ctx) {
    try {
      if (!ctx.state.user) {
        throw new AuthenticationError('Authentication required to create addresses');
      }

      const { data } = ctx.request.body;
      if (!data) {
        throw new ValidationError('Validation failed', { data: ['is required'] });
      }

      ctx.validateRequestAt('data', {
        street: { required: true, minLength: 5, maxLength: 200 },
        city: { required: true, minLength: 2, maxLength: 100 },
        postalCode: { required: true, minLength: 5, maxLength: 10 },
        country: { required: true, minLength: 2, maxLength: 50 }
      });

      const result = await super.create(ctx);
      return result;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        throw error;
      }
      strapi.log.error('Address creation error:', error);
      throw new BusinessLogicError('Failed to create address', { originalError: error.message });
    }
  }
}));
