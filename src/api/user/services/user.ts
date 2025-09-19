/**
 * Enhanced user service with role management
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('plugin::users-permissions.user', ({ strapi }) => ({
  /**
   * Get all available roles
   */
  async getAllRoles() {
    try {
      const roles = await strapi.query('plugin::users-permissions.role').findMany({
        select: ['id', 'name', 'description', 'type'],
        orderBy: { name: 'asc' }
      });
      
      return {
        success: true,
        data: roles,
        count: roles.length
      };
    } catch (error) {
      strapi.log.error('Error fetching roles:', error);
      return {
        success: false,
        error: 'Failed to fetch roles',
        message: error.message
      };
    }
  },

  /**
   * Get role by ID
   */
  async getRoleById(roleId: number) {
    try {
      const role = await strapi.query('plugin::users-permissions.role').findOne({
        where: { id: roleId },
        select: ['id', 'name', 'description', 'type'],
        populate: {
          permissions: {
            select: ['id', 'action', 'subject']
          }
        }
      });

      if (!role) {
        return {
          success: false,
          error: 'Role not found'
        };
      }

      return {
        success: true,
        data: role
      };
    } catch (error) {
      strapi.log.error('Error fetching role:', error);
      return {
        success: false,
        error: 'Failed to fetch role',
        message: error.message
      };
    }
  },

  /**
   * Get users by role
   */
  async getUsersByRole(roleId: number) {
    try {
      const users = await strapi.query('plugin::users-permissions.user').findMany({
        where: { role: roleId },
        select: ['id', 'username', 'email', 'confirmed', 'blocked', 'createdAt'],
        populate: {
          role: {
            select: ['id', 'name', 'type']
          }
        }
      });

      return {
        success: true,
        data: users,
        count: users.length
      };
    } catch (error) {
      strapi.log.error('Error fetching users by role:', error);
      return {
        success: false,
        error: 'Failed to fetch users',
        message: error.message
      };
    }
  },

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: number) {
    try {
      const user = await strapi.query('plugin::users-permissions.user').findOne({
        where: { id: userId },
        select: ['id', 'username', 'email'],
        populate: {
          role: {
            select: ['id', 'name', 'type'],
            populate: {
              permissions: {
                select: ['id', 'action', 'subject']
              }
            }
          }
        }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          },
          role: user.role,
          permissions: user.role?.permissions || []
        }
      };
    } catch (error) {
      strapi.log.error('Error fetching user permissions:', error);
      return {
        success: false,
        error: 'Failed to fetch user permissions',
        message: error.message
      };
    }
  },

  /**
   * Create a new role
   */
  async createRole(roleData: { name: string; description?: string; type: string }) {
    try {
      const role = await strapi.query('plugin::users-permissions.role').create({
        data: {
          name: roleData.name,
          description: roleData.description || '',
          type: roleData.type
        }
      });

      return {
        success: true,
        data: role
      };
    } catch (error) {
      strapi.log.error('Error creating role:', error);
      return {
        success: false,
        error: 'Failed to create role',
        message: error.message
      };
    }
  },

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId: number, roleId: number) {
    try {
      const user = await strapi.query('plugin::users-permissions.user').update({
        where: { id: userId },
        data: { role: roleId }
      });

      return {
        success: true,
        data: user
      };
    } catch (error) {
      strapi.log.error('Error assigning role:', error);
      return {
        success: false,
        error: 'Failed to assign role',
        message: error.message
      };
    }
  }
}));
