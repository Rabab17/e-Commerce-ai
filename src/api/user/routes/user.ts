/**
 * Enhanced user routes with role management
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/users/roles',
      handler: 'user.getRoles',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/users/roles/:id',
      handler: 'user.getRoleById',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/users/by-role/:roleId',
      handler: 'user.getUsersByRole',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/users/:id/permissions',
      handler: 'user.getUserPermissions',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/users/roles',
      handler: 'user.createRole',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/users/:id/assign-role',
      handler: 'user.assignRole',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
