/**
 * Enhanced user controller with role management
 */

import { factories } from '@strapi/strapi';

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
            count: result.count
          }
        };
      } else {
        ctx.throw(400, result.error);
      }
    } catch (error) {
      ctx.throw(500, 'Internal server error');
    }
  },

  /**
   * Get role by ID
   * GET /api/users/roles/:id
   */
  async getRoleById(ctx) {
    try {
      const { id } = ctx.params;
      const result = await strapi.service('plugin::users-permissions.user').getRoleById(id);
      
      if (result.success) {
        ctx.body = {
          data: result.data
        };
      } else {
        ctx.throw(404, result.error);
      }
    } catch (error) {
      ctx.throw(500, 'Internal server error');
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
        ctx.throw(400, result.error);
      }
    } catch (error) {
      ctx.throw(500, 'Internal server error');
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
        ctx.throw(404, result.error);
      }
    } catch (error) {
      ctx.throw(500, 'Internal server error');
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
        ctx.throw(400, 'Name and type are required');
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
        ctx.throw(400, result.error);
      }
    } catch (error) {
      ctx.throw(500, 'Internal server error');
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
        ctx.throw(400, 'Role ID is required');
      }

      const result = await strapi.service('plugin::users-permissions.user').assignRoleToUser(id, roleId);
      
      if (result.success) {
        ctx.body = {
          data: result.data
        };
      } else {
        ctx.throw(400, result.error);
      }
    } catch (error) {
      ctx.throw(500, 'Internal server error');
    }
  }
}));
