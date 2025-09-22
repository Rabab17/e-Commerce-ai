/**
 * Enhanced user controller with role management and standardized error handling
 */

import { factories } from '@strapi/strapi';
import { 
  ValidationError, 
  AuthenticationError, 
  AuthorizationError, 
  NotFoundError,
  BusinessLogicError 
} from '../../../utils/errors';

export default factories.createCoreController('plugin::users-permissions.user', ({ strapi }) => ({
  /**
   * Get all roles
   * GET /api/users/roles
   */
  async getRoles(ctx) {
    try {
      const result = await strapi.service('plugin::users-permissions.user').getAllRoles();
      
      if (result.success) {
        ctx.body = {
          data: result.data,
          meta: {
            count: result.count,
            timestamp: new Date().toISOString()
          }
        };
      } else {
        throw new BusinessLogicError(result.error, {
          operation: 'get_all_roles'
        });
      }
    } catch (error) {
      // Re-throw custom errors to be handled by middleware
      if (error instanceof BusinessLogicError) {
        throw error;
      }

      // Handle other errors
      strapi.log.error('Get roles error:', {
        error: error.message,
        stack: error.stack,
        user: ctx.state.user?.id
      });
      
      throw new BusinessLogicError('Failed to fetch roles', {
        originalError: error.message,
        operation: 'get_all_roles'
      });
    }
  },

  /**
   * Get role by ID
   * GET /api/users/roles/:id
   */
  async getRoleById(ctx) {
    try {
      const { id } = ctx.params;
      
      if (!id) {
        throw new ValidationError('Role ID is required', {
          field: 'id',
          message: 'Role ID must be provided in URL parameters'
        });
      }

      const result = await strapi.service('plugin::users-permissions.user').getRoleById(id);
      
      if (result.success) {
        ctx.body = {
          data: result.data,
          meta: {
            timestamp: new Date().toISOString()
          }
        };
      } else {
        throw new NotFoundError(result.error);
      }
    } catch (error) {
      // Re-throw custom errors to be handled by middleware
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }

      // Handle other errors
      strapi.log.error('Get role by ID error:', {
        error: error.message,
        stack: error.stack,
        user: ctx.state.user?.id,
        roleId: ctx.params.id
      });
      
      throw new BusinessLogicError('Failed to fetch role', {
        originalError: error.message,
        operation: 'get_role_by_id'
      });
    }
  },

  /**
   * Get users by role
   * GET /api/users/by-role/:roleId
   */
  async getUsersByRole(ctx) {
    try {
      const { roleId } = ctx.params;
      const result = await strapi.service('plugin::users-permissions.user').getUsersByRole(roleId);
      
      if (result.success) {
        ctx.body = {
          data: result.data,
          meta: {
            count: result.count
          }
        };
      } else {
        throw new BusinessLogicError(result.error, { operation: 'get_users_by_role', roleId });
      }
    } catch (error) {
      throw new BusinessLogicError('Failed to fetch users by role', {
        originalError: error.message,
        operation: 'get_users_by_role',
        roleId: ctx.params.roleId
      });
    }
  },

  /**
   * Get user permissions
   * GET /api/users/:id/permissions
   */
  async getUserPermissions(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.service('plugin::users-permissions.user').getUserPermissions(id);
      
      if (result.success) {
        ctx.body = {
          data: result.data
        };
      } else {
        throw new NotFoundError(result.error);
      }
    } catch (error) {
      throw new BusinessLogicError('Failed to fetch user permissions', {
        originalError: error.message,
        operation: 'get_user_permissions',
        userId: ctx.params.id
      });
    }
  },

  /**
   * Create new role
   * POST /api/users/roles
   */
  async createRole(ctx) {
    try {
      const { name, description, type } = ctx.request.body;
      
      if (!name || !type) {
        throw new ValidationError('Validation failed', {
          name: !name ? ['is required'] : undefined,
          type: !type ? ['is required'] : undefined
        });
      }

      const result = await strapi.service('plugin::users-permissions.user').createRole({
        name,
        description,
        type
      });
      
      if (result.success) {
        ctx.body = {
          data: result.data
        };
        ctx.status = 201;
      } else {
        throw new BusinessLogicError(result.error, { operation: 'create_role' });
      }
    } catch (error) {
      throw new BusinessLogicError('Failed to create role', {
        originalError: error.message,
        operation: 'create_role'
      });
    }
  },

  /**
   * Assign role to user
   * PUT /api/users/:id/assign-role
   */
  async assignRole(ctx) {
    try {
      const { id } = ctx.params;
      const { roleId } = ctx.request.body;
      
      if (!roleId) {
        throw new ValidationError('Validation failed', {
          roleId: ['is required']
        });
      }

      const result = await strapi.service('plugin::users-permissions.user').assignRoleToUser(id, roleId);
      
      if (result.success) {
        ctx.body = {
          data: result.data
        };
      } else {
        throw new BusinessLogicError(result.error, { operation: 'assign_role', userId: id, roleId });
      }
    } catch (error) {
      throw new BusinessLogicError('Failed to assign role', {
        originalError: error.message,
        operation: 'assign_role',
        userId: ctx.params.id
      });
    }
  }
}));
